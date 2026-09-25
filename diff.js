// diff.js：比对（基线：整行比对、只有一块）
export function blocks(oldLines, newLines) {
  return [{ id: "b0", start: 0, end: oldLines.length, lines: newLines }];
}
