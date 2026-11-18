import rule from '../../src/rules/attribute-commas.ts'
import { runRule } from '../helpers/rule-tester.ts'

// Positions are 1-based; line 1 is `<template lang="pug">`, so template line N is SFC line N + 1.
const unexpected = (line: number, column: number) => ({ messageId: 'unexpected', line, column, endLine: line, endColumn: column + 1 })
const missing = (line: number, column: number, endLine: number, endColumn: number) =>
  ({ messageId: 'missing', line, column, endLine, endColumn })

runRule('attribute-commas', rule, {
  valid: [
    'a(x="1" y="2")',
    'a',
    'a()',
    'a(x)',
    'a(\n  x\n  y\n)',
    { name: 'a comma inside a bound value is not an attribute separator', pug: 'a(:x="[1, 2]" y)' },
    { name: 'a comma inside an unquoted expression value', pug: 'a(:x=f(1, 2) y)' },
    { name: 'commas inside a static string value', pug: 'a(title="a, b" y)' },
    { pug: 'a(x, y)', options: ['always'] },
    { pug: 'a(x="1", :y="[1, 2]", z)', options: ['always'] },
    { pug: 'a(x)', options: ['always'] },
    { pug: 'a(\n  x,\n  y\n)', options: ['always'] },
    { name: 'tab-indented, never', pug: 'div\n\ta(\n\t\tx\n\t\ty\n\t)' },
    { name: 'an unclosed block is an error region and is left alone', pug: 'div\n  a(x, y' },
    { name: 'an error on the tag line leaves its block alone', pug: 'a(x, y="z)' },
    { name: 'an error region under always is left alone', pug: 'div\n  a(x y', options: ['always'] },
    { name: 'jade template', code: '<template lang="jade">\na(x y)\n</template>\n' },
  ],
  invalid: [
    { pug: 'a(x="1", y="2")', output: 'a(x="1" y="2")', errors: [unexpected(2, 8)] },
    { name: 'removing a comma that would glue two attributes leaves one space', pug: 'a(x,y)', output: 'a(x y)', errors: [unexpected(2, 4)] },
    { pug: 'a(x ,y)', output: 'a(x y)', errors: [unexpected(2, 5)] },
    {
      name: 'only the comma is removed; the spaces around it are not this rule\'s',
      pug: 'a(x , y)',
      output: 'a(x  y)',
      errors: [unexpected(2, 5)],
    },
    { name: 'comma at a line end', pug: 'a(\n  x,\n  y\n)', output: 'a(\n  x\n  y\n)', errors: [unexpected(3, 4)] },
    { name: 'comma on its own line', pug: 'a(\n  x\n  ,\n  y\n)', output: 'a(\n  x\n  \n  y\n)', errors: [unexpected(4, 3)] },
    { name: 'comma at a line start', pug: 'a(\n  x\n  ,y\n)', output: 'a(\n  x\n  y\n)', errors: [unexpected(4, 3)] },
    {
      name: 'every comma in a multi-line block',
      pug: 'a(\n  x="1",\n  y="2",\n  z\n)',
      output: 'a(\n  x="1"\n  y="2"\n  z\n)',
      errors: [unexpected(3, 8), unexpected(4, 8)],
    },
    { name: 'trailing comma', pug: 'a(x y,)', output: 'a(x y)', errors: [unexpected(2, 6)] },
    { name: 'leading comma', pug: 'a(,x)', output: 'a(x)', errors: [unexpected(2, 3)] },
    { name: 'a block of only a comma', pug: 'a(,)', output: 'a()', errors: [unexpected(2, 3)] },
    {
      name: 'consecutive commas are removed together (one fix, so a single pass is idempotent)',
      pug: 'a(x,,y)',
      output: 'a(x y)',
      errors: [unexpected(2, 4), unexpected(2, 5)],
    },
    { name: 'consecutive commas with space between', pug: 'a(x, ,y)', output: 'a(x y)', errors: [unexpected(2, 4), unexpected(2, 6)] },
    { name: 'every attribute block of a tag', pug: 'a(x,y)(z,w)', output: 'a(x y)(z w)', errors: [unexpected(2, 4), unexpected(2, 9)] },
    { name: 'tag interpolation', pug: 'p #[a(x,y) t]', output: 'p #[a(x y) t]', errors: [unexpected(2, 8)] },
    { name: 'mixin call attributes', pug: '+m(1)(x,y)', output: '+m(1)(x y)', errors: [unexpected(2, 8)] },
    {
      name: 'tab-indented, never',
      pug: 'div\n\ta(\n\t\tx,\n\t\ty\n\t)',
      output: 'div\n\ta(\n\t\tx\n\t\ty\n\t)',
      errors: [unexpected(4, 4)],
    },
    {
      name: 'CRLF',
      crlf: true,
      pug: 'a(\n  x,\n  y\n)',
      output: 'a(\n  x\n  y\n)',
      errors: [unexpected(3, 4)],
    },
    // always
    { pug: 'a(x y)', options: ['always'], output: 'a(x, y)', errors: [missing(2, 4, 2, 5)] },
    {
      pug: 'a(x="1" :y="[1, 2]" z)',
      options: ['always'],
      output: 'a(x="1", :y="[1, 2]", z)',
      errors: [missing(2, 8, 2, 9), missing(2, 20, 2, 21)],
    },
    {
      name: 'multi-line block: the comma goes at the end of the attribute',
      pug: 'a(\n  x\n  y="2"\n  z\n)',
      options: ['always'],
      output: 'a(\n  x,\n  y="2",\n  z\n)',
      errors: [missing(3, 4, 4, 3), missing(4, 8, 5, 3)],
    },
    {
      name: 'mixed: only the missing comma is added',
      pug: 'a(x, y z)',
      options: ['always'],
      output: 'a(x, y, z)',
      errors: [missing(2, 7, 2, 8)],
    },
    { name: 'trailing comma is unexpected under always', pug: 'a(x, y,)', options: ['always'], output: 'a(x, y)', errors: [unexpected(2, 7)] },
    { name: 'leading comma is unexpected under always', pug: 'a(, x, y)', options: ['always'], output: 'a( x, y)', errors: [unexpected(2, 3)] },
    {
      name: 'a doubled comma keeps one under always',
      pug: 'a(x,, y)',
      options: ['always'],
      output: 'a(x, y)',
      errors: [unexpected(2, 5)],
    },
    {
      name: 'tab-indented, always',
      pug: 'div\n\ta(\n\t\tx\n\t\ty\n\t)',
      options: ['always'],
      output: 'div\n\ta(\n\t\tx,\n\t\ty\n\t)',
      errors: [missing(4, 4, 5, 3)],
    },
    {
      name: 'CRLF, always',
      crlf: true,
      pug: 'a(\n  x\n  y\n)',
      options: ['always'],
      output: 'a(\n  x,\n  y\n)',
      errors: [missing(3, 4, 4, 3)],
    },
  ],
})
