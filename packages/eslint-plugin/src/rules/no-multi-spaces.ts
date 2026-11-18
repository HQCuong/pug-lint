// vue-pug/no-multi-spaces: a run of two or more spaces/tabs on one line between two attributes of
// the same attribute block becomes one space. A comma stays attached to the attribute before it, so
// only the run after the gap's last comma is measured. Values, the gaps next to the parens
// (vue-pug/attribute-parens-spacing) and inline text after the tag head are never touched.
import type { AttributeBlock } from '@pug-lint/parser'
import { walk } from '@pug-lint/parser'
import { createPugRule } from '../utils/create-rule.ts'

export default createPugRule<[]>({
  name: 'no-multi-spaces',
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: { description: 'disallow multiple spaces between attributes in Pug attribute blocks', recommended: true },
    schema: [],
    messages: {
      multipleSpaces: 'Multiple spaces found between attributes.',
    },
  },
  defaultOptions: [],
  check(ctx) {
    const { text } = ctx

    const checkBlock = (block: AttributeBlock): void => {
      if (ctx.inErrorRegion(block.range)) return
      const { attributes, commas } = block
      for (let g = 1; g < attributes.length; g++) {
        let start = attributes[g - 1]!.range[1]
        const end = attributes[g]!.range[0]
        for (const comma of commas) if (comma[0] >= start && comma[1] <= end) start = comma[1]
        if (end - start < 2 || !/^[ \t]+$/.test(text.slice(start, end))) continue
        ctx.report({
          range: [start, end],
          messageId: 'multipleSpaces',
          fix: (fixer) => fixer.replaceTextRange([start, end], ' '),
        })
      }
    }

    walk(ctx.doc, (node) => {
      if (node.type === 'Tag' || node.type === 'MixinCall' || node.type === 'Filter') node.attributeBlocks.forEach(checkBlock)
    })
  },
})
