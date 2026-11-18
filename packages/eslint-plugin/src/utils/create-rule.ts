// createPugRule(): the shape of every `vue-pug/*` rule. It runs `check` once per Pug template
// of the file, with that template's CST, and reports by CST range.
import type { PugDocument, Range } from '@pug-lint/parser'
import type { Rule } from 'eslint'
import { getPugTemplates } from '../shared/templates.ts'

const DOCS_URL = 'https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/'

export interface PugReportDescriptor {
  range: Range
  messageId: string
  data?: Record<string, string>
  fix?: Rule.ReportFixer
}

export interface PugRuleContext<O extends unknown[]> {
  context: Rule.RuleContext
  /** `context.options`: ESLint has already merged `meta.defaultOptions` into them. */
  options: O
  /** The CST of the template being checked (offsets into `text`). */
  doc: PugDocument
  /** The BOM-stripped file text (`context.sourceCode.text`). */
  text: string
  report(d: PugReportDescriptor): void
  /**
   * True when `range` touches a line the parser did not fully understand: a line holding a
   * `doc.errors` offset, or a `continuation` line of an error-recovery region (a continuation line
   * whose anchor line, or any line between the anchor and it, holds an error). Fixing rules skip
   * such ranges (shared rule requirement 4) so they never rewrite text the parser may have misread.
   */
  inErrorRegion(range: Range): boolean
}

export interface PugRuleDefinition<O extends unknown[]> {
  name: string
  meta: Rule.RuleMetaData & { docs: { description: string; recommended: boolean } }
  defaultOptions: O
  check(ctx: PugRuleContext<O>): void
}

/** Ranges (without EOL) of the lines `inErrorRegion` treats as unreliable. Also used by the convergence gate's mutation. */
export function errorLineRanges(doc: PugDocument): Range[] {
  const { lines, errors } = doc
  if (errors.length === 0) return []
  const errorLines = new Set<number>()
  for (const { offset } of errors) {
    // The last line starting at or before the offset (an offset in an EOL belongs to the line before it).
    let k = -1
    for (let i = 0; i < lines.length && lines[i]!.range[0] <= offset; i++) k = i
    if (k >= 0) errorLines.add(k)
  }
  return lines.flatMap((line, k) => {
    if (errorLines.has(k)) return [line.range]
    if (line.kind !== 'continuation' || line.anchor === null) return []
    for (let j = line.anchor; j < k; j++) if (errorLines.has(j)) return [line.range]
    return []
  })
}

const touches = ([start, end]: Range, ranges: readonly Range[]): boolean =>
  ranges.some(([ls, le]) => start <= le && end >= ls)

export function createPugRule<O extends unknown[]>(def: PugRuleDefinition<O>): Rule.RuleModule {
  return {
    meta: {
      ...def.meta,
      docs: { ...def.meta.docs, url: `${DOCS_URL}${def.name}.md` },
      defaultOptions: def.defaultOptions,
    },
    create(context) {
      const { sourceCode } = context
      return {
        Program() {
          const text = sourceCode.text
          for (const template of getPugTemplates(text)) {
            let unreliable: Range[] | undefined
            def.check({
              context,
              options: context.options as O,
              doc: template.doc,
              text,
              report({ range, messageId, data, fix }) {
                const loc = { start: sourceCode.getLocFromIndex(range[0]), end: sourceCode.getLocFromIndex(range[1]) }
                context.report({ loc, messageId, ...(data && { data }), ...(fix && { fix }) })
              },
              inErrorRegion(range) {
                unreliable ??= errorLineRanges(template.doc)
                return touches(range, unreliable)
              },
            })
          }
        },
      }
    },
  }
}
