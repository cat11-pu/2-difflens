// check_sample.js：跑 sample/files.json，打印验收面
"use strict";
import fs from "node:fs";
import { diffLines, replay, budget } from "./diffcore.js";
import { alignInline, locateBadEol } from "./inline.js";
import { render } from "./app.js";

const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/files.json", "utf8"));
const ops = diffLines(spec.a, spec.b);
const back = replay(spec.a, ops);
const view = render(spec.a, spec.b, { height: spec.height });
const cost = budget(spec.a, spec.b, ops);
const bad = locateBadEol(spec.bad_eol);

console.log("操作序列 =", JSON.stringify(ops.map((o) => [o.op, o.a, o.b])));
console.log("回放是否等于目标 =", JSON.stringify(back) === JSON.stringify(spec.b));
console.log("变化行数 =", ops.filter((o) => o.op !== "keep").length);
console.log("视口渲染的行数 =", view.rows.length);
console.log("行内片段数 =", view.inline.reduce((acc, item) => acc + item.segments.length, 0));
console.log("预算（访问行数） =", cost.visited);
console.log("预算上限 =", cost.limit);
console.log("非法行终止符的行号 =", bad && bad.line);
console.log("非法行终止符的错误码 =", bad && bad.code);
console.log("不变量（回放能还原目标文本） =", spec.replay_invariant);
