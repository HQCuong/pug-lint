import rule from '../../src/rules/attribute-parens-spacing.ts'
import { runRule } from '../helpers/rule-tester.ts'

// Positions are 1-based; line 1 is `<template lang="pug">`, so template line N is SFC line N + 1.
const err = (messageId: string, line: number, column: number, endColumn: number) =>
  ({ messageId, line, column, endLine: line, endColumn })
const afterOpen = (line: number, column: number, endColumn: number) => err('unexpectedAfterOpen', line, column, endColumn)
const beforeClose = (line: number, column: number, endColumn: number) => err('unexpectedBeforeClose', line, column, endColumn)
const missingOpen = (line: number, column: number) => err('missingAfterOpen', line, column, column + 1)
const missingClose = (line: number, column: number) => err('missingBeforeClose', line, column, column + 1)

runRule('attribute-parens-spacing', rule, {
  valid: [
    'a(x y)',
    'a',
    'a()',
    { pug: 'a()', options: ['always'] },
    { name: 'a whitespace-only block is empty', pug: 'a( )' },
    { name: 'a whitespace-only block is empty, always', pug: 'a( )', options: ['always'] },
    'a(\n  x\n)',
    { pug: 'a(\n  x\n)', options: ['always'] },
    { pug: 'a( x y )', options: ['always'] },
    { name: 'a gap with a line break belongs to attribute-parens-newline', pug: 'a(  \n  x  \n)' },
    { name: 'line break only after (', pug: 'a(\n  x y)' },
    { name: 'line break only before ), always', pug: 'a( x\n  y\n)', options: ['always'] },
    { name: 'spaces inside a value are not the gap', pug: 'a(title=" x ")' },
    { name: 'parens inside an expression value', pug: 'a(:x="f( 1 )")' },
    { name: '&attributes is not an attribute block', pug: 'a&attributes( x )' },
    { name: 'an unclosed block is an error region and is left alone', pug: 'div\n  a( x y' },
    { name: 'an error on the tag line leaves its block alone', pug: 'a( x, y="z )' },
    { name: 'tab-indented', pug: 'div\n\ta(x)\n\t\tb(\n\t\t\ty\n\t\t)' },
    { name: 'jade template', code: '<template lang="jade">\na( x )\n</template>\n', options: ['always'] },
  ],
  invalid: [
    { pug: 'a( x y )', output: 'a(x y)', errors: [afterOpen(2, 3, 4), beforeClose(2, 7, 8)] },
    { pug: 'a(x)', options: ['always'], output: 'a( x )', errors: [missingOpen(2, 2), missingClose(2, 4)] },
    { name: 'tabs and runs of spaces', pug: 'a(\t  x  \t)', output: 'a(x)', errors: [afterOpen(2, 3, 6), beforeClose(2, 7, 10)] },
    { name: 'only the side without a line break', pug: 'a(  x\n  y  \n)', output: 'a(x\n  y  \n)', errors: [afterOpen(2, 3, 5)] },
    { name: 'only the side without a line break, before )', pug: 'a(\n  x  y  )', output: 'a(\n  x  y)', errors: [beforeClose(3, 7, 9)] },
    {
      name: 'only the side without a line break, always',
      pug: 'a(x\n  y\n)',
      options: ['always'],
      output: 'a( x\n  y\n)',
      errors: [missingOpen(2, 2)],
    },
    { name: 'a leading comma is not this rule\'s', pug: 'a( , x)', output: 'a(, x)', errors: [afterOpen(2, 3, 4)] },
    { name: 'a trailing comma, always', pug: 'a(x,)', options: ['always'], output: 'a( x, )', errors: [missingOpen(2, 2), missingClose(2, 5)] },
    { name: 'every attribute block of a tag', pug: 'a( x)(y )', output: 'a(x)(y)', errors: [afterOpen(2, 3, 4), beforeClose(2, 8, 9)] },
    { name: 'tag interpolation', pug: 'p #[a( x ) t]', output: 'p #[a(x) t]', errors: [afterOpen(2, 7, 8), beforeClose(2, 9, 10)] },
    { name: 'mixin call attributes', pug: '+m(1)( x )', output: '+m(1)(x)', errors: [afterOpen(2, 7, 8), beforeClose(2, 9, 10)] },
    { name: 'shorthands before the block', pug: '.c#i( x )', output: '.c#i(x)', errors: [afterOpen(2, 6, 7), beforeClose(2, 8, 9)] },
    {
      name: 'tab-indented',
      pug: 'div\n\ta( x )\n\t\tb(\n\t\t\ty )',
      output: 'div\n\ta(x)\n\t\tb(\n\t\t\ty)',
      errors: [afterOpen(3, 4, 5), beforeClose(3, 6, 7), beforeClose(5, 5, 6)],
    },
    {
      name: 'CRLF',
      crlf: true,
      pug: 'div\n  a( x )\n  b(\n    y )',
      output: 'div\n  a(x)\n  b(\n    y)',
      errors: [afterOpen(3, 5, 6), beforeClose(3, 7, 8), beforeClose(5, 6, 7)],
    },
    {
      name: 'CRLF, always',
      crlf: true,
      pug: 'div\n  a(x)\n  b(\n    y\n  )',
      options: ['always'],
      output: 'div\n  a( x )\n  b(\n    y\n  )',
      errors: [missingOpen(3, 4), missingClose(3, 6)],
    },
  ],
})
