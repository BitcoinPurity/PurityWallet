import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { configureIosOnlySender } from "../upstream-adapters.mjs";

test("iOS sender never requests Google credentials and refuses FCM delivery", async () => {
  let requests = 0;
  const provider = {
    getGoogleCredentials: async () => {
      requests++;
    },
    _pushToFcm: async () => {
      requests++;
    },
  };
  configureIosOnlySender(provider);
  assert.equal(await provider.getGoogleCredentials(), "");
  await assert.rejects(
    provider._pushToFcm(),
    /Android push delivery is disabled/,
  );
  assert.equal(requests, 0);
});

test(
  "bounds retained heap during repeated real-upstream cache hits while preserving eviction",
  { skip: !process.env.GROUND_CONTROL_SOURCE },
  () => {
    const probe = (mode) => {
      const result = spawnSync(
        process.execPath,
        [
          "--expose-gc",
          "--max-old-space-size=320",
          fileURLToPath(new URL("./cache-probe.mjs", import.meta.url)),
          mode,
        ],
        { encoding: "utf8", timeout: 20000 },
      );
      assert.equal(result.status, 0, result.stderr);
      return JSON.parse(result.stdout);
    };
    const baseline = probe("baseline");
    const adapted = probe("adapted");
    assert.ok(baseline.growthMiB > 40, JSON.stringify(baseline));
    assert.ok(adapted.growthMiB < 8, JSON.stringify(adapted));
  },
);
