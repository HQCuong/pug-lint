import { describe, expect, it } from 'vitest'
import type { PugDocument, PugNode } from '../src/ast.ts'
import { fingerprint, parsePug, walk } from '../src/index.ts'
import { assertInvariants, toCRLF } from './helpers.ts'

function fp(src: string): string {
  const doc = parsePug(src)
  assertInvariants(doc)
  expect(doc.errors).toEqual([])
  return fingerprint(doc)
}

const equal: [string, string][] = [
  ['MyButton(@click="a", :fooBar="x")', 'my-button(:foo-bar="x" @click="a")'],
  ['div.card', '.card'],
  ['Foo/', 'Foo'],
  ['ul\n  li\n    a\n  li', 'ul\n\tli\n\t\ta\n\tli'],
  ['ul\n  li\n    a(x="1") hi\n  li', toCRLF('ul\n  li\n    a(x="1") hi\n  li')],
  ['a(\n  x\n  y\n)', 'a(x y)'],
  ["a(x='1')", 'a(x="1")'],
  ['a(x=`1`)', 'a(x="1")'],
  ['a(x = "1")', 'a(x="1")'],
  ['div(class="a b")', '.a.b'],
  ['.a.b', '.b(class="a")'],
  ['.b(class="a")', "div(class='b a')"],
  ['div(id="x")', '#x'],
  ['.a(:class="k")', 'div(class="a" :class="k")'],
  ['div(class=`a ${b}`)', 'div(x=`a ${b}`)'],
  ['p= x', 'p!= x'],
  ['- a = 1\np', '-\n  a = 1\np'],
  ['+card(class="a")', '+card.a'],
  ['+card("x")(id="y")', '+card("x")#y'],
  ['-\n  var a = [1,\n    2]', '-\n    var a = [1,\n        2]'],
  // Attribute values: string-like values may change, expression values only in their indentation.
  ['div(a="x")', "div(a='y')"],
  ['div(a=`x`)', 'div(b="y")'],
  ['div(:a="true")', 'div(a)'],
  ['div(a=f(1,\n  2))', 'div(a=f(1,\n        2))'],
  ['div(a=cond ? "x" : "y" b)', 'div(b a=cond ? "x" : "y")'],
]

const differ: [string, string][] = [
  ['ul\n  li', 'ul\nli'],
  ['a(x y)', 'a(x)'],
  ['.a.b', '.a'],
  ['div(class="a b")', '.a'],
  ['.a', '.c'],
  ['#x', '#y'],
  ['#x', 'div'],
  ['p Hello', 'p\nHello'],
  ['if x\n  p', 'p'],
  ['p #{a}', 'p a'],
  ['a(x=`a${b}`)', 'a(x="a${b}")'],
  ['div(class=cls)', '.cls'],
  ['div(class=`a ${b}`)', '.a'],
  ['div(class=`a ${b}`)', 'div'],
  ['each x in y\n  p', 'if x\n  p'],
  ['if a\n  p\nelse\n  p', 'if a\n  p\np'],
  ['if a\n  p\nelse if b\n  p', 'if a\n  p\nelse\n  p'],
  ['p= x', 'p x'],
  ['p= x', 'p'],
  ['- x\np', 'p'],
  ['+card', 'card'],
  ['+card.a', '+card'],
  ['+card\n  p', '+card'],
  ['+a', '+b'],
  // Pug-side JavaScript in attribute values (and `&attributes`) is structure: a fix may not rewrite it.
  ['div(class=a ? "x" : "y")', 'div(class=a ? "y" : "x")'],
  ['div(a=b)', 'div(a=c)'],
  ['div(a=b)', 'div(a="b")'],
  ['div(a=`x${b}`)', 'div(a=`x${c}`)'],
  ['div(a=`x${b}`)', 'div(a="x${b}")'],
  ['div(a=f(1, 2))', 'div(a=f(1,2))'],
  ['div&attributes(a)', 'div&attributes(b)'],
  ['+card(a=b)', '+card(a=c)'],
  // So is all other Pug-side JavaScript: code, control heads, mixin arguments, `#{…}`.
  ['if x\n  p', 'if y\n  p'],
  ['each item in items\n  p', 'each item\t in items\n  p'],
  ['each x in y\n  p', 'each x, i in y\n  p'],
  ['p= x', 'p= y'],
  ['- var x = 1', '- var x = 2'],
  ['+card(a)', '+card(b)'],
  ['+card("x")(id="y")', '+card("z")#y'],
  ['p #{a}', 'p #{b}'],
  ['mixin card(title)\n  p', 'mixin card(t)\n  p'],
]

// Two ids on one tag are a parse error (as in pug-parser), yet every id source still counts.
const duplicateIds: [string, string, boolean][] = [
  ['#a#b', '#b#a', true],
  ['#a(id="b")', 'div(id="b")#a', true],
  ['#x(id="y")', '#x', false],
  ['#x(id="y")', '#y', false],
  ['#a#b', '#a', false],
  ['div(id="x")#x', '#x', false],
]

/** The fingerprint of `src`, whose only parse errors are duplicate attributes. */
function fpDuplicates(src: string): string {
  const doc = parsePug(src)
  assertInvariants(doc)
  expect(doc.errors.every((e) => e.code === 'duplicate-attribute')).toBe(true)
  return fingerprint(doc)
}

describe('fingerprint', () => {
  for (const [a, b, same] of duplicateIds) {
    it(`${same ? 'equal' : 'differ'} with duplicate ids: ${JSON.stringify(a)} / ${JSON.stringify(b)}`, () => {
      expect(fpDuplicates(a) === fpDuplicates(b)).toBe(same)
    })
  }
  for (const [a, b] of equal) {
    it(`equal: ${JSON.stringify(a)} ~ ${JSON.stringify(b)}`, () => {
      expect(fp(a)).toBe(fp(b))
    })
  }
  for (const [a, b] of differ) {
    it(`differ: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`, () => {
      expect(fp(a)).not.toBe(fp(b))
    })
  }
})

describe('walk', () => {
  it('visits nodes pre-order, including the tag inside a tag interpolation', () => {
    const doc = parsePug('div\n  p #[b x]\nspan')
    const seen: [string, string][] = []
    const label = (n: PugNode | PugDocument): string => (n.type === 'Tag' ? `Tag:${n.name?.value}` : n.type)
    walk(doc, (node, parent) => seen.push([label(node), label(parent)]))
    expect(seen).toEqual([
      ['Tag:div', 'Document'],
      ['Tag:p', 'Tag:div'],
      ['Text', 'Tag:p'],
      ['Tag:b', 'Text'],
      ['Text', 'Tag:b'],
      ['Tag:span', 'Document'],
    ])
  })
})
