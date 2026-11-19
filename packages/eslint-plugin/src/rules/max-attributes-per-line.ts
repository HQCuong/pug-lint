// vue-pug/max-attributes-per-line: whether the gap between two adjacent attributes of a block holds
// a line break. A block on one line holding more than `singleline` attributes gets every attribute
// after the first on its own line. In a block spanning lines (a value spanning lines counts),
// attributes joined by gaps without a break share a line; a line holding more than `multiline` of
// them gets the extras moved.
// The fix replaces the whitespace right before the attribute (a comma stays with the attribute before
// it); the gaps after `(` and before `)` belong to vue-pug/attribute-parens-newline. Tags inside a tag
// interpolation `#[...]` are left alone: their line is a text line and cannot break.
import type { Attribute, AttributeBlock } from 'pug-lint-parser'
import { walk } from 'pug-lint-parser'
import { createPugRule } from '../utils/create-rule.ts'
import { depthAt } from '../utils/depth-at.ts'

type Options = [{ singleline: number; multiline: number }]

const isSpace = (c: string | undefined): boolean => c !== undefined && /\s/.test(c)
const hasLineBreak = (s: string): boolean => /[\r\n]/.test(s)

export default createPugRule<Options>({
  name: 'max-attributes-per-line',
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: { description: 'enforce a maximum number of attributes per line in Pug attribute blocks', recommended: true },
    schema: [
      {
        type: 'object',
        properties: {
          singleline: { type: 'integer', minimum: 1 },
          multiline: { type: 'integer', minimum: 1 },
        },
        additionalProperties: false,
      },
    ],
    messages: { shouldBeOnNewLine: "'{{name}}' should be on a new line." },
  },
  defaultOptions: [{ singleline: 3, multiline: 1 }],
  check(ctx) {
    const [{ singleline, multiline }] = ctx.options
    const { doc, text } = ctx

    const checkBlock = (block: AttributeBlock, newLine: string): void => {
      const { attributes } = block
      if (attributes.length < 2 || ctx.inErrorRegion(block.range)) return

      const extras: Attribute[] = []
      if (!hasLineBreak(text.slice(...block.range))) {
        if (attributes.length > singleline) extras.push(...attributes.slice(1))
      } else {
        let line: Attribute[] = []
        const flush = (): void => {
          if (line.length > multiline) extras.push(...line.slice(multiline))
        }
        for (const [i, a] of attributes.entries()) {
          if (i > 0 && hasLineBreak(text.slice(attributes[i - 1]!.range[1], a.range[0]))) {
            flush()
            line = []
          }
          line.push(a)
        }
        flush()
      }

      for (const attr of extras) {
        const end = attr.range[0]
        let start = end
        while (isSpace(text[start - 1])) start--
        ctx.report({
          range: attr.range,
          messageId: 'shouldBeOnNewLine',
          data: { name: attr.key.raw },
          fix: (fixer) => fixer.replaceTextRange([start, end], newLine),
        })
      }
    }

    walk(doc, (node, parent) => {
      if (node.type !== 'Tag' && node.type !== 'MixinCall' && node.type !== 'Filter') return
      if (node.attributeBlocks.length === 0 || parent.type === 'Text') return
      const newLine = doc.eol + doc.indentUnit.repeat(depthAt(doc.lines, node.range[0]) + 1)
      for (const block of node.attributeBlocks) checkBlock(block, newLine)
    })
  },
})
