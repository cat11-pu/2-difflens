// inline.js：行内片段对齐（最长公共前后缀切分）
"use strict";

function alignInline(left, right) {
  if (left === right) return [];
  let start = 0;
  const minLen = Math.min(left.length, right.length);
  while (start < minLen && left[start] === right[start]) start += 1;
  let endLeft = left.length;
  let endRight = right.length;
  while (endLeft > start && endRight > start &&
         left[endLeft - 1] === right[endRight - 1]) {
    endLeft -= 1;
    endRight -= 1;
  }
  return [
    { from: start, to: endLeft, kind: "del" },
    { from: start, to: endRight, kind: "ins" },
  ];
}

// 检出第一个含 CR 的行，返回 1 起始行号与错误码
function locateBadEol(lines) {
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].indexOf("\r") !== -1) return { line: i + 1, code: "E_BAD_EOL" };
  }
  return null;
}

export { alignInline, locateBadEol };
