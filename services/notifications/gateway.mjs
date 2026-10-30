import { createServer } from "node:http";
import { isIP } from "node:net";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const paths = new Set([
  "/majorTomToGroundControl",
  "/getTokenConfiguration",
  "/setTokenConfiguration",
  "/unsubscribe",
  "/enqueue",
]);
const bodyLimit = 128 * 1024;

export function createGateway({
  upstream = "http://127.0.0.1:3001",
  allowAndroid = false,
  fetchFn = fetch,
} = {}) {
  const server = createServer(async (request, response) => {
    response.setHeader("Content-Type", "application/json");
    response.setHeader("X-Content-Type-Options", "nosniff");
    const reply = (status, message) => {
      response.writeHead(status);
      response.end(JSON.stringify({ error: message }));
    };
    if (request.method === "GET" && request.url === "/ping") {
      try {
        const health = await fetchFn(`${upstream}/ping`, {
          signal: AbortSignal.timeout(5000),
        });
        if (!health.ok) return reply(503, "Notification service unavailable");
        response.end(
          JSON.stringify({
            service: "PurityWallet notifications",
            status: "ok",
          }),
        );
      } catch {
        reply(503, "Notification service unavailable");
      }
      return;
    }
    if (request.method !== "POST" || !paths.has(request.url))
      return reply(404, "Not found");
    if (request.headers["content-encoding"])
      return reply(415, "Encoded request bodies are not accepted");
    let size = 0;
    let chunks = [];
    try {
      for await (const chunk of request) {
        size += chunk.length;
        if (size > bodyLimit) chunks = [];
        else chunks.push(chunk);
      }
    } catch {
      return;
    }
    if (size > bodyLimit) return reply(413, "Request too large");
    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return reply(400, "Invalid JSON");
    }
    if (!body || typeof body !== "object" || Array.isArray(body))
      return reply(400, "Invalid notification request");
    if (body.os !== "ios" && !(allowAndroid && body.os === "android"))
      return reply(403, "Notification provider unavailable");
    if (
      typeof body.token !== "string" ||
      !body.token ||
      body.token.length > 255 ||
      (body.os === "ios" && !/^[a-f0-9]{64}$/i.test(body.token))
    ) {
      return reply(400, "Invalid push identity");
    }
    for (const field of ["addresses", "hashes", "txids"]) {
      if (
        body[field] !== undefined &&
        (!Array.isArray(body[field]) ||
          body[field].length > 1000 ||
          body[field].some(
            (value) => typeof value !== "string" || value.length > 255,
          ))
      ) {
        return reply(400, "Invalid subscription list");
      }
    }
    if (
      request.url === "/enqueue" &&
      (body.type !== 5 || body.text !== "Test push notification")
    )
      return reply(400, "Only device test notifications are accepted");
    const headers = { "Content-Type": "application/json" };
    const address = request.headers["x-forwarded-for"];
    if (typeof address === "string" && isIP(address))
      headers["X-Forwarded-For"] = address;
    try {
      const result = await fetchFn(upstream + request.url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
      const payload = await result.text();
      response.writeHead(result.status);
      response.end(payload);
    } catch {
      reply(503, "Notification service unavailable");
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return server;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  createGateway({
    allowAndroid: process.env.PURITY_ANDROID_PUSH_ENABLED === "1",
  }).listen(3010, "127.0.0.1");
}
