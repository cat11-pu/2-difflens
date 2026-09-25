import assert from "node:assert";
import { blocks } from "../diff.js";
import { apply } from "../patch.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const oldLines = ["a", "b"];
const newLines = ["a", "c"];

check("blocks returns list", () => {
  assert.ok(Array.isArray(blocks(oldLines, newLines)));
});

check("blocks carry an id", () => {
  assert.strictEqual(typeof blocks(oldLines, newLines)[0].id, "string");
});

check("apply returns lines", () => {
  assert.ok(Array.isArray(apply(oldLines, blocks(oldLines, newLines), []).lines));
});

check("apply reports conflicts", () => {
  assert.ok(Array.isArray(apply(oldLines, blocks(oldLines, newLines), []).conflicts));
});

check("render exposes count", () => {
  assert.strictEqual(typeof render({ old_lines: oldLines, new_lines: newLines, applied: [] }).count, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
