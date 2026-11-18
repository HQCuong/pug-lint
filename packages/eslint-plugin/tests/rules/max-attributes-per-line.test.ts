import rule from '../../src/rules/max-attributes-per-line.ts'
import { runRule } from '../helpers/rule-tester.ts'

// Positions are 1-based; line 1 is `<template lang="pug">`, so template line N is SFC line N + 1.
// Each error spans the reported attribute, which here is always a bare key or `key="v"` on one line.
const err = (name: string, line: number, column: number, length = name.length) =>
  ({ messageId: 'shouldBeOnNewLine', data: { name }, line, column, endLine: line, endColumn: column + length })
const one = [{ singleline: 1, multiline: 1 }]

runRule('max-attributes-per-line', rule, {
  valid: [
    'a(x y z)',
    'a',
    'a()',
    'a(\n  w\n  x\n  y\n  z\n)',
    { name: 'one attribute per line without parens on their own lines', pug: 'a(w\n  x\n  y\n  z)' },
    { name: 'a single attribute whose value spans lines', pug: 'a(:c=`{\n  a: 1 }`)' },
    { pug: 'a(x) t', options: one },
    { pug: 'a(\n  w x\n  y\n)', options: [{ singleline: 3, multiline: 2 }] },
    { name: 'each attribute block counts on its own', pug: 'a(x y z)(w)' },
    { name: 'tag interpolation stays on its text line', pug: 'p #[a(w x y z) t]' },
    { name: 'an unclosed block is an error region and is left alone', pug: 'div\n  a(w x y z\n    q' },
    { name: 'an error on the tag line leaves its block alone', pug: 'a(w x y z="q)' },
    { name: 'tab-indented', pug: 'div\n\ta(\n\t\tw\n\t\tx\n\t\ty\n\t\tz\n\t)' },
    { name: 'jade template', code: '<template lang="jade">\na(x y z)\n</template>\n' },
  ],
  invalid: [
    { pug: 'a(x y) t', options: one, output: 'a(x\n  y) t', errors: [err('y', 2, 5)] },
    { pug: 'a(w x y z)', output: 'a(w\n  x\n  y\n  z)', errors: [err('x', 2, 5), err('y', 2, 7), err('z', 2, 9)] },
    { pug: 'a(\n  x y\n  z\n)', output: 'a(\n  x\n  y\n  z\n)', errors: [err('y', 3, 5)] },
    {
      name: 'nested tag uses its own depth',
      pug: 'div\n  a(w x y z)',
      output: 'div\n  a(w\n    x\n    y\n    z)',
      errors: [err('x', 3, 7), err('y', 3, 9), err('z', 3, 11)],
    },
    {
      name: 'tag after an expansion',
      pug: 'ul\n  li: a(w x y z)',
      output: 'ul\n  li: a(w\n    x\n    y\n    z)',
      errors: [err('x', 3, 11), err('y', 3, 13), err('z', 3, 15)],
    },
    {
      name: 'a comma stays attached to the previous attribute',
      pug: 'a(w, x ,y, z)',
      output: 'a(w,\n  x ,\n  y,\n  z)',
      errors: [err('x', 2, 6), err('y', 2, 9), err('z', 2, 12)],
    },
    {
      name: 'the whole same-line gap is replaced',
      pug: 'a(w  x y z)',
      output: 'a(w\n  x\n  y\n  z)',
      errors: [err('x', 2, 6), err('y', 2, 8), err('z', 2, 10)],
    },
    {
      name: 'attributes with values',
      pug: 'a(w x="1" y z)',
      output: 'a(w\n  x="1"\n  y\n  z)',
      errors: [err('x', 2, 5, 5), err('y', 2, 11), err('z', 2, 13)],
    },
    {
      name: 'multiline, more than the limit on one line',
      pug: 'a(\n  w x y z\n)',
      options: [{ singleline: 3, multiline: 2 }],
      output: 'a(\n  w x\n  y\n  z\n)',
      errors: [err('y', 3, 7), err('z', 3, 9)],
    },
    {
      name: 'an attribute after a value spanning lines shares that line',
      pug: 'a(\n  :c=`{\n    a: 1 }` y\n)',
      output: 'a(\n  :c=`{\n    a: 1 }`\n  y\n)',
      errors: [err('y', 4, 13)],
    },
    {
      name: 'a value spanning lines makes the block multiline',
      pug: 'a(x :c=`{\n  a: 1 }`)',
      output: 'a(x\n  :c=`{\n  a: 1 }`)',
      errors: [{ messageId: 'shouldBeOnNewLine', data: { name: ':c' }, line: 2, column: 5, endLine: 3, endColumn: 10 }],
    },
    {
      name: 'mixin call attributes',
      pug: '+m(1)(w x y z)',
      output: '+m(1)(w\n  x\n  y\n  z)',
      errors: [err('x', 2, 9), err('y', 2, 11), err('z', 2, 13)],
    },
    {
      name: 'only the block over the limit',
      pug: 'a(x)(w x y z)',
      output: 'a(x)(w\n  x\n  y\n  z)',
      errors: [err('x', 2, 8), err('y', 2, 10), err('z', 2, 12)],
    },
    {
      name: 'tab-indented',
      pug: 'div\n\ta(w x y z)',
      output: 'div\n\ta(w\n\t\tx\n\t\ty\n\t\tz)',
      errors: [err('x', 3, 6), err('y', 3, 8), err('z', 3, 10)],
    },
    {
      name: 'CRLF',
      crlf: true,
      pug: 'div\n  a(w x y z)',
      output: 'div\n  a(w\n    x\n    y\n    z)',
      errors: [err('x', 3, 7), err('y', 3, 9), err('z', 3, 11)],
    },
  ],
})
