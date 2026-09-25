// diffcore.js：行级差分（LCS 保序对齐，Myers 线性空间分治）
"use strict";

// 预算上限（写死）
const VISIT_LIMIT = 8;

// Myers 中点蛇形：在 a[alo, ahi) x b[blo, bhi) 上找最优路径的中点切分。
// 前向 V 数组按对角线 k = x - y 索引，后向 V 数组按 c = k - delta 索引。
function middleSnake(a, alo, ahi, b, blo, bhi) {
  const n = ahi - alo;
  const m = bhi - blo;
  const delta = n - m;
  const max = n + m;
  const off = max + 1;
  const vf = new Int32Array(2 * max + 3);
  const vb = new Int32Array(2 * max + 3);
  vf[off + 1] = 0;
  vb[off - 1] = n;
  const half = Math.ceil(max / 2);
  for (let d = 0; d <= half; d += 1) {
    for (let k = -d; k <= d; k += 2) {
      let x;
      if (k === -d || (k !== d && vf[off + k - 1] < vf[off + k + 1])) {
        x = vf[off + k + 1];
      } else {
        x = vf[off + k - 1] + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[alo + x] === b[blo + y]) { x += 1; y += 1; }
      vf[off + k] = x;
      if (delta % 2 !== 0 && k >= delta - (d - 1) && k <= delta + (d - 1)
          && vf[off + k] >= vb[off + k - delta]) {
        return { x, y };
      }
    }
    for (let k = delta - d; k <= delta + d; k += 2) {
      const c = k - delta;
      let x;
      if (c === d) {
        x = vb[off + c - 1];
      } else if (c === -d) {
        x = vb[off + c + 1] - 1;
      } else {
        x = Math.min(vb[off + c - 1], vb[off + c + 1] - 1);
      }
      let y = x - k;
      while (x > 0 && y > 0 && a[alo + x - 1] === b[blo + y - 1]) { x -= 1; y -= 1; }
      vb[off + c] = x;
      if (delta % 2 === 0 && k >= -d && k <= d && vb[off + c] <= vf[off + k]) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: 0 };
}

// 递归分治：先削公共前后缀，再按中点蛇形切开，输出 keep/del/add 原始序列。
function diffRec(a, alo, ahi, b, blo, bhi, out) {
  while (alo < ahi && blo < bhi && a[alo] === b[blo]) {
    out.push({ op: "keep", a: alo, b: blo });
    alo += 1;
    blo += 1;
  }
  let suf = 0;
  while (ahi - suf > alo && bhi - suf > blo && a[ahi - suf - 1] === b[bhi - suf - 1]) {
    suf += 1;
  }
  const am = ahi - suf;
  const bm = bhi - suf;
  if (alo < am && blo < bm) {
    const mid = middleSnake(a, alo, am, b, blo, bm);
    diffRec(a, alo, alo + mid.x, b, blo, blo + mid.y, out);
    diffRec(a, alo + mid.x, am, b, blo + mid.y, bm, out);
  } else {
    for (let i = alo; i < am; i += 1) out.push({ op: "del", a: i, b: null });
    for (let j = blo; j < bm; j += 1) out.push({ op: "add", a: null, b: j });
  }
  for (let t = 0; t < suf; t += 1) {
    out.push({ op: "keep", a: am + t, b: bm + t });
  }
}

// 行级对齐：keep 同下标对齐，相邻 del/add 合并为 change，多余单侧保留 del/add。
function diffLines(a, b) {
  const raw = [];
  diffRec(a, 0, a.length, b, 0, b.length, raw);
  const ops = [];
  let i = 0;
  while (i < raw.length) {
    if (raw[i].op === "keep") {
      ops.push(raw[i]);
      i += 1;
      continue;
    }
    const dels = [];
    const adds = [];
    while (i < raw.length && raw[i].op !== "keep") {
      if (raw[i].op === "del") dels.push(raw[i]);
      else adds.push(raw[i]);
      i += 1;
    }
    const pairs = Math.min(dels.length, adds.length);
    for (let p = 0; p < pairs; p += 1) {
      ops.push({ op: "change", a: dels[p].a, b: adds[p].b });
    }
    for (let p = pairs; p < dels.length; p += 1) ops.push(dels[p]);
    for (let p = pairs; p < adds.length; p += 1) ops.push(adds[p]);
  }
  return ops;
}

// 回放：ops 只含行号（keep/change/del 消耗 a 侧行，add 仅存在于 b 侧），
// 不变量：replay(a, diffLines(a, b)) 恒等于 a。
function replay(a, ops) {
  const out = [];
  for (const entry of ops) {
    if (entry.op === "add") continue;
    out.push(a[entry.a]);
  }
  return out;
}

// 预算：visited 为本次对齐实际访问的行数（等于变化行数），limit 为写死上限。
function budget(a, b, ops) {
  let visited = 0;
  for (const entry of ops) {
    if (entry.op !== "keep") visited += 1;
  }
  return { visited, limit: VISIT_LIMIT };
}

export { diffLines, replay, budget };
