// tests/run.js：基线用例
"use strict";
import assert from "node:assert";
import { diffLines, replay } from "../diffcore.js";
import { alignInline } from "../inline.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok   " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("identical lines keep", () => {
  assert.deepStrictEqual(diffLines(["a"], ["a"]), [{ op: "keep", a: 0, b: 0 }]);
});

check("different lines change", () => {
  assert.strictEqual(diffLines(["a"], ["b"])[0].op, "change");
});

check("replay returns array", () => {
  assert.ok(Array.isArray(replay(["a"], diffLines(["a"], ["a"]))));
});

check("inline empty when equal", () => {
  assert.deepStrictEqual(alignInline("x", "x"), []);
});

check("render produces rows", () => {
  assert.strictEqual(render(["a"], ["a"], { height: 4 }).rows.length, 1);
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
