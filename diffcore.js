// diffcore.js：行级差分（基线：按行号硬比，不做对齐）
"use strict";

function diffLines(a, b) {
  // 基线：同下标逐行比，长度不同就补空
  const ops = [];
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    if (a[i] === b[i]) ops.push({ op: "keep", a: i, b: i });
    else ops.push({ op: "change", a: i, b: i });
  }
  return ops;
}

function replay(a, ops) {
  // 基线：不回放，直接返回原数组
  return a.slice();
}

function budget(a, b, ops) {
  // 基线：把全文都算成访问过
  return { visited: a.length + b.length, limit: a.length + b.length };
}

export { diffLines, replay, budget };
