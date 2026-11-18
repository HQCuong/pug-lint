// Hides messages of `vue/*` rules that misreport on Pug, but only inside a Pug template:
// the same rules keep working on HTML templates and on `<script>`.
import type { Linter } from 'eslint'
import type { Range } from '@pug-lint/parser'
import { getPugTemplates } from '../shared/templates.ts'
import { createLineIndex } from '../tokenizer/line-index.ts'
import type { LineIndex } from '../tokenizer/line-index.ts'

/** Offset of a message's start on `text`, or `null` when it has no usable position. */
function startOffset(index: LineIndex, message: Linter.LintMessage): number | null {
  if (!(message.line >= 1 && message.column >= 1)) return null
  try {
    return index.offsetOf(message.line, message.column - 1)
  } catch {
    return null
  }
}

/**
 * True when `offset` lies in a template content range. Its end counts when the content's last line
 * holds Pug (`<template lang="pug">div</template>`): zero-width Pug end tags sit there; after a line
 * break the end is the `</template>` line.
 */
const inside = (text: string, offset: number, ranges: Range[]): boolean => ranges.some(([start, end]) =>
  start <= offset && (offset < end || (offset === end && end > start && text[end - 1] !== '\n' && text[end - 1] !== '\r')))

/**
 * True when `[a, b]` (in either order: a misreporting rule can emit an inverted range) overlaps a
 * range; a zero-width range overlaps when it lies within one, edges included.
 */
function intersects([a, b]: Range, ranges: Range[]): boolean {
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  return ranges.some(([start, end]) => (lo === hi ? start <= lo && lo <= end : lo < end && hi > start))
}

/**
 * `messages` without those whose `ruleId` is in `suppress` and whose start lies inside a Pug
 * template, or whose fix range intersects one (a rule can misplace the report but not the fix).
 */
export function suppressMessages(
  rawText: string,
  messages: Linter.LintMessage[],
  suppress: ReadonlySet<string>,
): Linter.LintMessage[] {
  // Message positions refer to the BOM-stripped text, as in ESLint.
  const text = rawText.charCodeAt(0) === 0xfeff ? rawText.slice(1) : rawText
  const ranges = getPugTemplates(text).map((t) => t.range)
  if (ranges.length === 0) return messages
  const index = createLineIndex(text)
  return messages.filter((m) => {
    if (m.ruleId === null || !suppress.has(m.ruleId)) return true
    if (m.fix && intersects(m.fix.range, ranges)) return false
    const offset = startOffset(index, m)
    return offset === null || !inside(text, offset, ranges)
  })
}
