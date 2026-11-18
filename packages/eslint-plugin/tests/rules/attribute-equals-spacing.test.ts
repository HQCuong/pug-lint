import rule from '../../src/rules/attribute-equals-spacing.ts'
import { runRule } from '../helpers/rule-tester.ts'

// Positions are 1-based; line 1 is `<template lang="pug">`, so template line N is SFC line N + 1.
const err = (line: number, column: number, endColumn: number, operator = '=') =>
  ({ messageId: 'unexpected', line, column, endLine: line, endColumn, data: { operator } })

runRule('attribute-equals-spacing', rule, {
  valid: [
    'a(x="1")',
    'a(x!=y)',
    'a(x y)',
    'a(x, y="1")',
    { name: 'an `=` inside a string value', pug: 'a(:x="a = b")' },
    { name: 'an `==` inside an expression value', pug: 'a(:x=a == b)' },
    { name: 'a gap with a line break before the operator is left alone', pug: 'a(\n  x\n  ="1"\n)' },
    { name: 'a gap with a line break after the operator is left alone', pug: 'a(\n  x=\n    "1"\n)' },
    { name: 'buffered code is not an attribute', pug: 'p = x' },
    { name: '&attributes is not an attribute block', pug: 'a&attributes({ x : 1 })' },
    { name: 'an error on the tag line leaves its attributes alone', pug: 'a(x = "1" y="z)' },
    { name: 'an unclosed block is an error region and is left alone', pug: 'div\n  a(x = 1' },
    { name: 'tab-indented', pug: 'div\n\ta(x="1")\n\t\tb(\n\t\t\ty!=z\n\t\t)' },
  ],
  invalid: [
    { pug: 'a(x = "1")', output: 'a(x="1")', errors: [err(2, 4, 5), err(2, 6, 7)] },
    { pug: 'a(x != y)', output: 'a(x!=y)', errors: [err(2, 4, 5, '!='), err(2, 7, 8, '!=')] },
    { name: 'only before the operator', pug: 'a(x  ="1")', output: 'a(x="1")', errors: [err(2, 4, 6)] },
    { name: 'only after the operator, tabs', pug: 'a(x=\t "1")', output: 'a(x="1")', errors: [err(2, 5, 7)] },
    {
      name: 'every attribute, keeping the space between attributes',
      pug: 'input(type = "text" v-model  =  "name")',
      output: 'input(type="text" v-model="name")',
      errors: [err(2, 11, 12), err(2, 13, 14), err(2, 28, 30), err(2, 31, 33)],
    },
    { name: 'a Vue directive key', pug: 'a(:href = url @click = go)', output: 'a(:href=url @click=go)', errors: [err(2, 8, 9), err(2, 10, 11), err(2, 21, 22), err(2, 23, 24)] },
    {
      name: 'only the same-line gap of an attribute spanning lines',
      pug: 'a(\n  x =\n    "1"\n)',
      output: 'a(\n  x=\n    "1"\n)',
      errors: [err(3, 4, 5)],
    },
    { name: 'tag interpolation', pug: 'p #[a(x = 1) t]', output: 'p #[a(x=1) t]', errors: [err(2, 8, 9), err(2, 10, 11)] },
    { name: 'mixin call attributes', pug: '+m(1)(x = 1)', output: '+m(1)(x=1)', errors: [err(2, 8, 9), err(2, 10, 11)] },
    {
      name: 'tab-indented',
      pug: 'div\n\ta(x = "1")\n\t\tb(\n\t\t\ty != z\n\t\t)',
      output: 'div\n\ta(x="1")\n\t\tb(\n\t\t\ty!=z\n\t\t)',
      errors: [err(3, 5, 6), err(3, 7, 8), err(5, 5, 6, '!='), err(5, 8, 9, '!=')],
    },
    {
      name: 'CRLF',
      crlf: true,
      pug: 'div\n  a(x = "1")\n  b(\n    y != z\n  )',
      output: 'div\n  a(x="1")\n  b(\n    y!=z\n  )',
      errors: [err(3, 6, 7), err(3, 8, 9), err(5, 6, 7, '!='), err(5, 9, 10, '!=')],
    },
  ],
})
