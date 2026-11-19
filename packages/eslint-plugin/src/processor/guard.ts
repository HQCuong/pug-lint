// The fix guard: drops any fix (or suggestion) that would break the Pug parse, move or add a root
// template block, or change a template's structural fingerprint. A dropped fix leaves its message
// in place without `fix`. Never fails open: every verdict comes from re-locating and re-parsing
// the candidate text. Candidates are parsed directly, not through the shared CST cache, so they
// never evict the entries rules and the tokenizer rely on.
import type { Linter, Rule } from 'eslint'
import { fingerprint, parsePug } from 'pug-lint-parser'
import type { Range } from 'pug-lint-parser'
import {
  findLaterRootTemplateRanges,
  findPugTemplateRanges,
  getPugTemplates,
  templateFingerprint,
} from '../shared/templates.ts'
import { applyFixes } from './apply-fixes.ts'

export type DropReason = 'malformed' | 'parse-error' | 'structure' | 'boundary' | 'broken-template' | 'combined'

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

const lengthChange = (f: Rule.Fix): number => f.text.length - (f.range[1] - f.range[0])

/**
 * Where a content range of the original text must be after `applied`. A content start moves
 * with the fixes before it; a content end also moves with the fixes inside the content
 * (a zero-width insertion at either edge belongs to the content).
 */
function shift([start, end]: Range, applied: readonly Rule.Fix[]): Range {
  let ds = 0
  let de = 0
  for (const f of applied) {
    const [fStart, fEnd] = f.range
    if (fEnd < start || (fEnd === start && fStart < start)) ds += lengthChange(f)
    if (fEnd <= end) de += lengthChange(f)
  }
  return [start + ds, end + de]
}

const sameRanges = (a: readonly Range[], b: readonly Range[]): boolean =>
  a.length === b.length && a.every((r, i) => r[0] === b[i]![0] && r[1] === b[i]![1])

const stripBom = (text: string): string => (text.charCodeAt(0) === 0xfeff ? text.slice(1) : text)

/** A fix ESLint cannot apply: non-integer, negative, inverted, or past the end of `text`. */
const malformed = ({ range: [start, end] }: Rule.Fix, text: string): boolean =>
  !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start > end || end > text.length

/**
 * `messages` without malformed fixes and suggestions, anywhere in the file. ESLint skips such a
 * fix, but a message that still carries one keeps its fix loop going (circular-fix warnings).
 */
function dropMalformed(
  text: string,
  messages: Linter.LintMessage[],
  onDrop?: (m: Linter.LintMessage, reason: DropReason) => void,
): Linter.LintMessage[] {
  const bad = (fix: Rule.Fix | undefined): boolean => fix !== undefined && malformed(fix, text)
  if (!messages.some((m) => bad(m.fix) || m.suggestions?.some((s) => bad(s.fix)))) return messages
  return messages.map((m) => {
    const fixBad = bad(m.fix)
    const suggestions = m.suggestions?.filter((s) => !bad(s.fix))
    if (!fixBad && suggestions?.length === m.suggestions?.length) return m
    const copy: Linter.LintMessage = { ...m }
    if (fixBad) {
      onDrop?.(m, 'malformed')
      delete copy.fix
    }
    for (let i = suggestions?.length ?? 0; i < (m.suggestions?.length ?? 0); i++) onDrop?.(m, 'malformed')
    if (suggestions && suggestions.length > 0) copy.suggestions = suggestions
    else delete copy.suggestions
    return copy
  })
}

/**
 * `messages` with every unsafe template fix and suggestion removed (Design §3, guard algorithm).
 * Fixes entirely outside the Pug templates are untouched. `onDrop` is called once per dropped
 * fix or suggestion, with the original message. `text` may carry a BOM; fix ranges refer to
 * the BOM-stripped text, as in ESLint. Malformed fix ranges are dropped anywhere in the file (`malformed`).
 */
export function guardMessages(
  rawText: string,
  inputMessages: Linter.LintMessage[],
  onDrop?: (m: Linter.LintMessage, reason: DropReason) => void,
): Linter.LintMessage[] {
  const text = stripBom(rawText)
  const messages = dropMalformed(text, inputMessages, onDrop)
  const templates = getPugTemplates(text).map((t) => t.range)
  if (templates.length === 0) return messages
  const touches = (fix: Rule.Fix | undefined): boolean => fix !== undefined && place(fix.range, templates) !== 'outside'
  if (!messages.some((m) => touches(m.fix) || m.suggestions?.some((s) => touches(s.fix)))) return messages

  const before = templateFingerprint(text)
  const laterTemplates = findLaterRootTemplateRanges(text)

  /** Verdict for `fixes` merged as ESLint merges them; `null` = the result is safe. */
  const verify = (fixes: readonly Rule.Fix[]): 'parse-error' | 'structure' | null => {
    const { output, applied } = applyFixes(text, fixes)
    // The root template blocks must be exactly the original ones, moved only by the applied edits.
    const pug = findPugTemplateRanges(output)
    if (!sameRanges(pug, templates.map((r) => shift(r, applied)))) return 'structure'
    if (!sameRanges(findLaterRootTemplateRanges(output), laterTemplates.map((r) => shift(r, applied)))) return 'structure'
    const docs = pug.map(([start, end]) => parsePug(output, { start, end }))
    if (docs.some((d) => d.errors.length > 0)) return 'parse-error'
    return docs.map(fingerprint).join('|') === before ? null : 'structure'
  }

  /**
   * Steps 2–5: the verdict for one fix applied alone; `null` = keep. Memoized by range and text:
   * a rule may put one fix on many messages (vue-pug/indent does), which is verified once.
   */
  const verdicts = new Map<string, DropReason | null>()
  const check = (fix: Rule.Fix): DropReason | null => {
    const placement = place(fix.range, templates)
    if (placement === 'outside') return null
    if (placement === 'boundary') return 'boundary'
    if (before === null) return 'broken-template'
    const key = `${fix.range[0]}:${fix.range[1]}:${fix.text}`
    let verdict = verdicts.get(key)
    if (verdict === undefined) {
      verdict = verify([fix])
      verdicts.set(key, verdict)
    }
    return verdict
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
  // overlap or move the template); on failure rebuild greedily in range order.
  const verifies = (fixes: Rule.Fix[]): boolean => verify([...outsideFixes, ...fixes]) === null
  if (candidates.length > 0 && (candidates.length > 1 || outsideFixes.length > 0)
    && !verifies(candidates.map((c) => c.fix))) {
    const kept: Rule.Fix[] = []
    for (const c of [...candidates].sort((a, b) => byRange(a.fix, b.fix))) {
      if (verifies([...kept, c.fix])) kept.push(c.fix)
      else fixDrops.set(c.index, 'combined')
    }
  }

  return messages.map((m, index) => {
    // onDrop always receives the caller's message, not a copy made by dropMalformed.
    const original = inputMessages[index]!
    const fixReason = fixDrops.get(index)
    if (fixReason) onDrop?.(original, fixReason)
    // Step 7: each suggestion on its own.
    let suggestions = m.suggestions
    if (suggestions?.some((s) => touches(s.fix))) {
      const safe = suggestions.filter((s) => {
        const reason = check(s.fix)
        if (reason) onDrop?.(original, reason)
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
