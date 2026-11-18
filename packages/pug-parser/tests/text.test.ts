import { describe, expect, it } from 'vitest'
import type { PugDocument, PugNode, Range, Tag, Text, TextPart } from '../src/ast.ts'
import { parsePug } from '../src/index.ts'
import { parseTextParts } from '../src/parse-text.ts'
import { assertInvariants, at, toCRLF } from './helpers.ts'

const slice = (text: string, [s, e]: Range): string => text.slice(s, e)

function parse(src: string): PugDocument {
  const doc = parsePug(src)
  assertInvariants(doc)
  return doc
}

function asTag(node: PugNode | undefined): Tag {
  if (node?.type !== 'Tag') throw new Error(`expected a Tag, got ${node?.type}`)
  return node
}

function asText(node: PugNode | undefined): Text {
  if (node?.type !== 'Text') throw new Error(`expected a Text, got ${node?.type}`)
  return node
}

const partTypes = (parts: readonly TextPart[]): string[] => parts.map((p) => p.type)

describe('parsePug: text forms', () => {
  it('parses inline text after a tag head; mustaches stay raw', () => {
    const src = 'p Hello {{ name }}'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const p = asTag(doc.children[0])
    expect(p.children).toHaveLength(1)
    const text = asText(p.children[0])
    expect(text.form).toBe('inline')
    expect(slice(src, text.content)).toBe('Hello {{ name }}')
    expect(text.parts).toEqual([{ type: 'Raw', range: at(src, 'Hello {{ name }}') }])
    expect(p.range).toEqual([0, src.length])
  })

  it('parses inline text after attributes and shorthands', () => {
    const src = 'a.btn(href="/x") Go'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const text = asText(asTag(doc.children[0]).children[0])
    expect(slice(src, text.content)).toBe('Go')
  })

  it('keeps extra leading spaces of inline text in its content', () => {
    const src = 'p   x'
    const text = asText(asTag(parse(src).children[0]).children[0])
    expect(slice(src, text.content)).toBe('  x')
  })

  it('creates no text node for trailing whitespace after a tag', () => {
    const doc = parse('p   ')
    expect(doc.errors).toEqual([])
    expect(asTag(doc.children[0]).children).toEqual([])
  })

  it('parses pipe lines as children', () => {
    const src = 'p\n  | one\n  | two'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const p = asTag(doc.children[0])
    expect(p.children).toHaveLength(2)
    const [one, two] = p.children.map(asText)
    expect(one!.form).toBe('pipe')
    expect(two!.form).toBe('pipe')
    expect(slice(src, one!.content)).toBe('one')
    expect(slice(src, two!.content)).toBe('two')
    expect(one!.range).toEqual([at(src, '| one')[0], at(src, '| one')[1]])
    expect(doc.lines.map((l) => l.kind)).toEqual(['node', 'node', 'node'])
  })

  it('parses a lone pipe as empty content without error', () => {
    const src = '|'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const text = asText(doc.children[0])
    expect(text.form).toBe('pipe')
    expect(text.content).toEqual([1, 1])
    expect(text.parts).toEqual([])
  })

  it('parses a dot block: one block Text per non-blank line', () => {
    const src = 'p.\n  line 1\n    indented\n  line 3\nspan'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    expect(doc.children).toHaveLength(2)
    const p = asTag(doc.children[0])
    expect(p.dot).toEqual(at(src, '.'))
    expect(p.range).toEqual([0, at(src, 'p.')[1]])
    expect(p.children).toHaveLength(3)
    const texts = p.children.map(asText)
    expect(texts.map((t) => t.form)).toEqual(['block', 'block', 'block'])
    expect(texts.map((t) => slice(src, t.content))).toEqual(['line 1', 'indented', 'line 3'])
    expect(asTag(doc.children[1]).name?.value).toBe('span')
    expect(doc.lines.map((l) => [l.kind, l.depth, l.anchor])).toEqual([
      ['node', 0, null],
      ['raw', 1, null],
      ['raw', 1, 1],
      ['raw', 1, 1],
      ['node', 0, null],
    ])
    expect(doc.lines[2]!.anchor).toBe(1)
  })

  it('keeps blank lines inside a dot block as blank lines, and nested blocks', () => {
    const src = 'div\n  p.\n    a\n\n    b\n  span'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const div = asTag(doc.children[0])
    const p = asTag(div.children[0])
    expect(p.children.map((c) => slice(src, asText(c).content))).toEqual(['a', 'b'])
    expect(asTag(div.children[1]).name?.value).toBe('span')
    expect(doc.lines.map((l) => [l.kind, l.depth, l.anchor])).toEqual([
      ['node', 0, null],
      ['node', 1, null],
      ['raw', 2, null],
      ['blank', 0, null],
      ['raw', 2, 2],
      ['node', 1, null],
    ])
  })

  it('parses script. as block text without errors', () => {
    const src = 'script.\n  if (a) { b() }'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const script = asTag(doc.children[0])
    const text = asText(script.children[0])
    expect(text.form).toBe('block')
    expect(slice(src, text.content)).toBe('if (a) { b() }')
  })

  it('parses a dot block after a multi-line attribute block', () => {
    const src = 'p(\n  a="1"\n).\n  x'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const p = asTag(doc.children[0])
    expect(p.dot).toEqual(at(src, '.'))
    expect(slice(src, asText(p.children[0]).content)).toBe('x')
    expect(doc.lines.map((l) => l.kind)).toEqual(['node', 'attribute', 'paren-close', 'raw'])
  })

  it('parses literal HTML lines', () => {
    const src = '<div class="raw">'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const text = asText(doc.children[0])
    expect(text.form).toBe('html')
    expect(slice(src, text.content)).toBe(src)
  })

  it('works with CRLF line endings', () => {
    const src = toCRLF('p.\n  a\n  b\nul\n  | c')
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const p = asTag(doc.children[0])
    expect(p.children.map((c) => slice(src, asText(c).content))).toEqual(['a', 'b'])
    const ul = asTag(doc.children[1])
    expect(slice(src, asText(ul.children[0]).content)).toBe('c')
  })
})

describe('parsePug: interpolation', () => {
  it('splits #{…}, !{…} and escaped \\#{…}', () => {
    const src = 'p #{a} and !{b} and \\#{c}'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const text = asText(asTag(doc.children[0]).children[0])
    expect(partTypes(text.parts)).toEqual(['Interpolation', 'Raw', 'Interpolation', 'Raw'])
    const [a, raw1, b, raw2] = text.parts
    expect(a).toEqual({ type: 'Interpolation', escaped: true, range: at(src, '#{a}'), expression: at(src, 'a') })
    expect(b).toEqual({ type: 'Interpolation', escaped: false, range: at(src, '!{b}'), expression: at(src, 'b') })
    expect(slice(src, raw1!.range)).toBe(' and ')
    expect(slice(src, raw2!.range)).toBe(' and \\#{c}')
  })

  it('skips braces and strings inside an interpolation expression', () => {
    const src = 'p #{ f({ x: "}" }) } end'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const [interp, raw] = asText(asTag(doc.children[0]).children[0]).parts
    if (interp?.type !== 'Interpolation') throw new Error('expected Interpolation')
    expect(slice(src, interp.range)).toBe('#{ f({ x: "}" }) }')
    expect(slice(src, interp.expression)).toBe('f({ x: "}" })')
    expect(slice(src, raw!.range)).toBe(' end')
  })

  it('parses #[…] as a TagInterpolation with attributes and inline text', () => {
    const src = 'p Click #[a(href="/x") here] now'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const text = asText(asTag(doc.children[0]).children[0])
    expect(partTypes(text.parts)).toEqual(['Raw', 'TagInterpolation', 'Raw'])
    const part = text.parts[1]!
    if (part.type !== 'TagInterpolation') throw new Error('expected TagInterpolation')
    expect(part.range).toEqual(at(src, '#[a(href="/x") here]'))
    expect(part.tag.name?.value).toBe('a')
    expect(part.tag.attributeBlocks[0]!.attributes).toHaveLength(1)
    expect(part.tag.range).toEqual(at(src, 'a(href="/x") here'))
    expect(part.tag.children).toHaveLength(1)
    const inner = asText(part.tag.children[0])
    expect(inner.form).toBe('inline')
    expect(slice(src, inner.content)).toBe('here')
    expect(slice(src, text.parts[0]!.range)).toBe('Click ')
    expect(slice(src, text.parts[2]!.range)).toBe(' now')
  })

  it('parses nested #[…] and #{…} inside a tag interpolation', () => {
    const src = '| a #[b x #[i #{y}]] c'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const text = asText(doc.children[0])
    const outer = text.parts[1]!
    if (outer.type !== 'TagInterpolation') throw new Error('expected TagInterpolation')
    const bText = asText(outer.tag.children[0])
    expect(partTypes(bText.parts)).toEqual(['Raw', 'TagInterpolation'])
    const inner = bText.parts[1]!
    if (inner.type !== 'TagInterpolation') throw new Error('expected TagInterpolation')
    expect(inner.tag.name?.value).toBe('i')
    expect(partTypes(asText(inner.tag.children[0]).parts)).toEqual(['Interpolation'])
  })

  it('ends the text of a #[…] at its first "]", reading quotes and brackets there as plain text (as Pug does)', () => {
    const src = "p #[span(title='x') it's] y #[b it's [x] z] w"
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const text = asText(asTag(doc.children[0]).children[0])
    expect(partTypes(text.parts)).toEqual(['TagInterpolation', 'Raw', 'TagInterpolation', 'Raw'])
    expect(text.parts[0]!.range).toEqual(at(src, "#[span(title='x') it's]"))
    expect(text.parts[2]!.range).toEqual(at(src, "#[b it's [x]"))
    expect(slice(src, text.parts[3]!.range)).toBe(' z] w')
  })

  it('keeps the head and code of a #[…] JS-aware, and #[…] / #{…} nested in its text', () => {
    const src = "p #[a(title=']') #{'x]'} #[i \"]] #[b= 'c]d'] e"
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const text = asText(asTag(doc.children[0]).children[0])
    expect(partTypes(text.parts)).toEqual(['TagInterpolation', 'Raw', 'TagInterpolation', 'Raw'])
    expect(text.parts[0]!.range).toEqual(at(src, "#[a(title=']') #{'x]'} #[i \"]]"))
    expect(text.parts[2]!.range).toEqual(at(src, "#[b= 'c]d']"))
  })

  it('interpolates in pipe, block and html text', () => {
    const src = 'div\n  | #{a}\n  p.\n    #{b}\n  <b>#{c}</b>'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const div = asTag(doc.children[0])
    expect(partTypes(asText(div.children[0]).parts)).toEqual(['Interpolation'])
    expect(partTypes(asText(asTag(div.children[1]).children[0]).parts)).toEqual(['Interpolation'])
    expect(partTypes(asText(div.children[2]).parts)).toEqual(['Raw', 'Interpolation', 'Raw'])
  })

  it('reports an unterminated #{ and still returns', () => {
    const src = 'p #{unclosed'
    const doc = parse(src)
    expect(doc.errors.map((e) => [e.code, e.offset])).toEqual([['unterminated-interpolation', at(src, '#{')[0]]])
    const text = asText(asTag(doc.children[0]).children[0])
    expect(text.parts).toEqual([{ type: 'Raw', range: at(src, '#{unclosed') }])
  })

  it('reports an unterminated #[ and still returns', () => {
    const src = 'p a #[b c\nspan'
    const doc = parse(src)
    expect(doc.errors.map((e) => [e.code, e.offset])).toEqual([['unterminated-interpolation', at(src, '#[')[0]]])
    expect(doc.children.map((c) => asTag(c).name?.value)).toEqual(['p', 'span'])
  })
})

describe('parseTextParts', () => {
  it('parses only [start, end) of the text', () => {
    const text = 'xx a #{b} c yy'
    const [start, end] = at(text, 'a #{b} c')
    const { parts, errors } = parseTextParts(text, start, end)
    expect(errors).toEqual([])
    expect(parts.map((p) => slice(text, p.range))).toEqual(['a ', '#{b}', ' c'])
  })

  it('returns no parts for an empty range', () => {
    expect(parseTextParts('abc', 1, 1)).toEqual({ parts: [], errors: [] })
  })
})
