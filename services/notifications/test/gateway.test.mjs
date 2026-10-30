import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createGateway } from "../gateway.mjs";

const token = "a".repeat(64);

test("rejects encoded bodies and strips untrusted provider headers", async (t) => {
  const calls = [];
  const server = createGateway({
    fetchFn: async (url, options) => {
      calls.push(options);
      return Response.json({ ok: true });
    },
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => {
    server.closeAllConnections();
    return new Promise((resolve) => server.close(resolve));
  });
  const url = `http://127.0.0.1:${server.address().port}/majorTomToGroundControl`;
  const body = JSON.stringify({ os: "ios", token, addresses: [] });
  const encoded = await fetch(url, {
    method: "POST",
    headers: { "Content-Encoding": "gzip" },
    body,
  });
  assert.equal(encoded.status, 415);
  assert.equal(calls.length, 0);
  const plain = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer untrusted",
      "X-Forwarded-For": "127.0.0.1, 1.2.3.4",
    },
    body,
  });
  assert.equal(plain.status, 200);
  assert.deepEqual(calls[0].headers, { "Content-Type": "application/json" });
});

test("forwards the existing iOS registration contract and preserves the upstream response", async (t) => {
  const calls = [];
  const server = createGateway({
    fetchFn: async (url, options) => {
      calls.push({ url, options });
      return new Response('{"registered":true}', { status: 200 });
    },
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => {
    server.closeAllConnections();
    return new Promise((resolve) => server.close(resolve));
  });
  const body = {
    os: "ios",
    token,
    addresses: ["test-address"],
    hashes: [],
    txids: [],
  };
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/majorTomToGroundControl`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { registered: true });
  assert.equal(calls[0].url, "http://127.0.0.1:3001/majorTomToGroundControl");
  assert.deepEqual(JSON.parse(calls[0].options.body), body);
});

test("rejects unsupported providers, malformed tokens, and arbitrary pushes before reaching upstream", async (t) => {
  let calls = 0;
  const server = createGateway({
    fetchFn: async () => {
      calls++;
      return new Response("");
    },
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => {
    server.closeAllConnections();
    return new Promise((resolve) => server.close(resolve));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const [path, body, status] of [
    ["/majorTomToGroundControl", { os: "android", token: "fcm-token" }, 403],
    ["/unsubscribe", { os: "ios", token: "" }, 400],
    ["/enqueue", { os: "ios", token, type: 5, text: "arbitrary message" }, 400],
    ["/lightningInvoiceGotSettled", { os: "ios", token }, 404],
  ]) {
    const response = await fetch(base + path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    assert.equal(response.status, status);
  }
  assert.equal(calls, 0);
});

test("exposes readiness without publishing subscription or delivery statistics", async (t) => {
  const server = createGateway({
    fetchFn: async () => Response.json({ send_queue_size: 42, sent_24h: 100 }),
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => {
    server.closeAllConnections();
    return new Promise((resolve) => server.close(resolve));
  });
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/ping`,
  );
  assert.deepEqual(await response.json(), {
    service: "PurityWallet notifications",
    status: "ok",
  });
});

test("bounds registration request size and converts upstream failures into unavailable responses", async (t) => {
  let calls = 0;
  const server = createGateway({
    fetchFn: async () => {
      calls++;
      throw new Error("connection refused");
    },
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => {
    server.closeAllConnections();
    return new Promise((resolve) => server.close(resolve));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const large = await fetch(base + "/majorTomToGroundControl", {
    method: "POST",
    body: "x".repeat(131073),
  });
  assert.equal(large.status, 413);
  const unavailable = await fetch(base + "/ping");
  assert.equal(unavailable.status, 503);
  assert.equal(calls, 1);
});
