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
]

describe('fingerprint', () => {
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
