// vue-pug/attribute-quotes: the two quote characters of a string attribute value. A value in the
// wrong quotes is reported; the fix swaps the two quote characters only when the body holds neither
// the target quote nor a backslash, so nothing is ever re-escaped. Backtick values are kept unless
// `backticks: 'convert'`, and even then only single-line ones without `${}` and without any quote
// or backslash in their body. Expression values are never touched.
import type { Attribute, AttributeBlock, AttributeValue } from 'pug-lint-parser'
import { walk } from 'pug-lint-parser'
import { createPugRule } from '../utils/create-rule.ts'

type Options = ['double' | 'single', { backticks: 'keep' | 'convert' }]

const QUOTE = { double: '"', single: "'" } as const

export default createPugRule<Options>({
  name: 'attribute-quotes',
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: { description: 'enforce a consistent quote style for Pug attribute values', recommended: true },
    schema: [
      { enum: ['double', 'single'] },
      {
        type: 'object',
        properties: { backticks: { enum: ['keep', 'convert'] } },
        additionalProperties: false,
      },
    ],
    messages: {
      wrongQuotes: 'Expected {{expected}} quotes.',
    },
  },
  defaultOptions: ['double', { backticks: 'keep' }],
  check(ctx) {
    const { text } = ctx
    const [expected, { backticks }] = ctx.options
    const target = QUOTE[expected]

    /** Whether swapping the quotes of `value` for `target` keeps its meaning; `null` when it is not ours. */
    const fixable = (value: AttributeValue): boolean | null => {
      if (!value.inner || value.quote === target) return null
      const body = text.slice(...value.inner)
      if (value.kind === 'string') return !body.includes(target) && !body.includes('\\')
      if (value.kind === 'template' && backticks === 'convert' && !value.hasSubstitution && !/["'\\\r\n]/.test(body)) return true
      return null
    }

    const checkAttribute = (attribute: Attribute): void => {
      const { value } = attribute
      if (!value || ctx.inErrorRegion(attribute.range)) return
      const canFix = fixable(value)
      if (canFix === null) return
      const [start, end] = value.range
      ctx.report({
        range: value.range,
        messageId: 'wrongQuotes',
        data: { expected },
        ...(canFix && {
          fix: (fixer) => [fixer.replaceTextRange([start, start + 1], target), fixer.replaceTextRange([end - 1, end], target)],
        }),
      })
    }

    const checkBlock = (block: AttributeBlock): void => block.attributes.forEach(checkAttribute)

    walk(ctx.doc, (node) => {
      if (node.type === 'Tag' || node.type === 'MixinCall' || node.type === 'Filter') node.attributeBlocks.forEach(checkBlock)
    })
  },
})
