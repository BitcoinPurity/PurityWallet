import { readFileSync } from "node:fs";
import { globalAgent } from "node:http";
import { createRequire } from "node:module";
import { join } from "node:path";
import { environmentFor, upstreamScripts } from "./bootstrap.mjs";
import {
  boundCacheCursorRetention,
  configureIosOnlySender,
} from "./upstream-adapters.mjs";

try {
  const role = process.argv[2];
  if (role === "gateway") {
    const { createGateway } = await import("./gateway.mjs");
    createGateway({
      allowAndroid: process.env.PURITY_ANDROID_PUSH_ENABLED === "1",
    }).listen(3010, "127.0.0.1");
  } else {
    // Purity's batch RPC can exceed Node's five-second default agent timeout.
    globalAgent.options.timeout = 120000;
    const credentials = process.env.CREDENTIALS_DIRECTORY;
    if (!credentials) throw new Error("Systemd credentials are not available");
    Object.assign(
      process.env,
      environmentFor(role, process.env, (name) => {
        try {
          return readFileSync(join(credentials, name), "utf8");
        } catch {
          return "";
        }
      }),
    );
    const source = "/opt/puritywallet-notifications/upstream";
    process.chdir(source);
    process.env.TS_NODE_TRANSPILE_ONLY = "true";
    const require = createRequire(join(source, "package.json"));
    require("ts-node/register");
    if (role === "mempool") {
      const { LruCache } = require(join(source, "src/lru-cache.ts"));
      boundCacheCursorRetention(LruCache);
    }
    if (role === "sender" && process.env.PURITY_ANDROID_PUSH_ENABLED !== "1") {
      const { GroundControlToMajorTom } = require(
        join(source, "src/class/GroundControlToMajorTom.ts"),
      );
      configureIosOnlySender(GroundControlToMajorTom);
    }
    require(join(source, upstreamScripts[role]));
  }
} catch (error) {
  console.error(`Notification startup failed: ${error.message}`);
  process.exit(1);
}
