// vue-pug/attribute-commas: the comma characters between the attributes of an attribute block.
// `never` removes every comma; `always` puts exactly one between each pair of attributes. A comma
// before the first or after the last attribute is always unexpected. Removing a comma adds one
// space only when it would otherwise glue two attributes together.
import type { AttributeBlock, Range } from '@pug-lint/parser'
import { walk } from '@pug-lint/parser'
import { createPugRule } from '../utils/create-rule.ts'

type Options = ['never' | 'always']

const isSpace = (c: string | undefined): boolean => c === undefined || /\s/.test(c)

/** The block's commas grouped by the gap they sit in: gap g is just before attribute g (gap n is after the last). */
function commasByGap(block: AttributeBlock): Map<number, Range[]> {
  const gaps = new Map<number, Range[]>()
  let g = 0
  for (const comma of block.commas) {
    while (g < block.attributes.length && block.attributes[g]!.range[0] < comma[0]) g++
    const run = gaps.get(g)
    if (run) run.push(comma)
    else gaps.set(g, [comma])
  }
  return gaps
}

export default createPugRule<Options>({
  name: 'attribute-commas',
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: { description: 'require or disallow commas between attributes in Pug attribute blocks', recommended: true },
    schema: [{ enum: ['never', 'always'] }],
    messages: {
      unexpected: 'Unexpected comma in attribute block.',
      missing: 'Expected a comma between attributes.',
    },
  },
  defaultOptions: ['never'],
  check(ctx) {
    const [style] = ctx.options
    const { text } = ctx

    const checkBlock = (block: AttributeBlock): void => {
      if (ctx.inErrorRegion(block.range)) return
      const { attributes } = block
      const gaps = commasByGap(block)
      for (const [g, run] of gaps) {
        const between = g > 0 && g < attributes.length
        // Under `always`, the first comma between two attributes is the one to keep.
        const extra = style === 'always' && between ? run.slice(1) : run
        if (extra.length === 0) continue
        // The commas of one gap are only separated by whitespace: one fix removes all of them, so a
        // single pass is final (fixes for adjacent commas would not all apply in the same pass).
        const start = run[0]![0]
        const end = run.at(-1)![1]
        let fixed = ''
        let at = start
        for (const comma of extra) {
          fixed += text.slice(at, comma[0])
          at = comma[1]
        }
        fixed += text.slice(at, end)
        if (between && fixed === '' && !isSpace(text[start - 1]) && !isSpace(text[end])) fixed = ' '
        for (const comma of extra) {
          ctx.report({ range: comma, messageId: 'unexpected', fix: (fixer) => fixer.replaceTextRange([start, end], fixed) })
        }
      }
      if (style !== 'always') return
      for (let g = 1; g < attributes.length; g++) {
        if (gaps.has(g)) continue
        const prev = attributes[g - 1]!.range
        ctx.report({
          range: [prev[1], attributes[g]!.range[0]],
          messageId: 'missing',
          fix: (fixer) => fixer.insertTextAfterRange(prev, ','),
        })
      }
    }

    walk(ctx.doc, (node) => {
      if (node.type === 'Tag' || node.type === 'MixinCall' || node.type === 'Filter') node.attributeBlocks.forEach(checkBlock)
    })
  },
})
