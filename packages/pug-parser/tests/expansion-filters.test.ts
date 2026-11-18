import { describe, expect, it } from 'vitest'
import type { Code, Control, Filter, PugDocument, PugNode, Range, Tag, Text } from '../src/ast.ts'
import { fingerprint, parsePug } from '../src/index.ts'
import { assertInvariants, at } from './helpers.ts'

const slice = (text: string, [s, e]: Range): string => text.slice(s, e)

function parse(src: string): PugDocument {
  const doc = parsePug(src)
  assertInvariants(doc)
  return doc
}

function as<T extends PugNode['type']>(type: T, node: PugNode | undefined): Extract<PugNode, { type: T }> {
  if (node?.type !== type) throw new Error(`expected a ${type}, got ${node?.type}`)
  return node as Extract<PugNode, { type: T }>
}
const asTag = (n: PugNode | undefined): Tag => as('Tag', n)
const asText = (n: PugNode | undefined): Text => as('Text', n)
const asCode = (n: PugNode | undefined): Code => as('Code', n)
const asControl = (n: PugNode | undefined): Control => as('Control', n)
const asFilter = (n: PugNode | undefined): Filter => as('Filter', n)

const errorsOf = (doc: PugDocument): [string, number][] => doc.errors.map((e) => [e.code, e.offset])

describe('block expansion', () => {
  it('nests the expansion child as children[0] and keeps the fingerprint of the nested form', () => {
    const src = 'ul\n  li: a(href="#") x'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const li = asTag(asTag(doc.children[0]).children[0])
    expect(li.name?.value).toBe('li')
    expect(li.expansion).toEqual(at(src, ':'))
    expect(slice(src, li.expansion!)).toBe(':')
    expect(li.children).toHaveLength(1)
    const a = asTag(li.children[0])
    expect(a.name?.value).toBe('a')
    expect(a.attributeBlocks[0]!.attributes).toHaveLength(1)
    const text = asText(a.children[0])
    expect(text.form).toBe('inline')
    expect(slice(src, text.content)).toBe('x')
    expect(fingerprint(doc)).toBe(fingerprint(parse('ul\n  li\n    a(href="#") x')))
  })

  it('chains expansions', () => {
    const src = 'a: b: c'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const a = asTag(doc.children[0])
    const b = asTag(a.children[0])
    const c = asTag(b.children[0])
    expect([a, b, c].map((t) => t.name?.value)).toEqual(['a', 'b', 'c'])
    expect(a.expansion).toEqual(at(src, ':'))
    expect(b.expansion).toEqual(at(src, ':', 1))
    expect(c.expansion).toBeNull()
    expect(c.children).toEqual([])
    expect(doc.lines.map((l) => l.kind)).toEqual(['node'])
  })

  it('chains through attributes: li: a(href="#"): span x', () => {
    const src = 'li: a(href="#"): span x'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const span = asTag(asTag(asTag(doc.children[0]).children[0]).children[0])
    expect(span.name?.value).toBe('span')
    expect(slice(src, asText(span.children[0]).content)).toBe('x')
  })

  it('puts the lines nested under a chain into its innermost node', () => {
    const src = 'li: a\n  span\np'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const a = asTag(asTag(doc.children[0]).children[0])
    expect(a.children.map((c) => asTag(c).name?.value)).toEqual(['span'])
    expect(asTag(doc.children[1]).name?.value).toBe('p')
  })

  it('gives a text block to the innermost tag of a chain', () => {
    const src = 'li: p.\n  some text\nspan'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const p = asTag(asTag(doc.children[0]).children[0])
    expect(p.dot).toEqual(at(src, '.'))
    expect(slice(src, asText(p.children[0]).content)).toBe('some text')
    expect(doc.lines.map((l) => l.kind)).toEqual(['node', 'raw', 'node'])
  })

  it('accepts code and a mixin call as the expansion child', () => {
    const src = 'li: a= x\nli: +m(1)'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const a = asTag(asTag(doc.children[0]).children[0])
    expect(slice(src, asCode(a.children[0]).expression)).toBe('x')
    expect(as('MixinCall', asTag(doc.children[1]).children[0]).name.value).toBe('m')
  })

  it('reads a multi-line attribute block of an expansion child', () => {
    const src = 'li: a(\n  href="#"\n) x\np'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const a = asTag(asTag(doc.children[0]).children[0])
    expect(a.attributeBlocks[0]!.attributes.map((x) => x.key.raw)).toEqual(['href'])
    expect(slice(src, asText(a.children[0]).content)).toBe('x')
    expect(doc.lines.map((l) => l.kind)).toEqual(['node', 'attribute', 'paren-close', 'node'])
  })

  it('parses the expansion child of when / default', () => {
    const src = "case x\n  when 1: p a\n  when 'a:b': p b\n  default: p c\n    span"
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const [w1, w2, def] = asControl(doc.children[0]).children.map(asControl)
    expect([w1, w2, def].map((c) => c!.keyword)).toEqual(['when', 'when', 'default'])
    expect([w1, w2, def].map((c) => slice(src, c!.head))).toEqual(['1', "'a:b'", ''])
    const p = asTag(w1!.children[0])
    expect(p.name?.value).toBe('p')
    expect(slice(src, asText(p.children[0]).content)).toBe('a')
    expect(slice(src, asText(asTag(w2!.children[0]).children[0]).content)).toBe('b')
    const pc = asTag(def!.children[0])
    expect(pc.children.map((c) => c.type)).toEqual(['Text', 'Tag'])
    expect(fingerprint(doc)).toBe(fingerprint(parse("case x\n  when 1\n    p a\n  when 'a:b'\n    p b\n  default\n    p c\n      span")))
  })

  it('reports block expansion after a conditional (Pug rejects it) instead of swallowing it', () => {
    const src = 'if a\n  p\nelse: p\nif: p\nelse if: p'
    const doc = parse(src)
    expect(errorsOf(doc)).toEqual([
      ['unsupported-syntax', at(src, ':')[0]],
      ['unsupported-syntax', at(src, ':', 1)[0]],
      ['unsupported-syntax', at(src, ':', 2)[0]],
    ])
    expect(doc.children.map((c) => asControl(c).keyword)).toEqual(['if', 'else', 'if', 'else if'])
  })

  it('reports expansion children and forms it does not support', () => {
    const src = 'p: :markdown text\nli: | x\n+m: p\nimg/: x\nli:\nli(x):b\nwhen 1:\nli: if x\nwhen 2: each x in y'
    const doc = parse(src)
    expect(errorsOf(doc)).toEqual([
      ['unsupported-syntax', at(src, ':markdown')[0]],
      ['unsupported-syntax', at(src, '| x')[0]],
      ['unsupported-syntax', at(src, ': p')[0]],
      ['unsupported-syntax', at(src, ': x')[0]],
      ['unsupported-syntax', at(src, 'li:\n')[0] + 2],
      ['unsupported-syntax', at(src, ':b')[0]],
      ['unsupported-syntax', at(src, '1:')[0] + 1],
      ['unsupported-syntax', at(src, 'if x')[0]],
      ['unsupported-syntax', at(src, 'each')[0]],
    ])
    expect(asTag(doc.children[7]).children).toEqual([])
    expect(asControl(doc.children[8]).children).toEqual([])
    for (const tag of doc.children.slice(0, 2).map(asTag)) {
      expect(tag.expansion).toBeNull()
      expect(tag.children).toEqual([])
    }
  })
})

describe('filters', () => {
  it('parses a filter with an indented raw block', () => {
    const src = ':markdown\n  # Title\n  text\np'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const filter = asFilter(doc.children[0])
    expect(filter.name).toBe('markdown')
    expect(filter.range).toEqual(at(src, ':markdown'))
    expect(filter.children).toHaveLength(2)
    expect(filter.children.map((t) => t.form)).toEqual(['block', 'block'])
    expect(filter.children.map((t) => slice(src, t.content))).toEqual(['# Title', 'text'])
    expect(asTag(doc.children[1]).name?.value).toBe('p')
    expect(doc.lines.map((l) => l.kind)).toEqual(['node', 'raw', 'raw', 'node'])
  })

  it('parses filter attributes', () => {
    const src = 'script\n  :uglify-js(mangle=false)\n    var a'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const filter = asFilter(asTag(doc.children[0]).children[0])
    expect(filter.name).toBe('uglify-js')
    expect(filter.attributeBlocks[0]!.attributes.length).toBe(1)
    expect(filter.attributeBlocks[0]!.range).toEqual(at(src, '(mangle=false)'))
    expect(slice(src, filter.children[0]!.content)).toBe('var a')
  })

  it('keeps filter text raw: no interpolation parts', () => {
    const src = ':markdown\n  a #{b} #[i c]\n\n  d'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const filter = asFilter(doc.children[0])
    for (const t of filter.children) expect(t.parts).toEqual([{ type: 'Raw', range: t.content }])
    expect(doc.lines.map((l) => l.kind)).toEqual(['node', 'raw', 'blank', 'raw'])
  })

  it('parses an inline filter', () => {
    const src = ':less(compress=true) a { b: c }\np'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const filter = asFilter(doc.children[0])
    expect(filter.name).toBe('less')
    expect(filter.attributeBlocks[0]!.attributes[0]!.key.raw).toBe('compress')
    expect(filter.children.map((t) => [t.form, slice(src, t.content)])).toEqual([['inline', 'a { b: c }']])
    expect(filter.children[0]!.parts).toEqual([{ type: 'Raw', range: at(src, 'a { b: c }') }])
  })

  it('parses nested filters as one filter named by the chain', () => {
    const src = ':a:b\n  x'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const filter = asFilter(doc.children[0])
    expect(filter.name).toBe('a:b')
    expect(slice(src, filter.children[0]!.content)).toBe('x')
    expect(fingerprint(doc)).toBe('Fa:b')
  })

  it('reads a filter head followed by anything but text as unsupported', () => {
    const src = ':a(x):b\n  y\np'
    const doc = parse(src)
    expect(errorsOf(doc)).toEqual([['unsupported-syntax', at(src, ':b')[0]]])
    expect(asFilter(doc.children[0]).children).toHaveLength(1)
    expect(asTag(doc.children[1]).name?.value).toBe('p')
  })

  it('reads include with a filter as a Control, not a namespaced tag', () => {
    const src = 'include:markdown ./a.md'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const include = asControl(doc.children[0])
    expect(include.keyword).toBe('include')
    expect(slice(src, include.head)).toBe(':markdown ./a.md')
  })
})

describe('remaining head forms', () => {
  it('continues with text or code after "/" and &attributes', () => {
    const src = 'img/ x\na&attributes(o) text\np&attributes(a)= b'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const [img, a, p] = doc.children.map(asTag)
    expect(img!.selfClose).toEqual(at(src, '/'))
    expect(slice(src, asText(img!.children[0]).content)).toBe('x')
    expect(slice(src, asText(a!.children[0]).content)).toBe('text')
    expect(slice(src, asCode(p!.children[0]).expression)).toBe('b')
  })

  it('parses expansion and code inside a tag interpolation', () => {
    const src = 'p #[li: a x] #[b= y]'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const parts = asText(asTag(doc.children[0]).children[0]).parts
    const [li, b] = parts.flatMap((p) => (p.type === 'TagInterpolation' ? [p.tag] : []))
    expect(li!.expansion).toEqual(at(src, ':'))
    const a = asTag(li!.children[0])
    expect(a.name?.value).toBe('a')
    expect(slice(src, asText(a.children[0]).content)).toBe('x')
    expect(slice(src, asCode(b!.children[0]).expression)).toBe('y')
  })
})
