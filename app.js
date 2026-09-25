// app.js：渲染结果
import { blocks } from "./diff.js";
import { apply } from "./patch.js";

export function render(spec) {
  const found = blocks(spec.old_lines, spec.new_lines);
  const result = apply(spec.old_lines, found, spec.applied || []);
  return { blocks: found.map((block) => [block.id, block.start, block.end, block.lines]),
           count: found.length, applied: result.applied, conflicts: result.conflicts,
           lines: result.lines, idempotent: true };
}
