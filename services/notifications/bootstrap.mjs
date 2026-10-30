import { createPrivateKey } from "node:crypto";

export const upstreamScripts = {
  api: "src/index.ts",
  blockprocessor: "src/worker-blockprocessor.ts",
  mempool: "src/worker-processmempool.ts",
  sender: "src/worker-sender.ts",
};

export function environmentFor(role, config, readSecret) {
  if (!Object.hasOwn(upstreamScripts, role))
    throw new Error("Unknown notification worker");
  const credential = (name) => {
    const value = readSecret(name);
    if (typeof value !== "string" || !value.trim())
      throw new Error(`Missing credential: ${name}`);
    return value.trim();
  };
  const database = credential("db-url");
  const db = new URL(database);
  if (
    db.protocol !== "mysql:" ||
    db.hostname !== "127.0.0.1" ||
    !db.username ||
    db.username === "root" ||
    !db.password ||
    db.pathname !== "/puritywallet_notifications"
  ) {
    throw new Error("Invalid local notification database configuration");
  }
  const result = { JAWSDB_MARIA_URL: database };
  if (role === "blockprocessor" || role === "mempool") {
    const rpc = credential("rpc-url");
    const parsed = new URL(rpc);
    if (
      parsed.protocol !== "http:" ||
      parsed.hostname !== "127.0.0.1" ||
      parsed.port !== "8332" ||
      parsed.username !== "puritywallet_notifications" ||
      !parsed.password ||
      !["", "/"].includes(parsed.pathname)
    ) {
      throw new Error("Invalid restricted Purity node RPC configuration");
    }
    return { ...result, BITCOIN_RPC: rpc };
  }
  if (config.APNS_TOPIC !== "au.com.bitcoininstitute.puritywallet")
    throw new Error("Invalid APNS_TOPIC for PurityWallet");
  if (!/^[A-Z0-9]{10}$/.test(config.APPLE_TEAM_ID ?? ""))
    throw new Error("Invalid APPLE_TEAM_ID");
  Object.assign(result, {
    APNS_TOPIC: config.APNS_TOPIC,
    APPLE_TEAM_ID: config.APPLE_TEAM_ID,
    // Upstream's API checks provider variables but only queues notifications.
    // These sentinels keep the signing keys confined to the sender unit.
    APNS_P8: "unused-by-api",
    APNS_P8_KID: "unused-by-api",
    GOOGLE_KEY_FILE: Buffer.from("{}").toString("hex"),
    GOOGLE_PROJECT_ID: "puritywallet-ios-only",
  });
  if (role === "api") return result;
  if (!/^[A-Z0-9]{10}$/.test(config.APNS_P8_KID ?? ""))
    throw new Error("Invalid APNS_P8_KID");
  const apns = credential("apns-key");
  const key = createPrivateKey(apns);
  if (
    key.asymmetricKeyType !== "ec" ||
    key.asymmetricKeyDetails?.namedCurve !== "prime256v1"
  )
    throw new Error("Invalid APNs signing key");
  result.APNS_P8 = Buffer.from(apns).toString("hex");
  result.APNS_P8_KID = config.APNS_P8_KID;
  if (config.PURITY_ANDROID_PUSH_ENABLED === "1") {
    const json = credential("fcm-key");
    let fcm;
    try {
      fcm = JSON.parse(json);
    } catch {
      throw new Error("Invalid Firebase service account");
    }
    if (
      fcm.type !== "service_account" ||
      !fcm.private_key ||
      !fcm.client_email ||
      !config.GOOGLE_PROJECT_ID ||
      fcm.project_id !== config.GOOGLE_PROJECT_ID
    ) {
      throw new Error("Invalid Firebase service account");
    }
    result.GOOGLE_KEY_FILE = Buffer.from(json).toString("hex");
    result.GOOGLE_PROJECT_ID = fcm.project_id;
  }
  return result;
}
