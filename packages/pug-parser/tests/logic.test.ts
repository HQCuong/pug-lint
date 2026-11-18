import { describe, expect, it } from 'vitest'
import type { Code, Control, MixinCall, PugDocument, PugNode, Range, Tag } from '../src/ast.ts'
import { parsePug } from '../src/index.ts'
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
const asCode = (n: PugNode | undefined): Code => as('Code', n)
const asControl = (n: PugNode | undefined): Control => as('Control', n)
const asMixin = (n: PugNode | undefined): MixinCall => as('MixinCall', n)

describe('control flow', () => {
  it('parses if / else if / else as sibling Controls with their heads', () => {
    const src = 'if user\n  p A\nelse if admin\n  p B\nelse\n  p C'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const controls = doc.children.map(asControl)
    expect(controls.map((c) => c.keyword)).toEqual(['if', 'else if', 'else'])
    expect(controls.map((c) => slice(src, c.head))).toEqual(['user', 'admin', ''])
    expect(controls[0]!.range).toEqual(at(src, 'if user'))
    expect(controls[1]!.range).toEqual(at(src, 'else if admin'))
    for (const c of controls) {
      expect(c.children).toHaveLength(1)
      expect(asTag(c.children[0]).name?.value).toBe('p')
    }
  })

  it('parses each with a tag whose buffered code is a Code child', () => {
    const src = 'each n, i in [1, 2]\n  li= n'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const each = asControl(doc.children[0])
    expect(each.keyword).toBe('each')
    expect(slice(src, each.head)).toBe('n, i in [1, 2]')
    const li = asTag(each.children[0])
    expect(li.name?.value).toBe('li')
    expect(li.range).toEqual(at(src, 'li= n'))
    const code = asCode(li.children[0])
    expect(code).toMatchObject({ buffered: true, escaped: true, children: [] })
    expect(code.range).toEqual(at(src, '= n'))
    expect(slice(src, code.expression)).toBe('n')
  })

  it('accepts a keyword followed by "(" or the end of the line', () => {
    const src = 'if(a)\n  p\nwhile x\nunless y\nfor k in o\nyield\nappend scripts\nprepend head'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const controls = doc.children.map(asControl)
    expect(controls.map((c) => c.keyword)).toEqual(['if', 'while', 'unless', 'for', 'yield', 'append', 'prepend'])
    expect(slice(src, controls[0]!.head)).toBe('(a)')
    expect(slice(src, controls[4]!.head)).toBe('')
  })

  it('nests case / when / default', () => {
    const src = 'case x\n  when 1\n    p a\n  default\n    p b'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const kase = asControl(doc.children[0])
    expect(kase.keyword).toBe('case')
    expect(slice(src, kase.head)).toBe('x')
    const branches = kase.children.map(asControl)
    expect(branches.map((c) => c.keyword)).toEqual(['when', 'default'])
    expect(slice(src, branches[0]!.head)).toBe('1')
    for (const b of branches) expect(asTag(b.children[0]).name?.value).toBe('p')
  })

  it('parses include, extends, block and doctype', () => {
    const src = 'include ./a.pug\nextends layout\nblock content\n  p x\ndoctype html'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const controls = doc.children.map(asControl)
    expect(controls.map((c) => c.keyword)).toEqual(['include', 'extends', 'block', 'doctype'])
    expect(controls.map((c) => slice(src, c.head))).toEqual(['./a.pug', 'layout', 'content', 'html'])
    expect(asTag(controls[2]!.children[0]).name?.value).toBe('p')
  })

  it('reads "extend" as extends (oracle)', () => {
    const src = 'extend layout\nextends-x'
    const doc = parse(src)
    // `extends-x` is a keyword error in Pug, still read as a tag.
    expect(doc.errors).toMatchObject([{ code: 'unsupported-syntax', offset: at(src, 'extends-x')[0] }])
    const ext = asControl(doc.children[0])
    expect(ext.keyword).toBe('extends')
    expect(slice(src, ext.head)).toBe('layout')
    expect(asTag(doc.children[1]).name?.value).toBe('extends-x')
  })

  it('reads keyword-like names followed by other characters as tags', () => {
    const src = 'default-slot\nblock.x\ninclude-me\nif-ok\niffy'
    const doc = parse(src)
    expect(doc.children.map((c) => asTag(c).name?.value)).toEqual(['default-slot', 'block', 'include-me', 'if-ok', 'iffy'])
    expect(asTag(doc.children[1]).shorthands.map((s) => s.value)).toEqual(['x'])
    // pug-lexer reads `default`, `include`, … before a non-word character as the keyword (oracle).
    expect(doc.errors).toMatchObject([
      { code: 'unsupported-syntax', offset: at(src, 'default-slot')[0] },
      { code: 'unsupported-syntax', offset: at(src, 'include-me')[0] },
    ])
  })

  it('does not take a word-only keyword followed by "(" as control', () => {
    const doc = parse('block(x)')
    expect(doc.errors).toEqual([])
    expect(asTag(doc.children[0]).name?.value).toBe('block')
  })
})

describe('code', () => {
  it('parses unbuffered code lines, a multi-line code block, and unescaped tag code', () => {
    const src = '- const a = 1\n-\n  const b = 2\n  const c = 3\np!= html'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const [one, block, p] = doc.children
    const a = asCode(one)
    expect(a).toMatchObject({ buffered: false, escaped: false })
    expect(a.range).toEqual(at(src, '- const a = 1'))
    expect(slice(src, a.expression)).toBe('const a = 1')
    const b = asCode(block)
    expect(b.buffered).toBe(false)
    expect(b.range).toEqual([at(src, '-\n')[0], at(src, 'const c = 3')[1]])
    expect(slice(src, b.expression)).toBe('const b = 2\n  const c = 3')
    expect(doc.lines.map((l) => l.kind)).toEqual(['node', 'node', 'raw', 'raw', 'node'])
    expect(doc.lines[3]!.anchor).toBe(2)
    const tag = asTag(p)
    const code = asCode(tag.children[0])
    expect(code).toMatchObject({ buffered: true, escaped: false })
    expect(code.range).toEqual(at(src, '!= html'))
    expect(slice(src, code.expression)).toBe('html')
  })

  it('parses buffered code lines and nests a block under unbuffered code', () => {
    const src = '= a\n!= b\n- if (x)\n  p'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const [a, b, c] = doc.children.map(asCode)
    expect(a).toMatchObject({ buffered: true, escaped: true })
    expect(slice(src, a!.expression)).toBe('a')
    expect(b).toMatchObject({ buffered: true, escaped: false })
    expect(slice(src, b!.expression)).toBe('b')
    expect(slice(src, c!.expression)).toBe('if (x)')
    expect(asTag(c!.children[0]).name?.value).toBe('p')
  })

  it('reports lines nested under buffered code once and skips them (oracle)', () => {
    for (const op of ['=', '!=']) {
      const src = `div\n  ${op} x\n    p a\n      b\n  span`
      const doc = parse(src)
      expect(doc.errors).toEqual([
        { code: 'unsupported-syntax', message: 'Lines cannot be nested under buffered code', offset: at(src, 'p a')[0] },
      ])
      const div = asTag(doc.children[0])
      expect(div.children.map((c) => c.type)).toEqual(['Code', 'Tag'])
      expect(asCode(div.children[0]).children).toEqual([])
      expect(doc.lines.map((l) => [l.kind, l.anchor])).toEqual([
        ['node', null], ['node', null], ['continuation', 1], ['continuation', 1], ['node', null],
      ])
    }
  })

  it('attaches code after shorthands and attributes', () => {
    const src = '.card= title\na(href="x")!= y'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const [card, a] = doc.children.map(asTag)
    expect(slice(src, asCode(card!.children[0]).expression)).toBe('title')
    expect(asCode(a!.children[0]).range).toEqual(at(src, '!= y'))
  })
})

describe('mixins', () => {
  it('parses a mixin definition and a call with args, attributes and a child', () => {
    const src = 'mixin card(title)\n  .card= title\n+card("x")(class="y")\n  p in'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const def = asControl(doc.children[0])
    expect(def.keyword).toBe('mixin')
    expect(slice(src, def.head)).toBe('card(title)')
    expect(def.children.map((c) => asTag(c).shorthands[0]?.value)).toEqual(['card'])
    const call = asMixin(doc.children[1])
    expect(call.name).toEqual({ value: 'card', range: at(src, 'card', 2) })
    expect(call.range).toEqual(at(src, '+card("x")(class="y")'))
    expect(slice(src, call.args!)).toBe('("x")')
    expect(call.attributeBlocks).toHaveLength(1)
    expect(call.attributeBlocks[0]!.attributes.map((a) => a.key.raw)).toEqual(['class'])
    expect(call.children).toHaveLength(1)
    expect(asTag(call.children[0]).name?.value).toBe('p')
  })

  it('reads shorthands, a first paren group of attributes, inline text and code', () => {
    const src = '+card.a#b\n+card(class="y")\n+card text\n+card= x\n+card'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const [sh, attrs, text, code, bare] = doc.children.map(asMixin)
    expect(sh!.shorthands).toEqual([
      { kind: 'class', value: 'a', range: at(src, '.a') },
      { kind: 'id', value: 'b', range: at(src, '#b') },
    ])
    expect(attrs!.args).toBeNull()
    expect(attrs!.attributeBlocks).toHaveLength(1)
    expect(as('Text', text!.children[0]).form).toBe('inline')
    expect(asCode(code!.children[0]).buffered).toBe(true)
    expect(bare).toMatchObject({ args: null, shorthands: [], attributeBlocks: [], children: [] })
  })

  it('reads a mixin call with spaces after "+" (oracle)', () => {
    const src = '+  list(1)\n  p'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const call = asMixin(doc.children[0])
    expect(call.name).toEqual({ value: 'list', range: at(src, 'list') })
    expect(call.range).toEqual(at(src, '+  list(1)'))
    expect(slice(src, call.args!)).toBe('(1)')
    expect(asTag(call.children[0]).name?.value).toBe('p')
  })

  it('reports unclosed mixin arguments without swallowing the next lines', () => {
    const src = '+card(a\np'
    const doc = parse(src)
    expect(doc.errors.map((e) => [e.code, e.offset])).toEqual([['unclosed-arguments', at(src, '(')[0]]])
    expect(doc.children.map((c) => c.type)).toEqual(['MixinCall', 'Tag'])
  })
})

describe('Basic.vue template', () => {
  it('parses without errors', () => {
    const src = `
.card#main(class="wrap")
  MyButton(@click="onClick", :fooBar="x", title='hi') Save
  ul
    li(v-for="item in items") {{ item.name }}
    li(v-for="(a, i) in list" :key="a.id") {{ a }}
  div(v-if="ok" v-for="x in xs" :key="x")
  p Hello {{ name }}
  input(type="text" v-model="name")
  each n in [1, 2]
    span(v-for="y in ys") {{ y }}
  +card(title)
    span(v-for="z in zs") {{ z }}
  if user
    a(
      href="/x"
      :class="{ active: isActive, big: true }"
      @click.prevent="go"
    ) Link
  //- a comment
    div(v-for="q in qs")
`
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const card = asTag(doc.children[0])
    expect(card.children.map((c) => c.type)).toEqual([
      'Tag', 'Tag', 'Tag', 'Tag', 'Tag', 'Control', 'MixinCall', 'Control', 'Comment',
    ])
    expect(slice(src, asMixin(card.children[6]).args!)).toBe('(title)')
  })
})
