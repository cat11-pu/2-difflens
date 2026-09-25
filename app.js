// app.js：渲染（只渲染视口内的行，change 行附带行内片段）
"use strict";

import { diffLines } from "./diffcore.js";
import { alignInline } from "./inline.js";

function render(a, b, view) {
  const ops = diffLines(a, b);
  const height = view && Number.isFinite(view.height) ? Math.max(0, view.height) : ops.length;
  const offset = view && Number.isFinite(view.offset) ? Math.max(0, view.offset) : 0;
  const count = Math.min(height, Math.max(0, ops.length - offset));
  const rows = [];
  const inline = [];
  for (let r = 0; r < count; r += 1) {
    const index = offset + r;
    const entry = ops[index];
    rows.push({
      index,
      left: entry.a === null ? null : a[entry.a],
      right: entry.b === null ? null : b[entry.b],
      op: entry.op,
    });
    if (entry.op === "change") {
      inline.push({
        index,
        segments: alignInline(String(a[entry.a]), String(b[entry.b])),
      });
    }
  }
  return { rows, inline, ops };
}

export { render };
