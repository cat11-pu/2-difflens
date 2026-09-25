// inline.js：行内片段对齐（基线：整行当一段，不做字符级对齐）
"use strict";

function alignInline(left, right) {
  // 基线：整行一段，不切分
  if (left === right) return [];
  return [{ from: 0, to: left.length, kind: "del" }, { from: 0, to: right.length, kind: "ins" }];
}

function locateBadEol(lines) {
  // 基线：不检查行终止符
  return null;
}

export { alignInline, locateBadEol };
