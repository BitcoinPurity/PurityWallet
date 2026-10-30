import assert from "node:assert/strict";
import { createPublicKey, generateKeyPairSync } from "node:crypto";
import test from "node:test";
import { environmentFor } from "../bootstrap.mjs";

const config = {
  APPLE_TEAM_ID: "C6GG2LAC96",
  APNS_TOPIC: "au.com.bitcoininstitute.puritywallet",
  APNS_P8_KID: "TESTKEY123",
  PURITY_ANDROID_PUSH_ENABLED: "0",
};
const key = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
}).privateKey.export({ type: "pkcs8", format: "pem" });
const secrets = {
  "db-url":
    "mysql://puritywallet_notify:test@127.0.0.1:3306/puritywallet_notifications",
  "rpc-url": "http://puritywallet_notifications:test@127.0.0.1:8332",
  "apns-key": key,
};

test("API startup does not read provider private keys or node RPC credentials", () => {
  const reads = [];
  const env = environmentFor("api", config, (name) => {
    reads.push(name);
    return secrets[name];
  });
  assert.deepEqual(reads, ["db-url"]);
  assert.equal(env.JAWSDB_MARIA_URL, secrets["db-url"]);
  assert.equal(env.APNS_P8 !== Buffer.from(key).toString("hex"), true);
  assert.equal(env.BITCOIN_RPC, undefined);
});

test("chain workers receive database and RPC access without push credentials", () => {
  const env = environmentFor("blockprocessor", config, (name) => secrets[name]);
  assert.equal(env.BITCOIN_RPC, secrets["rpc-url"]);
  assert.equal(env.APNS_P8, undefined);
});

test("sender loads the PurityWallet APNs key without a Google credential in iOS mode", () => {
  const env = environmentFor("sender", config, (name) => secrets[name]);
  const loadedPublicKey = createPublicKey(
    Buffer.from(env.APNS_P8, "hex"),
  ).export({ type: "spki", format: "der" });
  const expectedPublicKey = createPublicKey(key).export({
    type: "spki",
    format: "der",
  });
  assert.equal(loadedPublicKey.equals(expectedPublicKey), true);
  assert.equal(env.APNS_TOPIC, "au.com.bitcoininstitute.puritywallet");
  assert.equal(env.GOOGLE_KEY_FILE, Buffer.from("{}").toString("hex"));
  assert.equal(env.BITCOIN_RPC, undefined);
});

test("rejects a different APNs topic and reports missing secrets without disclosing values", () => {
  for (const topic of ["io.bluewallet.bluewallet", "org.bitcoinpurity.puritywallet"]) {
    assert.throws(
      () => environmentFor("sender", { ...config, APNS_TOPIC: topic }, (name) => secrets[name]),
      /APNS_TOPIC/,
    );
  }
  assert.throws(
    () =>
      environmentFor("sender", config, (name) =>
        name === "apns-key" ? "" : secrets[name],
      ),
    /Missing credential: apns-key/,
  );
});

test("Android delivery requires a matching BitcoinPurity Firebase service account", () => {
  const androidConfig = {
    ...config,
    PURITY_ANDROID_PUSH_ENABLED: "1",
    GOOGLE_PROJECT_ID: "puritywallet",
  };
  assert.throws(
    () => environmentFor("sender", androidConfig, (name) => secrets[name]),
    /Missing credential: fcm-key/,
  );
  assert.throws(
    () =>
      environmentFor("sender", androidConfig, (name) =>
        name === "fcm-key" ? '{"project_id":"other"}' : secrets[name],
      ),
    /Firebase service account/,
  );
});
