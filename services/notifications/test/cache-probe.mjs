import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { boundCacheCursorRetention } from "../upstream-adapters.mjs";

const require = createRequire(
  join(process.env.GROUND_CONTROL_SOURCE, "package.json"),
);
const ts = require("typescript");
const source = readFileSync(
  join(process.env.GROUND_CONTROL_SOURCE, "src/lru-cache.ts"),
  "utf8",
);
const module = { exports: {} };
new Function(
  "exports",
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
)(module.exports);
const Cache = module.exports.LruCache;
if (process.argv[2] === "adapted") boundCacheCursorRetention(Cache);
const small = new Cache(3);
for (const key of ["a", "b", "c"]) small.add(key);
for (let i = 0; i < 2048; i++) {
  small.has("a");
  small.has("c");
}
small.add("d");
assert.equal(small.has("b"), false);
assert.equal(small.has("a"), true);
assert.equal(small.size, 3);
const cache = new Cache(250000);
const keys = Array.from({ length: 17000 }, (_, i) =>
  i.toString(16).padStart(64, "0"),
);
for (const key of keys) cache.add(key);
global.gc();
const start = process.memoryUsage().heapUsed;
for (let round = 0; round < 100; round++)
  for (const key of keys) cache.has(key);
global.gc();
console.log(
  JSON.stringify({
    growthMiB: (process.memoryUsage().heapUsed - start) / 1048576,
    size: cache.size,
  }),
);
