import { describe, expect, it } from 'vitest'
import rule from '../../src/rules/attribute-quotes.ts'
import { allNodes, dump, parseVue, templateBody } from '../helpers/parse-vue.ts'
import type { AnyNode } from '../helpers/parse-vue.ts'
import { runRule } from '../helpers/rule-tester.ts'
import { vue } from '../helpers/vue.ts'

// Positions are 1-based; line 1 is `<template lang="pug">`, so template line N is SFC line N + 1.
const err = (line: number, column: number, endColumn: number, expected = 'double') =>
  ({ messageId: 'wrongQuotes', line, column, endLine: line, endColumn, data: { expected } })

const convert = ['double', { backticks: 'convert' }]

runRule('attribute-quotes', rule, {
  valid: [
    // Invalid Pug (a quoted JS string cannot contain a line break): a parse error, left alone.
    { name: 'a quoted value spanning lines', pug: "a(:c='{ a: 1,\n  b: 2 }')" },
    'a(x="1")',
    'a(x y="")',
    { name: 'backticks are kept by default', pug: 'a(x=`t`)' },
    { name: 'a multi-line backtick value is never converted', options: convert, pug: 'a(:c=`{\n  a: 1 }`)' },
    { name: 'a backtick value with a substitution is never converted', options: convert, pug: 'a(x=`a${b}`)' },
    { name: 'a backtick body holding a double quote is left alone', options: convert, pug: 'a(x=`say "hi"`)' },
    { name: 'a backtick body holding a single quote is left alone', options: convert, pug: "a(x=`it's`)" },
    { name: 'a backtick body holding a backslash is left alone', options: convert, pug: 'a(x=`a\\nb`)' },
    { name: 'an expression value is never touched', pug: 'a(:x="a" + b)' },
    { name: 'an unquoted expression value', pug: "a(:x=f('y'))" },
    { name: 'single preferred', options: ['single'], pug: "a(x='1')" },
    { name: 'single preferred, backticks converted', options: ['single', { backticks: 'convert' }], pug: "a(x='t')" },
    { name: 'an error on the tag line leaves its attributes alone', pug: "a(x='1' y=\"z)" },
    { name: 'an unclosed block is an error region and is left alone', pug: "div\n  a(x='1'" },
    { name: 'tab-indented', pug: 'div\n\ta(x="1")\n\t\tb(\n\t\t\ty="2"\n\t\t)' },
  ],
  invalid: [
    { pug: "a(x='1')", output: 'a(x="1")', errors: [err(2, 5, 8)] },
    { name: 'a body holding the target quote is reported without a fix', pug: 'a(x=\'say "hi"\')', output: null, errors: [err(2, 5, 15)] },
    { name: 'a body holding a backslash is reported without a fix', pug: "a(x='it\\'s')", output: null, errors: [err(2, 5, 12)] },
    { name: 'single preferred', options: ['single'], pug: 'a(x="1")', output: "a(x='1')", errors: [err(2, 5, 8, 'single')] },
    { name: 'single preferred, body holding a single quote', options: ['single'], pug: 'a(x="it\'s")', output: null, errors: [err(2, 5, 11, 'single')] },
    { name: 'backticks converted on request', options: convert, pug: 'a(x=`t`)', output: 'a(x="t")', errors: [err(2, 5, 8)] },
    {
      name: 'backticks converted to single quotes',
      options: ['single', { backticks: 'convert' }],
      pug: 'a(x=`t`)',
      output: "a(x='t')",
      errors: [err(2, 5, 8, 'single')],
    },
    { name: 'a bound key keeps its expression', options: convert, pug: 'a(:x=`{ a: b }`)', output: 'a(:x="{ a: b }")', errors: [err(2, 6, 16)] },
    { name: 'a Vue directive value', pug: "a(:href='url' @click='go()')", output: 'a(:href="url" @click="go()")', errors: [err(2, 9, 14), err(2, 22, 28)] },
    { name: 'an empty string', pug: "a(x='')", output: 'a(x="")', errors: [err(2, 5, 7)] },
    { name: 'tag interpolation', pug: "p #[a(x='1') t]", output: 'p #[a(x="1") t]', errors: [err(2, 9, 12)] },
    { name: 'mixin call attributes', pug: "+m(1)(x='1')", output: '+m(1)(x="1")', errors: [err(2, 9, 12)] },
    {
      name: 'tab-indented',
      pug: "div\n\ta(x='1')\n\t\tb(\n\t\t\ty='2'\n\t\t)",
      output: 'div\n\ta(x="1")\n\t\tb(\n\t\t\ty="2"\n\t\t)',
      errors: [err(3, 6, 9), err(5, 6, 9)],
    },
    {
      name: 'CRLF',
      crlf: true,
      pug: "div\n  a(x='1')\n  b(\n    y='2'\n  )",
      output: 'div\n  a(x="1")\n  b(\n    y="2"\n  )',
      errors: [err(3, 7, 10), err(5, 7, 10)],
    },
  ],
})

// Converting backticks swaps one character for one at each end, so what vue/* rules see of the
// attribute must not move: the same directive expression at the same offsets, or the same literal value.
describe('backtick conversion keeps what vue/* rules see', () => {
  const view = (pug: string): string[] => {
    const attribute = allNodes(templateBody(parseVue(vue(pug))) as unknown as AnyNode).find((n) => n.type === 'VAttribute')!
    const value = attribute['value'] as AnyNode & { value?: string; expression?: AnyNode }
    if (value.type === 'VLiteral') return [`VLiteral ${JSON.stringify(value.value)}`]
    return dump(value.expression!)
  }
  it.each([
    ['a(:x=`{ a: b }`)', 'a(:x="{ a: b }")'],
    ['a(:x=`a + b`)', 'a(:x="a + b")'],
    ['a(@click=`go()`)', 'a(@click="go()")'],
    ['a(x=`t`)', 'a(x="t")'],
  ])('%s', (before, after) => {
    expect(view(after)).toEqual(view(before))
  })
})
