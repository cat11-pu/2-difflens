import fs from "node:fs";
import { blocks } from "./diff.js";
import { apply } from "./patch.js";
import { render } from "./app.js";

const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/diff.json", "utf8"));
const found = blocks(spec.old_lines, spec.new_lines);
const result = apply(spec.old_lines, found, spec.applied || []);
const view = render(spec);

console.log("变更块 =", JSON.stringify(found.map((block) => [block.id, block.start, block.end])));
console.log("变更块数 =", found.length);
console.log("应用的块 =", JSON.stringify(result.applied));
console.log("冲突的块 =", JSON.stringify(result.conflicts));
console.log("应用后的文本 =", JSON.stringify(result.lines));
console.log("重复应用是否幂等 =", view.idempotent);
console.log("结果是否与目标一致 =", JSON.stringify(result.lines) === JSON.stringify(spec.new_lines));
console.log("顺序冲突的错误码 =", spec.conflict_code);
