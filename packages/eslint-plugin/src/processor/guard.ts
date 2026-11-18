// The fix guard: drops any fix (or suggestion) that would break the Pug parse or change a
// template's structural fingerprint. A dropped fix leaves its message in place without `fix`.
// Never fails open: every verdict comes from re-locating and re-parsing the candidate text.
import type { Linter, Rule } from 'eslint'
import type { Range } from '@pug-lint/parser'
import { getPugTemplates, templateFingerprint } from '../shared/templates.ts'
import { applyFixes } from './apply-fixes.ts'

export type DropReason = 'parse-error' | 'structure' | 'boundary' | 'broken-template' | 'combined'

type Placement = 'outside' | 'inside' | 'boundary'

/** Where a fix range sits relative to the template content ranges. A zero-width insertion at either edge is inside. */
function place([start, end]: Rule.Fix['range'], templates: readonly Range[]): Placement {
  for (const [tStart, tEnd] of templates) {
    if (tStart <= start && end <= tEnd) return 'inside'
    const disjoint = start === end ? start < tStart || start > tEnd : end <= tStart || start >= tEnd
    if (!disjoint) return 'boundary'
  }
  return 'outside'
}

const byRange = (a: Rule.Fix, b: Rule.Fix): number => a.range[0] - b.range[0] || a.range[1] - b.range[1]

/**
 * `messages` with every unsafe template fix and suggestion removed (Design §3, guard algorithm).
 * Fixes entirely outside the Pug templates are untouched. `onDrop` is called once per dropped
 * fix or suggestion, with the original message.
 */
export function guardMessages(
  text: string,
  messages: Linter.LintMessage[],
  onDrop?: (m: Linter.LintMessage, reason: DropReason) => void,
): Linter.LintMessage[] {
  const templates = getPugTemplates(text).map((t) => t.range)
  if (templates.length === 0) return messages
  const touches = (fix: Rule.Fix | undefined): boolean => fix !== undefined && place(fix.range, templates) !== 'outside'
  if (!messages.some((m) => touches(m.fix) || m.suggestions?.some((s) => touches(s.fix)))) return messages

  const before = templateFingerprint(text)
  /** Steps 2–5: the verdict for one fix applied alone; `null` = keep. */
  const check = (fix: Rule.Fix): DropReason | null => {
    const placement = place(fix.range, templates)
    if (placement === 'outside') return null
    if (placement === 'boundary') return 'boundary'
    if (before === null) return 'broken-template'
    const after = templateFingerprint(applyFixes(text, [fix]).output)
    if (after === null) return 'parse-error'
    return after === before ? null : 'structure'
  }

  const fixDrops = new Map<number, DropReason>()
  const outsideFixes: Rule.Fix[] = []
  const candidates: { index: number; fix: Rule.Fix }[] = []
  messages.forEach((m, index) => {
    if (!m.fix) return
    const reason = check(m.fix)
    if (reason) fixDrops.set(index, reason)
    else if (place(m.fix.range, templates) === 'outside') outsideFixes.push(m.fix)
    else candidates.push({ index, fix: m.fix })
  })

  // Step 6: the survivors as ESLint will merge them (with the outside fixes, which can win an
  // overlap); on failure rebuild greedily in range order.
  const verifies = (fixes: Rule.Fix[]): boolean =>
    templateFingerprint(applyFixes(text, [...outsideFixes, ...fixes]).output) === before
  if (candidates.length > 0 && (candidates.length > 1 || outsideFixes.length > 0)
    && !verifies(candidates.map((c) => c.fix))) {
    const kept: Rule.Fix[] = []
    for (const c of [...candidates].sort((a, b) => byRange(a.fix, b.fix))) {
      if (verifies([...kept, c.fix])) kept.push(c.fix)
      else fixDrops.set(c.index, 'combined')
    }
  }

  return messages.map((m, index) => {
    const fixReason = fixDrops.get(index)
    if (fixReason) onDrop?.(m, fixReason)
    // Step 7: each suggestion on its own.
    let suggestions = m.suggestions
    if (suggestions?.some((s) => touches(s.fix))) {
      const safe = suggestions.filter((s) => {
        const reason = check(s.fix)
        if (reason) onDrop?.(m, reason)
        return reason === null
      })
      if (safe.length < suggestions.length) suggestions = safe
    }
    if (!fixReason && suggestions === m.suggestions) return m
    const copy: Linter.LintMessage = { ...m }
    if (fixReason) delete copy.fix
    if (suggestions && suggestions.length > 0) copy.suggestions = suggestions
    else delete copy.suggestions
    return copy
  })
}
