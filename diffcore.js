// diffcore.js：行级差分（LCS 保序对齐，del+add 合并为 change）
"use strict";

// 中段 DP 的单元格上限，超出后走贪心锚点兜底，防止超大文件卡死
const CELL_CAP = 4e6;

function diffLines(a, b) {
  // 先剥掉公共前后缀，只对中段做 LCS
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA -= 1;
    endB -= 1;
  }

  const middle = lcsOps(a.slice(start, endA), b.slice(start, endB));
  const ops = [];
  for (let i = 0; i < start; i += 1) ops.push({ op: "keep", a: i, b: i });
  for (const entry of middle) {
    ops.push({
      op: entry.op,
      a: entry.a === null ? null : entry.a + start,
      b: entry.b === null ? null : entry.b + start,
    });
  }
  for (let i = 0; i < a.length - endA; i += 1) {
    ops.push({ op: "keep", a: endA + i, b: endB + i });
  }
  return mergeChanges(ops);
}

// 中段行级 LCS：DP 回溯出 keep/del/add 原始序列
function lcsOps(x, y) {
  const n = x.length;
  const m = y.length;
  if (n === 0) return y.map((line, j) => ({ op: "add", a: null, b: j }));
  if (m === 0) return x.map((line, i) => ({ op: "del", a: i, b: null }));
  if (n * m > CELL_CAP) return greedyOps(x, y);

  const width = m + 1;
  const dp = new Uint32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i * width + j] = x[i] === y[j]
        ? dp[(i + 1) * width + j + 1] + 1
        : Math.max(dp[(i + 1) * width + j], dp[i * width + j + 1]);
    }
  }
  // 正向回溯；平局时优先 del，保证 del 排在 add 前面，便于后续合并
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) {
      ops.push({ op: "keep", a: i, b: j });
      i += 1;
      j += 1;
    } else if (dp[(i + 1) * width + j] >= dp[i * width + j + 1]) {
      ops.push({ op: "del", a: i, b: null });
      i += 1;
    } else {
      ops.push({ op: "add", a: null, b: j });
      j += 1;
    }
  }
  while (i < n) { ops.push({ op: "del", a: i, b: null }); i += 1; }
  while (j < m) { ops.push({ op: "add", a: null, b: j }); j += 1; }
  return ops;
}

// 大行数兜底：按行内容建索引做保序贪心对齐（不保证严格 LCS）
function greedyOps(x, y) {
  const unused = new Map();
  for (let j = 0; j < y.length; j += 1) {
    const list = unused.get(y[j]);
    if (list) list.push(j);
    else unused.set(y[j], [j]);
  }
  const ops = [];
  let cursor = 0;
  for (let i = 0; i < x.length; i += 1) {
    const list = unused.get(x[i]);
    let hit = -1;
    if (list) {
      while (list.length > 0 && list[0] < cursor) list.shift();
      if (list.length > 0) hit = list.shift();
    }
    if (hit === -1) {
      ops.push({ op: "del", a: i, b: null });
      continue;
    }
    while (cursor < hit) { ops.push({ op: "add", a: null, b: cursor }); cursor += 1; }
    ops.push({ op: "keep", a: i, b: hit });
    cursor = hit + 1;
  }
  while (cursor < y.length) { ops.push({ op: "add", a: null, b: cursor }); cursor += 1; }
  return ops;
}

// 相邻的 del 段与 add 段逐对合并成 change
function mergeChanges(ops) {
  const out = [];
  let i = 0;
  while (i < ops.length) {
    if (ops[i].op !== "del") {
      out.push(ops[i]);
      i += 1;
      continue;
    }
    const dels = [];
    while (i < ops.length && ops[i].op === "del") { dels.push(ops[i]); i += 1; }
    const adds = [];
    while (i < ops.length && ops[i].op === "add") { adds.push(ops[i]); i += 1; }
    const pairs = Math.min(dels.length, adds.length);
    for (let k = 0; k < pairs; k += 1) {
      out.push({ op: "change", a: dels[k].a, b: adds[k].b });
    }
    for (let k = pairs; k < dels.length; k += 1) out.push(dels[k]);
    for (let k = pairs; k < adds.length; k += 1) out.push(adds[k]);
  }
  return out;
}

// 用 a 侧内容回放 ops：keep/change 取 a 侧行，del 跳过；
// add 的内容只存在于 b 侧，无法从 a 还原，同样跳过
function replay(a, ops) {
  const out = [];
  for (const entry of ops) {
    if (entry.op === "keep" || entry.op === "change") out.push(a[entry.a]);
  }
  return out;
}

// 预算：visited 为本次对齐实际访问的行数（即变化行数），limit 为写死上限
function budget(a, b, ops) {
  const visited = ops.filter((entry) => entry.op !== "keep").length;
  return { visited: visited, limit: 2 * a.length };
}

export { diffLines, replay, budget };
