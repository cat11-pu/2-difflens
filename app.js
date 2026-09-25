// app.js：渲染（只渲染视口内的行，change 行附带行内片段）
"use strict";

import { diffLines } from "./diffcore.js";
import { alignInline } from "./inline.js";

function render(a, b, view) {
  const ops = diffLines(a, b);
  const height = view && typeof view.height === "number" ? view.height : ops.length;
  const count = Math.min(height, ops.length);
  const rows = [];
  const inline = [];
  for (let i = 0; i < count; i += 1) {
    const entry = ops[i];
    rows.push({
      index: i,
      left: entry.a === null ? null : a[entry.a],
      right: entry.b === null ? null : b[entry.b],
      op: entry.op,
    });
    if (entry.op === "change") {
      inline.push({
        index: entry.a,
        segments: alignInline(String(a[entry.a]), String(b[entry.b])),
      });
    }
  }
  return { rows: rows, inline: inline, ops: ops };
}

export { render };
