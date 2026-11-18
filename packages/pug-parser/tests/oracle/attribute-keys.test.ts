// Oracle cases for attribute keys: pug-lexer accepts or rejects each source exactly when the parser
// does. Keys with unbalanced or mismatched brackets or a '/', a '!' that is not '!=', text glued to
// a key, a '//' comment in an unquoted value, an escape JavaScript rejects in a value and a repeated
// attribute name are errors in Pug.
import { describe, expect, it } from 'vitest'
import { parsePug } from '../../src/index.ts'
import { officialSkeleton } from './skeleton.ts'

const cases: [name: string, src: string][] = [
  ['Vue keys with balanced brackets', 'div(:[a]="1" #cell(x)="y" v-slot:row(a(b))="r")'],
  ['a key in braces', 'div({a}="1")'],
  ['an unclosed brace in a key', 'div(a{b="1")'],
  ['a key starting with an unclosed brace', '.modal({v-if="open")'],
  ['an unclosed interpolation brace in a key', 'template(##{default)'],
  ['an unclosed bracket in a key', 'div(a[b="1")'],
  ['an unclosed paren in a key', 'div(a(b="1")'],
  ['a mismatched bracket in a key', 'div(a(b]="1")'],
  ['a stray closing brace after a key', 'div(a}="1")'],
  ['"!" without "=" inside a key', 'div(@click.pre!nt="m")'],
  ['"!" without "=" after a key', 'div(a !b)'],
  ['"!=" after a key', 'div(a != b)'],
  ['text glued to a quoted key', 'div("a"b)'],
  ['a quoted key and a boolean attribute', 'div("a" b)'],
  ['"//" inside a key', 'div(a//b="1")'],
  ['"//" between attributes', 'div(a="1" //b="2")'],
  ['"//" in an unquoted value', 'div(a b=1//x\n)'],
  ['"//" in a quoted value', 'a(href="//cdn.example.com/x")'],
  ['"/" inside a key', 'input(type="checkbox" v-/model="done")'],
  ['a quote inside brackets of a key', 'a(v-bind:[attribute`Na]="url")'],
  ['a template literal inside brackets of a key', 'template(#[`header-${col.key}`]="{ label }")'],
  ['a duplicate attribute', 'a(title="t" title="u") x'],
  ['a duplicate quoted attribute', 'div(\'a\'=1 a=2)'],
  ['duplicate classes', 'div(class="a" class="b")'],
  ['two id shorthands', '#a#b'],
  ['an id shorthand and an id attribute', 'div(id=x)#y'],
  ['a duplicate attribute of a mixin call', '+m(a=1 a=2)'],
  ['a duplicate attribute in a tag interpolation', 'p #[a(x=1 x=2)]'],
  ['the same key in a filter', ':cdata(a=1 a=2) x'],
  ['the same key in &attributes', 'div(a=1)&attributes({a: 2})'],
  ['"//" inside a template literal of a key', 'template(#[`h-${col.//key}`]="x")'],
  ['")" inside a template literal of a key', 'template(#[`h-${col.)key}`]="x")'],
  ['"!" inside a template literal of a key', 'template(#[`h!${col.key}`]="x")'],
  ['a bad \\u escape in a value', 'div(v-on="{ mo\\usedown: f }")'],
  ['a bad \\x escape in a value', 'div(a="\\x1")'],
  ['a bad escape in a template value', 'div(a=`\\u1`)'],
  ['an octal escape in a template value', 'div(a=`[\\1 ]`)'],
  ['"\\0" in a template value', 'div(a=`\\0`)'],
  ['valid escapes in a value', 'div(a="\\u00e9 \\x41 \\u{1F600} \\n \\1")'],
]

describe('attribute keys against pug-lexer', () => {
  it.each(cases)('%s', (_name, src) => {
    const official = officialSkeleton(src).ok
    const ours = parsePug(src).errors.length === 0
    expect({ src, ours }).toEqual({ src, ours: official })
  })

  it('covers both verdicts', () => {
    const verdicts = new Set(cases.map(([, src]) => officialSkeleton(src).ok))
    expect([...verdicts].sort()).toEqual([false, true])
  })
})
