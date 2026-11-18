import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { walk } from '@pug-lint/parser'
import type { AttributeValue, Range } from '@pug-lint/parser'
import { findPugTemplateRanges, getPugTemplates } from '../../src/shared/templates.ts'
import { allNodes, parseVue } from '../helpers/parse-vue.ts'
import type { AnyNode } from '../helpers/parse-vue.ts'
import { toCRLF, vue } from '../helpers/vue.ts'

const corpusDir = new URL('../fixtures/corpus/', import.meta.url)
const files = readdirSync(corpusDir).filter((f) => f.endsWith('.vue')).sort()

// Values vue-eslint-parser would read as quoted although they are not one Pug string, and textarea text.
const quoteStart = vue("a(:a=`'x'` :b=`\"y\" + z` :c=\"p\" + q d=`'e'`)\ntextarea {{ t }}")

const samples: [string, string][] = [
  ...files.map((name): [string, string] => [name, readFileSync(new URL(name, corpusDir), 'utf8').replace(/^\uFEFF/, '')]),
  ['quote-start values', quoteStart] as [string, string],
].flatMap(([name, lf]) => [[`${name} (as is)`, lf], [`${name} (CRLF)`, toCRLF(lf)]] as [string, string][])

const inside = (range: Range, outer: Range): boolean => outer[0] <= range[0] && range[1] <= outer[1]

/** CST attribute values by the start of the VLiteral range they map to. */
function cstValues(code: string): Map<number, AttributeValue> {
  const values = new Map<number, AttributeValue>()
  for (const { doc } of getPugTemplates(code)) {
    walk(doc, (node) => {
      if (node.type !== 'Tag' && node.type !== 'MixinCall') return
      for (const block of node.attributeBlocks) {
        for (const attr of block.attributes) {
          const v = attr.value
          if (!v) continue
          const insideBackticks = v.kind === 'template' && !v.hasSubstitution && !/^["']/.test(code.slice(...v.inner!))
          const literalStart = insideBackticks ? v.inner![0] : v.range[0]
          values.set(literalStart, v)
        }
      }
    })
  }
  return values
}

describe.each(samples)('AST invariants: %s', (_name, code) => {
  const body = parseVue(code).ast.templateBody
  const pugRanges = findPugTemplateRanges(code)

  it('has a templateBody whenever there is a Pug template', () => {
    if (pugRanges.length > 0) expect(body).toBeDefined()
  })

  it('has sorted, non-overlapping tokens whose values are their slices', () => {
    if (!body) return
    const tokens = body.tokens
    for (let i = 1; i < tokens.length; i++) {
      expect(tokens[i]!.range[0], `token ${i} ${tokens[i]!.type}`).toBeGreaterThanOrEqual(tokens[i - 1]!.range[1])
    }
    for (const token of tokens) {
      if (token.type === 'HTMLComment') continue
      if (!pugRanges.some((r) => inside(token.range, r))) continue // the stock HTML tokenizer's own tokens
      expect(token.value, `${token.type}@${token.range.join('-')}`).toBe(code.slice(...token.range))
    }
  })

  it('nests every node range inside its parent range', () => {
    if (!body) return
    for (const node of allNodes(body as unknown as AnyNode)) {
      const parent = node.parent
      if (!parent || !Array.isArray(parent.range)) continue
      expect(inside(node.range, parent.range), `${node.type}@${node.range.join('-')} in ${parent.type}@${parent.range.join('-')}`).toBe(true)
    }
  })

  it('starts a VLiteral with a quote exactly when the CST value is a string', () => {
    if (!body) return
    const values = cstValues(code)
    const literals = allNodes(body as unknown as AnyNode)
      .filter((n) => n.type === 'VLiteral' && pugRanges.some((r) => inside(n.range, r)))
    for (const literal of literals) {
      const cst = values.get(literal.range[0])
      expect(cst, `VLiteral@${literal.range.join('-')}`).toBeDefined()
      expect(/^["']/.test(code.slice(...literal.range))).toBe(cst!.kind === 'string')
    }
  })
})
