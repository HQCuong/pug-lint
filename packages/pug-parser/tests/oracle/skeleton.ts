// Tree skeletons for the differential oracle: the official `pug-lexer` +
// `pug-parser` AST and our CST mapped to one comparable shape.
import { createRequire } from 'node:module'
import type { Attribute, AttributeBlock, MixinCall, PugDocument, PugNode, Tag, Text } from '../../src/ast.ts'

export interface SkelAttr { name: string; val: string; line: number; column: number }
export interface Skel {
  kind: string
  name?: string
  line: number
  column: number
  attrs?: SkelAttr[]
  children: Skel[]
}

// Dev-only CommonJS packages without (pug-parser) or with ambient (pug-lexer) types.
const require = createRequire(import.meta.url)
const lex = require('pug-lexer') as (src: string, options?: { filename?: string }) => unknown[]
const parse = require('pug-parser') as (tokens: unknown[], options?: { filename?: string; src?: string }) => PugAst

/** The subset of pug-parser's AST node fields the skeleton reads. */
interface PugAst {
  type: string
  nodes?: PugAst[]
  block?: PugAst | null
  consequent?: PugAst
  alternate?: PugAst | null
  name?: string
  call?: boolean
  attrs?: { name: string; val: string | boolean; line: number; column: number }[]
  val?: string
  expr?: string
  buffer?: boolean
  mustEscape?: boolean
  isInline?: boolean
  line: number
  column?: number
}

/** `src` without the whitespace common to all of its non-blank lines, and that width. */
export function dedent(src: string): { text: string; width: number } {
  const lines = src.split(/(?<=\r\n|\r|\n)/)
  const indents = lines.filter((l) => l.trim() !== '').map((l) => /^[ \t]*/.exec(l)![0])
  if (indents.length === 0) return { text: src, width: 0 }
  let common = indents[0]!
  for (const indent of indents) {
    while (!indent.startsWith(common)) common = common.slice(0, -1)
  }
  if (common === '') return { text: src, width: 0 }
  const text = lines.map((l) => (l.startsWith(common) ? l.slice(common.length) : l.replace(/^[ \t]+/, ''))).join('')
  return { text, width: common.length }
}

/** Runs of adjacent `Text` skeletons merged into the first; empty children lists untouched. */
function mergeText(nodes: Skel[]): Skel[] {
  const out: Skel[] = []
  for (const node of nodes) {
    if (node.kind === 'Text' && out[out.length - 1]?.kind === 'Text') continue
    out.push(node)
  }
  return out
}

// ---------------------------------------------------------------------------
// Official Pug

/**
 * Lex and parse `src` with the official packages. `{ ok: false }` when either
 * throws (Pug rejects the source).
 */
export function officialSkeleton(src: string): { ok: true; nodes: Skel[] } | { ok: false } {
  let ast: PugAst
  const warn = console.warn
  console.warn = () => {}    // pug-parser warns about `a(x)(y)`; keep test output clean
  try {
    ast = parse(lex(src, { filename: 'oracle.pug' }), { filename: 'oracle.pug', src })
  } catch {
    return { ok: false }
  } finally {
    console.warn = warn
  }
  const lines = src.replace(/^﻿/, '').split(/\r\n|\r|\n/)
  return { ok: true, nodes: officialBlock(ast, lines) }
}

function officialBlock(block: PugAst | null | undefined, lines: string[]): Skel[] {
  if (!block) return []
  const nodes = block.type === 'Block' || block.type === 'NamedBlock' ? block.nodes ?? [] : [block]
  return mergeText(nodes.flatMap((n) => officialNode(n, lines)))
}

function officialNode(n: PugAst, lines: string[]): Skel[] {
  const at = { line: n.line, column: n.column ?? 1 }
  const children = (b: PugAst | null | undefined): Skel[] => officialBlock(b, lines)
  const control = (name: string, b: PugAst | null | undefined): Skel => ({ kind: 'Control', name, ...at, children: children(b) })
  switch (n.type) {
    case 'Block':
      return officialBlock(n, lines)
    case 'Tag':
    case 'InterpolatedTag':
    case 'Mixin': {
      if (n.type === 'Mixin' && !n.call) return [control('mixin', n.block)]
      const attrs = (n.attrs ?? []).map((a) => ({ name: a.name, val: String(a.val), line: a.line, column: a.column }))
      const kind = n.type === 'Mixin' ? 'MixinCall' : n.type
      return [{ kind, ...(n.name === undefined ? {} : { name: n.name }), ...at, attrs, children: children(n.block) }]
    }
    case 'Text':
      return n.val === '' ? [] : [{ kind: 'Text', ...at, children: [] }]
    case 'Code': {
      // `#{x}` / `!{x}` in text is an inline Code node: it is part of the text.
      const source = lines[n.line - 1]?.slice((n.column ?? 1) - 1) ?? ''
      if (n.isInline && /^[#!]\{/.test(source)) return [{ kind: 'Text', ...at, children: [] }]
      const name = n.buffer ? (n.mustEscape ? '=' : '!=') : '-'
      return [{ kind: 'Code', name, ...at, children: children(n.block) }]
    }
    case 'Comment':
    case 'BlockComment':
      return [{ kind: 'Comment', name: n.buffer ? '//' : '//-', ...at, children: [] }]
    case 'Conditional': {
      const out = [control('if', n.consequent)]
      let alt = n.alternate
      while (alt) {
        if (alt.type === 'Conditional') {
          out.push({ ...control('else if', alt.consequent), line: alt.line, column: alt.column ?? 1 })
          alt = alt.alternate
        } else {
          out.push({ ...control('else', alt), line: alt.line, column: alt.column ?? 1 })
          alt = null
        }
      }
      return out
    }
    case 'Each':
    case 'EachOf': {
      const out = [control('each', n.block)]
      if (n.alternate) out.push({ ...control('else', n.alternate), line: n.alternate.line, column: n.alternate.column ?? 1 })
      return out
    }
    case 'While':
      return [control('while', n.block)]
    case 'Case':
      return [control('case', n.block)]
    case 'When':
      return [control(n.expr === 'default' ? 'default' : 'when', n.block)]
    case 'MixinBlock':
    case 'NamedBlock':
      return [control('block', n.type === 'NamedBlock' ? n : null)]
    case 'YieldBlock':
      return [control('yield', null)]
    case 'Include':
    case 'RawInclude':
      return [control('include', n.block)]
    case 'Extends':
      return [control('extends', null)]
    case 'Doctype':
      return [control('doctype', null)]
    case 'Filter': {
      // `:a:b text` is Filter a whose block holds only Filter b.
      const names = [n.name ?? '']
      let inner = n
      for (;;) {
        const only = inner.block?.nodes?.length === 1 ? inner.block.nodes[0]! : null
        if (!only || only.type !== 'Filter' || only.line !== n.line) break
        names.push(only.name ?? '')
        inner = only
      }
      return [{ kind: 'Filter', name: names.join(':'), ...at, children: children(inner.block) }]
    }
    default:
      return [{ kind: n.type, ...at, children: [] }]
  }
}

// ---------------------------------------------------------------------------
// Our CST

/** 1-based line and column of each offset of `text`, as pug-lexer counts them. */
function locator(text: string): (offset: number) => { line: number; column: number } {
  const starts = [0]
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '\r' && text[i + 1] === '\n') continue
    if (c === '\n' || c === '\r') starts.push(i + 1)
  }
  return (offset) => {
    let lo = 0
    let hi = starts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (starts[mid]! <= offset) lo = mid
      else hi = mid - 1
    }
    return { line: lo + 1, column: offset - starts[lo]! + 1 }
  }
}

const CONTROL_NAMES: Record<string, string> = { unless: 'if', for: 'each', append: 'block', prepend: 'block' }

/** Our CST as a skeleton: shorthands become `class`/`id` attributes (value `'name'`), an implicit tag is `div`. */
export function ourSkeleton(doc: PugDocument): Skel[] {
  const loc = locator(doc.text)

  const attrs = (n: Tag | MixinCall): SkelAttr[] => {
    const items: { start: number; attr: SkelAttr }[] = n.shorthands.map((s) => ({
      start: s.range[0], attr: { name: s.kind, val: `'${s.value}'`, ...loc(s.range[0]) },
    }))
    const fromBlock = (a: Attribute): { start: number; attr: SkelAttr } => ({
      start: a.range[0],
      attr: { name: a.key.raw.replace(/^['"]|['"]$/g, ''), val: a.value ? a.value.raw : 'true', ...loc(a.range[0]) },
    })
    items.push(...n.attributeBlocks.flatMap((b: AttributeBlock) => b.attributes.map(fromBlock)))
    return items.sort((a, b) => a.start - b.start).map((i) => i.attr)
  }

  const textSkel = (t: Text): Skel[] => t.parts.flatMap((p): Skel[] =>
    p.type === 'TagInterpolation' ? node(p.tag) : [{ kind: 'Text', ...loc(p.range[0]), children: [] }])

  // Pug's AST drops what it ignores: an empty `else` of a conditional, and
  // comments directly inside `case`. Drop them here too.
  const dropped = (n: PugNode, i: number, nodes: readonly PugNode[], parent: PugNode | null): boolean => {
    if (n.type === 'Comment') return parent?.type === 'Control' && parent.keyword === 'case'
    if (n.type !== 'Control' || n.keyword !== 'else' || n.children.length > 0) return false
    const prev = nodes[i - 1]
    return prev?.type === 'Control' && ['if', 'unless', 'else if'].includes(prev.keyword)
  }
  const list = (nodes: readonly PugNode[], parent: PugNode | null = null): Skel[] =>
    mergeText(nodes.filter((n, i) => !dropped(n, i, nodes, parent)).flatMap(node))

  function node(n: PugNode): Skel[] {
    const at = loc(n.range[0])
    switch (n.type) {
      case 'Tag':
        return [{ kind: 'Tag', name: n.name?.value ?? 'div', ...at, attrs: attrs(n), children: list(n.children) }]
      case 'MixinCall':
        return [{ kind: 'MixinCall', name: n.name.value, ...at, attrs: attrs(n), children: list(n.children) }]
      case 'Text':
        return textSkel(n)
      case 'Comment':
        return [{ kind: 'Comment', name: n.buffered ? '//' : '//-', ...at, children: [] }]
      case 'Code':
        return [{ kind: 'Code', name: n.buffered ? (n.escaped ? '=' : '!=') : '-', ...at, children: list(n.children) }]
      case 'Control':
        return [{ kind: 'Control', name: CONTROL_NAMES[n.keyword] ?? n.keyword, ...at, children: list(n.children, n) }]
      case 'Filter':
        return [{ kind: 'Filter', name: n.name, ...at, children: list(n.children) }]
    }
  }
  return list(doc.children)
}
