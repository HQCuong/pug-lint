// vue-pug/attribute-equals-spacing: the whitespace between an attribute's key and its `=` / `!=`
// operator, and between the operator and the value. Both gaps must be empty. A gap holding a line
// break is left alone: only same-line whitespace is this rule's.
import type { Attribute, AttributeBlock, Range } from '@pug-lint/parser'
import { walk } from '@pug-lint/parser'
import { createPugRule } from '../utils/create-rule.ts'

const hasLineBreak = (s: string): boolean => /[\r\n]/.test(s)

export default createPugRule<[]>({
  name: 'attribute-equals-spacing',
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: { description: 'disallow spaces around the `=` and `!=` of Pug attributes', recommended: true },
    schema: [],
    messages: {
      unexpected: "Unexpected space around '{{operator}}'.",
    },
  },
  defaultOptions: [],
  check(ctx) {
    const { text } = ctx

    const checkAttribute = (attribute: Attribute): void => {
      const { operator, value } = attribute
      if (!operator || ctx.inErrorRegion(attribute.range)) return
      const gaps: Range[] = [[attribute.key.range[1], operator.range[0]]]
      if (value) gaps.push([operator.range[1], value.range[0]])
      for (const gap of gaps) {
        if (gap[0] === gap[1] || hasLineBreak(text.slice(...gap))) continue
        ctx.report({ range: gap, messageId: 'unexpected', data: { operator: operator.value }, fix: (fixer) => fixer.removeRange(gap) })
      }
    }

    const checkBlock = (block: AttributeBlock): void => block.attributes.forEach(checkAttribute)

    walk(ctx.doc, (node) => {
      if (node.type === 'Tag' || node.type === 'MixinCall' || node.type === 'Filter') node.attributeBlocks.forEach(checkBlock)
    })
  },
})
