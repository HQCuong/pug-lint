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

const inside = (offset: number, ranges: Range[]): boolean => ranges.some(([start, end]) => start <= offset && offset < end)

/** `messages` without those whose `ruleId` is in `suppress` and whose start lies inside a Pug template. */
export function suppressMessages(
  text: string,
  messages: Linter.LintMessage[],
  suppress: ReadonlySet<string>,
): Linter.LintMessage[] {
  const ranges = getPugTemplates(text).map((t) => t.range)
  if (ranges.length === 0) return messages
  const index = createLineIndex(text)
  return messages.filter((m) => {
    if (m.ruleId === null || !suppress.has(m.ruleId)) return true
    const offset = startOffset(index, m)
    return offset === null || !inside(offset, ranges)
  })
}
