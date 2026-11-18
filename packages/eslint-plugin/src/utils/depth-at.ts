// depthAt(): the logical depth (PugLine.depth) of the line holding an offset, e.g. a tag's depth
// from its head offset. Inserted indentation is `doc.indentUnit` repeated per depth.
import type { PugLine } from '@pug-lint/parser'

/** The depth of the line holding `offset` (0 when no line holds it). */
export function depthAt(lines: readonly PugLine[], offset: number): number {
  let lo = 0
  let hi = lines.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (lines[mid]!.range[0] <= offset) lo = mid + 1
    else hi = mid
  }
  return lo > 0 ? lines[lo - 1]!.depth : 0
}
