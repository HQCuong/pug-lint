import { describe, expect, it } from 'vitest'
import type { PugDocument, PugLine } from '../src/ast.ts'
import { parsePug } from '../src/index.ts'
import { assertInvariants, at, toCRLF } from './helpers.ts'

type Row = [kind: PugLine['kind'], depth: number, anchor: number | null]

function parse(src: string): PugDocument {
  const doc = parsePug(src)
  assertInvariants(doc)
  return doc
}

const rows = (doc: PugDocument): Row[] => doc.lines.map((l) => [l.kind, l.depth, l.anchor])

// [name, source, expected [kind, depth, anchor] per line]
const table: [string, string, Row[]][] = [
  ['nested tags', 'div\n  p\n\n    span\n  a\nb', [
    ['node', 0, null],
    ['node', 1, null],
    ['blank', 0, null],
    ['node', 2, null],
    ['node', 1, null],
    ['node', 0, null],
  ]],
  ['multi-line attributes, closing paren on its own line', 'a(\n  x="1"\n  y="2"\n)\np', [
    ['node', 0, null],
    ['attribute', 1, null],
    ['attribute', 1, null],
    ['paren-close', 0, null],
    ['node', 0, null],
  ]],
  ['multi-line attributes, closing paren on the last attribute line', 'div\n  a(\n    x="1"\n    y="2")\n  p', [
    ['node', 0, null],
    ['node', 1, null],
    ['attribute', 2, null],
    ['attribute', 2, null],
    ['node', 1, null],
  ]],
  ['multi-line object value', 'div(\n  :class="{\n    a: b,\n    c: d\n  }"\n  id="x"\n)', [
    ['node', 0, null],
    ['attribute', 1, null],
    ['continuation', 1, 1],
    ['continuation', 1, 1],
    ['continuation', 1, 1],
    ['attribute', 1, null],
    ['paren-close', 0, null],
  ]],
  ['dot block with deeper inner lines', 'div\n  p.\n    one\n      two\n\n    three\n  a', [
    ['node', 0, null],
    ['node', 1, null],
    ['raw', 2, null],
    ['raw', 2, 2],
    ['blank', 0, null],
    ['raw', 2, 2],
    ['node', 1, null],
  ]],
  ['//- block comment', 'div\n  //- note\n    body\n      deeper\n  p', [
    ['node', 0, null],
    ['node', 1, null],
    ['raw', 2, null],
    ['raw', 2, 2],
    ['node', 1, null],
  ]],
  ['filter', 'div\n  :markdown\n    # Title\n      text\n  p', [
    ['node', 0, null],
    ['node', 1, null],
    ['raw', 2, null],
    ['raw', 2, 2],
    ['node', 1, null],
  ]],
  ['- code block', 'div\n  -\n    const a = 1\n      + 2\n  p', [
    ['node', 0, null],
    ['node', 1, null],
    ['raw', 2, null],
    ['raw', 2, 2],
    ['node', 1, null],
  ]],
  ['unclosed-paren error region', 'div\n      a(href="x\n   whatever\n\n  p', [
    ['node', 0, null],
    ['node', 1, null],
    ['continuation', 2, 1],
    ['continuation', 2, 1],
    ['continuation', 2, 1],
  ]],
  ['children of Control, MixinCall and Code nest; block expansion does not', 'if a\n  +m\n    - x\n      li: a\n        span', [
    ['node', 0, null],
    ['node', 1, null],
    ['node', 2, null],
    ['node', 3, null],
    ['node', 4, null],
  ]],
  ['multi-line mixin call arguments', '+card(\n  a,\n  b\n)\np', [
    ['node', 0, null],
    ['continuation', 1, 0],
    ['continuation', 1, 0],
    ['paren-close', 0, null],
    ['node', 0, null],
  ]],
  ['mixin arguments then a multi-line attribute block', 'div\n  +card({\n    a: 1\n  })(\n    x=1\n  )', [
    ['node', 0, null],
    ['node', 1, null],
    ['continuation', 2, 1],
    ['continuation', 2, 1],
    ['attribute', 2, null],
    ['paren-close', 1, null],
  ]],
  ['mixin arguments closed on the head line of their ) line', '+card(\n  a\n)(\n  x=1\n)', [
    ['node', 0, null],
    ['continuation', 1, 0],
    ['paren-close', 0, null],
    ['attribute', 1, null],
    ['paren-close', 0, null],
  ]],
  ['unclosed mixin arguments error region', '+card(a,\n  b\np', [
    ['node', 0, null],
    ['continuation', 1, 0],
    ['continuation', 1, 0],
  ]],
  ['unclosed filter attributes error region', ':md(x\n  y\np', [
    ['node', 0, null],
    ['continuation', 1, 0],
    ['continuation', 1, 0],
  ]],
  ['lines nested under a pipe line (error region)', 'div\n  | text\n    p\n\n      span\n  a', [
    ['node', 0, null],
    ['node', 1, null],
    ['continuation', 2, 1],
    ['continuation', 2, 1],
    ['continuation', 2, 1],
    ['node', 1, null],
  ]],
  ['lines nested under a literal HTML line', 'div\n  <ul>\n    li a\n      b\n  </ul>', [
    ['node', 0, null],
    ['node', 1, null],
    ['node', 2, null],
    ['node', 3, null],
    ['node', 1, null],
  ]],
]

describe('doc.lines', () => {
  for (const [name, src, expected] of table) {
    it(`classifies every line: ${name}`, () => expect(rows(parse(src))).toEqual(expected))
    it(`classifies every line with CRLF: ${name}`, () => expect(rows(parse(toCRLF(src)))).toEqual(expected))
  }
})

describe('error-recovery regions', () => {
  it('still parses the lines of an unclosed-paren region as nodes', () => {
    const src = 'div\n      a(href="x\n   whatever'
    const doc = parse(src)
    expect(doc.errors.map((e) => e.code)).toContain('unterminated-string')
    const div = doc.children[0]
    expect(div?.type === 'Tag' && div.children.map((c) => c.type)).toEqual(['Tag', 'Tag'])
  })

  it('reports lines nested under a pipe line once and skips them', () => {
    const src = 'div\n  | text\n    p\n      span\n  a'
    const doc = parse(src)
    expect(doc.errors.map((e) => [e.code, e.offset])).toEqual([['unsupported-syntax', at(src, 'p\n')[0]]])
    const div = doc.children[0]
    if (div?.type !== 'Tag') throw new Error('expected a Tag')
    expect(div.children.map((c) => c.type)).toEqual(['Text', 'Tag'])
    expect(div.children[1]!.range).toEqual(at(src, 'a', 1))
  })

  it('keeps lines nested under a literal HTML line as siblings, as Pug does', () => {
    const src = 'div\n  <ul>\n    li a\n  </ul>'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const div = doc.children[0]
    if (div?.type !== 'Tag') throw new Error('expected a Tag')
    expect(div.children.map((c) => c.type)).toEqual(['Text', 'Tag', 'Text'])
  })
})

describe('assertInvariants on lines', () => {
  it('rejects an anchor that is not an earlier line', () => {
    const doc = parsePug('p.\n  a\n  b')
    expect(() => assertInvariants(doc)).not.toThrow()
    doc.lines[2]!.anchor = 2
    expect(() => assertInvariants(doc)).toThrow(/anchor 2, which is not an earlier line/)
    doc.lines[2]!.anchor = -1
    expect(() => assertInvariants(doc)).toThrow(/anchor -1/)
  })
})
