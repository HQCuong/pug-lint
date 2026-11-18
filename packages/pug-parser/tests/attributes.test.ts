import { describe, expect, it } from 'vitest'
import type { Attribute, PugDocument, PugNode, Range, Tag } from '../src/ast.ts'
import { parsePug } from '../src/index.ts'
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

const attrs = (doc: PugDocument): Attribute[] => asTag(doc.children[0]).attributeBlocks[0]!.attributes

describe('parsePug: attribute blocks', () => {
  it('parses quoted string values', () => {
    const src = 'a(href="/x" target=\'_blank\')'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const [href, target] = attrs(doc)
    expect(attrs(doc)).toHaveLength(2)
    expect(href!.key).toEqual({ raw: 'href', range: at(src, 'href') })
    expect(target!.key).toEqual({ raw: 'target', range: at(src, 'target') })
    expect(href!.value).toMatchObject({ kind: 'string', quote: '"', hasSubstitution: false })
    expect(target!.value).toMatchObject({ kind: 'string', quote: "'", hasSubstitution: false })
    expect(slice(src, href!.value!.range)).toBe('"/x"')
    expect(href!.value!.raw).toBe('"/x"')
    expect(slice(src, href!.value!.inner!)).toBe('/x')
    expect(slice(src, target!.value!.range)).toBe("'_blank'")
    expect(slice(src, target!.value!.inner!)).toBe('_blank')
    expect(href!.operator).toEqual({ value: '=', range: at(src, '=') })
    expect(href!.range).toEqual(at(src, 'href="/x"'))
    const block = asTag(doc.children[0]).attributeBlocks[0]!
    expect(block.range).toEqual([at(src, '(')[0], src.length])
    expect(asTag(doc.children[0]).range).toEqual([0, src.length])
  })

  it('reads Vue directive keys and commas', () => {
    const src = 'B(@click.prevent="go", :[dyn]="v", #default="{ item }", v-model:foo.trim="x")'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    expect(attrs(doc).map((a) => a.key.raw)).toEqual(['@click.prevent', ':[dyn]', '#default', 'v-model:foo.trim'])
    for (const a of attrs(doc)) expect(slice(src, a.key.range)).toBe(a.key.raw)
    const { commas } = asTag(doc.children[0]).attributeBlocks[0]!
    expect(commas).toHaveLength(3)
    for (const c of commas) expect(slice(src, c)).toBe(',')
  })

  it('reads balanced parens inside a key, as pug-lexer does (oracle)', () => {
    const src = 'template(#cell(name)="{ value }" v-slot:row(a(b))="r" c)'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    expect(attrs(doc).map((a) => [a.key.raw, a.value?.raw ?? null])).toEqual([
      ['#cell(name)', '"{ value }"'], ['v-slot:row(a(b))', '"r"'], ['c', null],
    ])
  })

  it('classifies template literal values', () => {
    const src = 'a(:x=`{ a: b }`)'
    const value = attrs(parse(src))[0]!.value!
    expect(value).toMatchObject({ kind: 'template', quote: '`', hasSubstitution: false })
    expect(slice(src, value.inner!)).toBe('{ a: b }')
    const sub = attrs(parse('a(t=`x${y}`)'))[0]!.value!
    expect(sub).toMatchObject({ kind: 'template', quote: '`', hasSubstitution: true })
  })

  it('ends an unquoted value at whitespace unless an operator joins it', () => {
    const doc = parse('a(:x=b+c d)')
    expect(doc.errors).toEqual([])
    const [x, d] = attrs(doc)
    expect(attrs(doc)).toHaveLength(2)
    expect(x!.value).toMatchObject({ raw: 'b+c', kind: 'expression', quote: null, inner: null, hasSubstitution: false })
    expect(d!.key.raw).toBe('d')
    expect(d!.operator).toBeNull()
    expect(d!.value).toBeNull()

    const spaced = parse('a(:x=b + c)')
    expect(attrs(spaced)).toHaveLength(1)
    expect(attrs(spaced)[0]!.value!.raw).toBe('b + c')

    const src = 'a(x!=html)'
    const unescaped = attrs(parse(src))[0]!
    expect(unescaped.operator).toEqual({ value: '!=', range: at(src, '!=') })
    expect(unescaped.value!.raw).toBe('html')

    const mixed = parse('a(:x="a" + b)')
    expect(attrs(mixed)).toHaveLength(1)
    expect(attrs(mixed)[0]!.value).toMatchObject({ kind: 'expression', raw: '"a" + b', quote: null, inner: null })
  })

  // Oracle (Task 17): pug-lexer ends a value at whitespace only when the next
  // character is not a punctuator (or is a quote, ':' or '...') and the value
  // so far is a complete expression.
  it.each([
    ['a(x=b ? c : d :e=1)', ['b ? c : d', '1']],
    ['a(x=new Date(0))', ['new Date(0)']],
    ['a(x=typeof y z)', ['typeof y', null]],
    ['a(x=a (b))', ['a (b)']],
    ['a(x=a .b)', ['a .b']],
    ['a(x=y in z)', ['y', null, null]],
    ['a(x=y instanceof z)', ['y', null, null]],
    ['a(@click="a" -b)', ['"a" -b']],
    ['a(x=y\n  /a)', ['y\n  /a']],
    ['a(x=a ...b)', ['a', null]],
    ["a(x='a' 'b')", ["'a'", null]],
    ['a(x=a.new y)', ['a.new', null]],
  ])('ends the unquoted value in %j as pug-lexer does', (src, values) => {
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    expect(attrs(doc).map((a) => a.value?.raw ?? null)).toEqual(values)
  })

  const multiLine = 'a(\n  href="/x"\n  :class="{ active: isActive,\n    big: true }"\n) Link'
  const backtick = 'a(:class=`{\n  a: b\n}` y)'

  const checkMultiLine = (src: string): void => {
    const doc = parse(src)
    expect(attrs(doc)).toHaveLength(2)
    expect(attrs(doc).map((a) => a.key.raw)).toEqual(['href', ':class'])
    const cls = attrs(doc)[1]!.value!
    expect(cls.kind).toBe('string')
    expect(slice(src, cls.inner!).replace(/\r\n/g, '\n')).toBe('{ active: isActive,\n    big: true }')
    expect(doc.lines.map((l) => l.kind)).toEqual(['node', 'attribute', 'attribute', 'continuation', 'paren-close'])
    expect(doc.lines[3]!.anchor).toBe(2)
    expect(doc.lines.map((l) => l.depth)).toEqual([0, 1, 1, 1, 0])
    const tag = asTag(doc.children[0])
    expect(tag.attributeBlocks[0]!.range).toEqual([at(src, '(')[0], at(src, ')')[1]])
    expect(tag.range).toEqual([0, src.length])
  }

  const checkBacktick = (src: string): void => {
    const doc = parse(src)
    expect(attrs(doc)).toHaveLength(2)
    const value = attrs(doc)[0]!.value!
    expect(value.kind).toBe('template')
    expect(slice(src, value.inner!)).toBe(src.includes('\r\n') ? '{\r\n  a: b\r\n}' : '{\n  a: b\n}')
    expect(attrs(doc)[1]!.key.raw).toBe('y')
    expect(doc.lines.map((l) => l.kind)).toEqual(['node', 'continuation', 'continuation'])
    expect(doc.lines.map((l) => l.anchor)).toEqual([null, 0, 0])
  }

  it('parses a multi-line block and classifies its lines', () => checkMultiLine(multiLine))
  it('parses a multi-line template literal value', () => checkBacktick(backtick))
  it('parses a multi-line block with CRLF line endings', () => checkMultiLine(toCRLF(multiLine)))
  it('parses a multi-line template literal with CRLF line endings', () => checkBacktick(toCRLF(backtick)))

  it('parses consecutive attribute blocks', () => {
    const src = 'a(x)(y="1")'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const blocks = asTag(doc.children[0]).attributeBlocks
    expect(blocks).toHaveLength(2)
    expect(blocks.map((b) => b.attributes.map((a) => a.key.raw))).toEqual([['x'], ['y']])
    expect(blocks[0]!.range).toEqual(at(src, '(x)'))
    expect(blocks[1]!.range).toEqual(at(src, '(y="1")'))
  })

  it('skips parens and escaped quotes inside a string', () => {
    const src = 'a(title="a) \\" (b")'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    expect(attrs(doc)).toHaveLength(1)
    expect(slice(src, attrs(doc)[0]!.value!.inner!)).toBe('a) \\" (b')
    expect(asTag(doc.children[0]).attributeBlocks[0]!.range).toEqual([1, src.length])
  })

  it('parses &attributes', () => {
    for (const src of ['div&attributes(attrs)', 'div(a)&attributes(attrs)']) {
      const doc = parse(src)
      expect(doc.errors).toEqual([])
      const and = asTag(doc.children[0]).andAttributes
      expect(and).toHaveLength(1)
      expect(slice(src, and[0]!.expression)).toBe('attrs')
      expect(and[0]!.range).toEqual(at(src, '&attributes(attrs)'))
    }
  })

  it('records a trailing self-closing slash', () => {
    const src = 'Foo(a)/'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const tag = asTag(doc.children[0])
    expect(slice(src, tag.selfClose!)).toBe('/')
    expect(tag.attributeBlocks[0]!.attributes.map((a) => a.key.raw)).toEqual(['a'])
  })

  it('allows spaces around the operator', () => {
    const src = 'a(x = "1")'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    expect(attrs(doc)).toHaveLength(1)
    const [x] = attrs(doc)
    expect(x!.key.raw).toBe('x')
    expect(x!.operator).toEqual({ value: '=', range: at(src, '=') })
    expect(x!.value!.raw).toBe('"1"')

    const src2 = 'a(x != y)'
    const doc2 = parse(src2)
    expect(doc2.errors).toEqual([])
    expect(attrs(doc2)).toHaveLength(1)
    expect(attrs(doc2)[0]!.operator).toEqual({ value: '!=', range: at(src2, '!=') })
    expect(attrs(doc2)[0]!.value!.raw).toBe('y')
  })

  it('reports an unterminated string once and recovers', () => {
    const src = 'a(href="x'
    const doc = parse(src)
    expect(doc.errors).toHaveLength(1)
    expect(doc.errors[0]).toMatchObject({ code: 'unterminated-string', offset: at(src, '"')[0] })
    expect(asTag(doc.children[0]).name?.value).toBe('a')
  })

  it('reports an unclosed block and keeps the next line as a node', () => {
    const src = 'a(href="x"\np'
    const doc = parse(src)
    expect(doc.errors).toHaveLength(1)
    expect(doc.errors[0]).toMatchObject({ code: 'unclosed-attributes', offset: at(src, '(')[0] })
    expect(doc.children.map((c) => asTag(c).name?.value)).toEqual(['a', 'p'])
    expect(attrs(doc).map((a) => a.key.raw)).toEqual(['href'])
  })
})
