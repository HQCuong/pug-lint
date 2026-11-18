import rule from '../../src/rules/attribute-parens-newline.ts'
import { runRule } from '../helpers/rule-tester.ts'

// Positions are 1-based; line 1 is `<template lang="pug">`, so template line N is SFC line N + 1.
const err = (messageId: string, line: number, column: number, endLine: number, endColumn: number) =>
  ({ messageId, line, column, endLine, endColumn })
const expectedOpen = (line: number, column: number) => err('expectedAfterOpen', line, column, line, column + 1)
const expectedClose = (line: number, column: number) => err('expectedBeforeClose', line, column, line, column + 1)
const unexpectedOpen = (line: number, column: number, endLine: number, endColumn: number) =>
  err('unexpectedAfterOpen', line, column, endLine, endColumn)
const unexpectedClose = (line: number, column: number, endLine: number, endColumn: number) =>
  err('unexpectedBeforeClose', line, column, endLine, endColumn)
const never = [{ multiline: 'never' }]

runRule('attribute-parens-newline', rule, {
  valid: [
    'a(x y) t',
    'a(\n  x\n  y\n) t',
    { name: 'a single attribute whose value spans lines', pug: 'a(:c="{\n  a: 1 }")' },
    { name: 'two attributes starting on one line, the last spanning lines', pug: 'a(x :c="{\n  a: 1 }")' },
    'a',
    'a()',
    { name: 'an empty block is left alone', pug: 'a(\n)' },
    { pug: 'a(x\n  y)', options: never },
    { pug: 'a(x y)', options: never },
    { name: 'same-line spaces belong to attribute-parens-spacing', pug: 'a( x y )' },
    { name: 'same-line spaces belong to attribute-parens-spacing, never', pug: 'a( x\n  y )', options: never },
    { name: 'tag interpolation', pug: 'p #[a(x y) t]' },
    { name: 'an unclosed block is an error region and is left alone', pug: 'div\n  a(x\n    y' },
    { name: 'an error on the tag line leaves its block alone', pug: 'a(\n  x="z)' },
    { name: 'tab-indented', pug: 'div\n\ta(\n\t\tx\n\t\ty\n\t)' },
    { name: 'jade template', code: '<template lang="jade">\na(x\n  y)\n</template>\n', options: never },
  ],
  invalid: [
    { pug: 'a(x\n  y) t', output: 'a(\n  x\n  y\n) t', errors: [expectedOpen(2, 2), expectedClose(3, 4)] },
    { pug: 'a(\n  x y\n) t', output: 'a(x y) t', errors: [unexpectedOpen(2, 3, 3, 3), unexpectedClose(3, 6, 4, 1)] },
    {
      pug: 'a(\n  x\n  y\n)',
      options: never,
      output: 'a(x\n  y)',
      errors: [unexpectedOpen(2, 3, 3, 3), unexpectedClose(4, 4, 5, 1)],
    },
    {
      name: 'a single attribute spanning lines',
      pug: 'a(\n  :c="{\n    a: 1 }"\n)',
      output: 'a(:c="{\n    a: 1 }")',
      errors: [unexpectedOpen(2, 3, 3, 3), unexpectedClose(4, 12, 5, 1)],
    },
    { name: 'only the side without a line break', pug: 'a(\n  x\n  y)', output: 'a(\n  x\n  y\n)', errors: [expectedClose(4, 4)] },
    {
      name: 'same-line spaces before ) are part of the gap',
      pug: 'a(\n  x\n  y  )',
      output: 'a(\n  x\n  y\n)',
      errors: [expectedClose(4, 6)],
    },
    {
      name: 'nested tag',
      pug: 'div\n  a(x\n    y) t',
      output: 'div\n  a(\n    x\n    y\n  ) t',
      errors: [expectedOpen(3, 4), expectedClose(4, 6)],
    },
    {
      name: 'tag after an expansion',
      pug: 'ul\n  li: a(x\n    y) t',
      output: 'ul\n  li: a(\n    x\n    y\n  ) t',
      errors: [expectedOpen(3, 8), expectedClose(4, 6)],
    },
    { name: 'mixin call attributes', pug: '+m(1)(x\n  y)', output: '+m(1)(\n  x\n  y\n)', errors: [expectedOpen(2, 6), expectedClose(3, 4)] },
    { name: 'the first of two blocks', pug: 'a(x\n  y)(z)', output: 'a(\n  x\n  y\n)(z)', errors: [expectedOpen(2, 2), expectedClose(3, 4)] },
    {
      name: 'never, with a value spanning lines',
      pug: 'a(\n  x\n  :c="{\n    a: 1 }"\n)',
      options: never,
      output: 'a(x\n  :c="{\n    a: 1 }")',
      errors: [unexpectedOpen(2, 3, 3, 3), unexpectedClose(5, 12, 6, 1)],
    },
    {
      name: 'tab-indented',
      pug: 'div\n\ta(x\n\t\ty)',
      output: 'div\n\ta(\n\t\tx\n\t\ty\n\t)',
      errors: [expectedOpen(3, 3), expectedClose(4, 4)],
    },
    {
      name: 'CRLF',
      crlf: true,
      pug: 'div\n  a(x\n    y)',
      output: 'div\n  a(\n    x\n    y\n  )',
      errors: [expectedOpen(3, 4), expectedClose(4, 6)],
    },
    {
      name: 'CRLF, unexpected',
      crlf: true,
      pug: 'a(\n  x y\n)',
      output: 'a(x y)',
      errors: [unexpectedOpen(2, 3, 3, 3), unexpectedClose(3, 6, 4, 1)],
    },
  ],
})
