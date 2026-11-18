import rule from '../../src/rules/no-multi-spaces.ts'
import { runRule } from '../helpers/rule-tester.ts'

// Positions are 1-based; line 1 is `<template lang="pug">`, so template line N is SFC line N + 1.
const multi = (line: number, column: number, endColumn: number) =>
  ({ messageId: 'multipleSpaces', line, column, endLine: line, endColumn })

runRule('no-multi-spaces', rule, {
  valid: [
    'a(x y)',
    'a(x, y)',
    { name: 'spaces inside a value', pug: 'a(title="a   b")' },
    { name: 'spaces inside an expression value', pug: 'a(:x="f(1,   2)")' },
    { name: 'inline text is content', pug: 'p    Hello   world' },
    { name: 'text after the attribute block is content', pug: 'a(x)   text' },
    { name: 'gaps next to the parens are attribute-parens-spacing\'s', pug: 'a(  x  )' },
    { name: 'one attribute per line', pug: 'a(\n  x\n  y\n)' },
    { name: 'whitespace before a line break is not between two attributes on one line', pug: 'a(x  \n  y)' },
    { name: 'whitespace before a comma is not the measured run', pug: 'a(x  , y)' },
    { name: 'a single tab', pug: 'a(x\ty)' },
    { name: 'an error on the tag line leaves its block alone', pug: 'a(x   y="z )' },
    { name: 'an unclosed block is an error region and is left alone', pug: 'div\n  a(x   y' },
    { name: 'tab-indented', pug: 'div\n\ta(x y)\n\t\tb(\n\t\t\tz\n\t\t)' },
    { name: 'jade template', code: '<template lang="jade">\na(x y)\n</template>\n' },
  ],
  invalid: [
    { pug: 'a(x   y)', output: 'a(x y)', errors: [multi(2, 4, 7)] },
    { name: 'after a comma', pug: 'a(x,   y)', output: 'a(x, y)', errors: [multi(2, 5, 8)] },
    { name: 'between valued attributes', pug: 'a(x="1"  :y="2")', output: 'a(x="1" :y="2")', errors: [multi(2, 8, 10)] },
    { name: 'tabs and spaces', pug: 'a(x \t y)', output: 'a(x y)', errors: [multi(2, 4, 7)] },
    { name: 'every gap', pug: 'a(x  y   z)', output: 'a(x y z)', errors: [multi(2, 4, 6), multi(2, 7, 10)] },
    { name: 'a line of a multiline block', pug: 'a(\n  x  y\n)', output: 'a(\n  x y\n)', errors: [multi(3, 4, 6)] },
    { name: 'every attribute block of a tag', pug: 'a(x  y)(z  w)', output: 'a(x y)(z w)', errors: [multi(2, 4, 6), multi(2, 10, 12)] },
    { name: 'tag interpolation', pug: 'p #[a(x  y) t]', output: 'p #[a(x y) t]', errors: [multi(2, 8, 10)] },
    { name: 'mixin call attributes', pug: '+m(1,  2)(x  y)', output: '+m(1,  2)(x y)', errors: [multi(2, 12, 14)] },
    {
      name: 'tab-indented',
      pug: 'div\n\ta(x  y)\n\t\tb(\n\t\t\tz\t\tw\n\t\t)',
      output: 'div\n\ta(x y)\n\t\tb(\n\t\t\tz w\n\t\t)',
      errors: [multi(3, 5, 7), multi(5, 5, 7)],
    },
    {
      name: 'CRLF',
      crlf: true,
      pug: 'div\n  a(x   y)\n  b(\n    z  w\n  )',
      output: 'div\n  a(x y)\n  b(\n    z w\n  )',
      errors: [multi(3, 6, 9), multi(5, 6, 8)],
    },
  ],
})
