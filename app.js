// app.js：渲染（基线：全部行渲染，不做视口裁剪）
"use strict";

import { diffLines, replay } from "./diffcore.js";
import { alignInline } from "./inline.js";

function render(a, b, view) {
  const ops = diffLines(a, b);
  const rows = [];
  for (let i = 0; i < ops.length; i += 1) {
    const entry = ops[i];
    rows.push({ index: i, left: a[entry.a] === undefined ? null : a[entry.a],
                right: b[entry.b] === undefined ? null : b[entry.b], op: entry.op });
  }
  const inline = [];
  for (const entry of ops) {
    if (entry.op !== "change") continue;
    inline.push({ index: entry.a, segments: alignInline(String(a[entry.a]), String(b[entry.b])) });
  }
  return { rows: rows, inline: inline, ops: ops };
}

export { render };
