// vue-pug/attribute-parens-spacing: the same-line whitespace directly after `(` and directly before
// `)` of an attribute block. `never` removes it; `always` requires some. A side whose gap holds a
// line break belongs to vue-pug/attribute-parens-newline and is left alone, and so is an empty
// (or whitespace-only) block.
import type { AttributeBlock, Range } from '@pug-lint/parser'
import { walk } from '@pug-lint/parser'
import { createPugRule } from '../utils/create-rule.ts'

type Options = ['never' | 'always']

const isSpace = (c: string | undefined): boolean => c !== undefined && /\s/.test(c)
const hasLineBreak = (s: string): boolean => /[\r\n]/.test(s)

export default createPugRule<Options>({
  name: 'attribute-parens-spacing',
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: { description: 'enforce consistent spacing inside the parentheses of Pug attribute blocks', recommended: true },
    schema: [{ enum: ['never', 'always'] }],
    messages: {
      unexpectedAfterOpen: "Unexpected space after '('.",
      unexpectedBeforeClose: "Unexpected space before ')'.",
      missingAfterOpen: "Expected a space after '('.",
      missingBeforeClose: "Expected a space before ')'.",
    },
  },
  defaultOptions: ['never'],
  check(ctx) {
    const [style] = ctx.options
    const { text } = ctx

    const checkBlock = (block: AttributeBlock): void => {
      if (ctx.inErrorRegion(block.range)) return
      const open = block.range[0]
      const close = block.range[1] - 1
      let first = open + 1
      while (first < close && isSpace(text[first])) first++
      if (first === close) return
      let last = close
      while (last > first && isSpace(text[last - 1])) last--

      const sides: Array<{ gap: Range; paren: Range; unexpected: string; missing: string }> = [
        { gap: [open + 1, first], paren: [open, open + 1], unexpected: 'unexpectedAfterOpen', missing: 'missingAfterOpen' },
        { gap: [last, close], paren: [close, close + 1], unexpected: 'unexpectedBeforeClose', missing: 'missingBeforeClose' },
      ]
      for (const { gap, paren, unexpected, missing } of sides) {
        if (hasLineBreak(text.slice(...gap))) continue
        const empty = gap[0] === gap[1]
        if (style === 'never' && !empty) {
          ctx.report({ range: gap, messageId: unexpected, fix: (fixer) => fixer.removeRange(gap) })
        } else if (style === 'always' && empty) {
          ctx.report({ range: paren, messageId: missing, fix: (fixer) => fixer.insertTextAfterRange([gap[0], gap[0]], ' ') })
        }
      }
    }

    walk(ctx.doc, (node) => {
      if (node.type === 'Tag' || node.type === 'MixinCall' || node.type === 'Filter') node.attributeBlocks.forEach(checkBlock)
    })
  },
})
