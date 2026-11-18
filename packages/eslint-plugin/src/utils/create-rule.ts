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
}

export interface PugRuleDefinition<O extends unknown[]> {
  name: string
  meta: Rule.RuleMetaData & { docs: { description: string; recommended: boolean } }
  defaultOptions: O
  check(ctx: PugRuleContext<O>): void
}

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
            def.check({
              context,
              options: context.options as O,
              doc: template.doc,
              text,
              report({ range, messageId, data, fix }) {
                const loc = { start: sourceCode.getLocFromIndex(range[0]), end: sourceCode.getLocFromIndex(range[1]) }
                context.report({ loc, messageId, ...(data && { data }), ...(fix && { fix }) })
              },
            })
          }
        },
      }
    },
  }
}
