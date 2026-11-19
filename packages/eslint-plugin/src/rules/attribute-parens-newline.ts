// vue-pug/attribute-parens-newline: whether the gap after `(` and the gap before `)` of an attribute
// block hold a line break. A block is multiline when two of its attributes start on different lines.
// `always` requires both breaks in a multiline block; `never` forbids them; a block that is not
// multiline never has them. Same-line spaces in a gap without a break belong to
// vue-pug/attribute-parens-spacing; an empty block is left alone.
import type { AttributeBlock, Range } from 'pug-lint-parser'
import { walk } from 'pug-lint-parser'
import { createPugRule } from '../utils/create-rule.ts'
import { depthAt } from '../utils/depth-at.ts'

type Options = [{ multiline: 'always' | 'never' }]

const isSpace = (c: string | undefined): boolean => c !== undefined && /\s/.test(c)
const hasLineBreak = (s: string): boolean => /[\r\n]/.test(s)

export default createPugRule<Options>({
  name: 'attribute-parens-newline',
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: { description: 'enforce line breaks after `(` and before `)` of multiline Pug attribute blocks', recommended: true },
    schema: [
      {
        type: 'object',
        properties: { multiline: { enum: ['always', 'never'] } },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedAfterOpen: "Expected a line break after '('.",
      expectedBeforeClose: "Expected a line break before ')'.",
      unexpectedAfterOpen: "Unexpected line break after '('.",
      unexpectedBeforeClose: "Unexpected line break before ')'.",
    },
  },
  defaultOptions: [{ multiline: 'always' }],
  check(ctx) {
    const [{ multiline: style }] = ctx.options
    const { doc, text } = ctx
    const { eol, indentUnit } = doc

    const checkBlock = (block: AttributeBlock, tagDepth: number): void => {
      const { attributes } = block
      if (attributes.length === 0 || ctx.inErrorRegion(block.range)) return
      const open = block.range[0]
      const close = block.range[1] - 1
      let first = open + 1
      while (first < close && isSpace(text[first])) first++
      let last = close
      while (last > first && isSpace(text[last - 1])) last--

      const multiline = attributes.some((a, i) => i > 0 && hasLineBreak(text.slice(attributes[i - 1]!.range[0], a.range[0])))
      const required = multiline && style === 'always'
      const sides = [
        { gap: [open + 1, first] as Range, paren: [open, open + 1] as Range, depth: tagDepth + 1, side: 'AfterOpen' },
        { gap: [last, close] as Range, paren: [close, close + 1] as Range, depth: tagDepth, side: 'BeforeClose' },
      ]
      for (const { gap, paren, depth, side } of sides) {
        const broken = hasLineBreak(text.slice(...gap))
        if (required && !broken) {
          const fixed = eol + indentUnit.repeat(depth)
          ctx.report({ range: paren, messageId: `expected${side}`, fix: (fixer) => fixer.replaceTextRange(gap, fixed) })
        } else if (!required && broken) {
          ctx.report({ range: gap, messageId: `unexpected${side}`, fix: (fixer) => fixer.removeRange(gap) })
        }
      }
    }

    walk(doc, (node) => {
      if (node.type !== 'Tag' && node.type !== 'MixinCall' && node.type !== 'Filter') return
      if (node.attributeBlocks.length === 0) return
      const depth = depthAt(doc.lines, node.range[0])
      for (const block of node.attributeBlocks) checkBlock(block, depth)
    })
  },
})
