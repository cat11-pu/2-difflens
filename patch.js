// patch.js：应用变更块（基线：直接覆盖、不判顺序）
export function apply(oldLines, blocks, applied) {
  return { lines: blocks.length ? blocks[0].lines : oldLines, applied: applied.slice(), conflicts: [] };
}
