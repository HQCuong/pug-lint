// Applies fixes with ESLint's own merge rule (SourceCodeFixer): sort by range, then skip any fix
// that starts at or before the end of the last applied one. The guard uses it to predict exactly
// which fixes ESLint will apply together.
import type { Rule } from 'eslint'

const byRange = (a: Rule.Fix, b: Rule.Fix): number => a.range[0] - b.range[0] || a.range[1] - b.range[1]

/** `text` with `fixes` applied as ESLint would apply them in one pass; `applied` is in application order. */
export function applyFixes(text: string, fixes: readonly Rule.Fix[]): { output: string; applied: Rule.Fix[] } {
  const applied: Rule.Fix[] = []
  let output = ''
  let lastPos = Number.NEGATIVE_INFINITY
  for (const fix of [...fixes].sort(byRange)) {
    const [start, end] = fix.range
    if (lastPos >= start || start > end) continue
    output += text.slice(Math.max(0, lastPos), Math.max(0, start)) + fix.text
    lastPos = end
    applied.push(fix)
  }
  output += text.slice(Math.max(0, lastPos))
  return { output, applied }
}
