// inline.js：行内片段对齐（最长公共前后缀切分）与行终止符检查
"use strict";

// 只把真正变化的片段算进去：完全相同返回空数组，
// 否则削去最长公共前后缀，返回左右中段的 del/ins 两段。
function alignInline(left, right) {
  if (left === right) return [];
  const minLen = Math.min(left.length, right.length);
  let prefix = 0;
  while (prefix < minLen && left[prefix] === right[prefix]) prefix += 1;
  let suffix = 0;
  while (suffix < minLen - prefix
         && left[left.length - 1 - suffix] === right[right.length - 1 - suffix]) {
    suffix += 1;
  }
  return [
    { from: prefix, to: left.length - suffix, kind: "del" },
    { from: prefix, to: right.length - suffix, kind: "ins" },
  ];
}

// 检出含 CR 的行，返回 1 起始行号与错误码；全部合法返回 null。
function locateBadEol(lines) {
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes("\r")) return { line: i + 1, code: "E_BAD_EOL" };
  }
  return null;
}

export { alignInline, locateBadEol };
