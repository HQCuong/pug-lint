import type { AST } from 'vue-eslint-parser'
import vueParser from 'vue-eslint-parser'
import { tokenizerPath } from '../../src/index.ts'

export type ParseResult = ReturnType<typeof vueParser.parseForESLint>

/** vue-eslint-parser with the built Pug tokenizer (`dist/tokenizer.cjs`) for `pug` and `jade`. */
export function parseVue(code: string): ParseResult {
  return vueParser.parseForESLint(code, {
    templateTokenizer: { pug: tokenizerPath, jade: tokenizerPath },
    ecmaVersion: 'latest',
    sourceType: 'module',
  })
}

/** Stock vue-eslint-parser, without a template tokenizer. */
export function parseVueStock(code: string): ParseResult {
  return vueParser.parseForESLint(code, { ecmaVersion: 'latest', sourceType: 'module' })
}

/** The template body of `result`; throws when there is none. */
export function templateBody(result: ParseResult): AST.VElement & AST.HasConcreteInfo {
  const body = result.ast.templateBody
  if (!body) throw new Error('parseVue(): no templateBody')
  return body
}

/** A node of either AST (Vue template or ESTree): anything with a `type` and a `range`. */
export interface AnyNode {
  type: string
  range: [number, number]
  parent?: AnyNode | null
  [key: string]: unknown
}

// Back-references and side tables: walking them would revisit nodes or leave the tree.
const SKIP_KEYS = new Set(['parent', 'tokens', 'comments', 'errors', 'references', 'variables', 'loc'])

const isNode = (v: unknown): v is AnyNode =>
  typeof v === 'object' && v !== null && typeof (v as AnyNode).type === 'string' && Array.isArray((v as AnyNode).range)

/** Every node under `root` (inclusive), pre-order, in key order. */
export function allNodes(root: AnyNode): AnyNode[] {
  const out: AnyNode[] = []
  const visit = (node: AnyNode): void => {
    out.push(node)
    for (const [key, value] of Object.entries(node)) {
      if (SKIP_KEYS.has(key)) continue
      for (const child of Array.isArray(value) ? value : [value]) if (isNode(child)) visit(child)
    }
  }
  visit(root)
  return out
}

/** `type@start-end` per node: a comparable skeleton of an AST. */
export function dump(root: AnyNode, shift = 0): string[] {
  return allNodes(root).map((n) => `${n.type}@${n.range[0] + shift}-${n.range[1] + shift}`)
}
