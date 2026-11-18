import rule from '../../src/rules/implicit-div.ts'
import { runRule } from '../helpers/rule-tester.ts'

// Positions are 1-based; line 1 is `<template lang="pug">`, so template line N is SFC line N + 1.
const unexpected = (line: number, column: number) => ({ messageId: 'unexpectedDiv', line, column, endLine: line, endColumn: column + 3 })
const missing = (line: number, column: number, endColumn: number) => ({ messageId: 'missingDiv', line, column, endLine: line, endColumn })

const never = ['never']

runRule('implicit-div', rule, {
  valid: [
    '.card#x(a)',
    'div',
    'div(a)',
    { name: 'a div with &attributes only', pug: 'div&attributes(x)' },
    { name: 'a div with block expansion and no shorthand', pug: 'div: p' },
    { name: 'a div with text', pug: 'div text .a' },
    { name: 'a named non-div tag', pug: 'span.a' },
    { name: 'a tag whose name only starts with div', pug: 'divider.a' },
    { name: 'a mixin call with shorthands is not a tag', pug: '+div.a' },
    { name: 'an interpolated implicit div', pug: 'p #[.a x]' },
    { name: 'an error on the tag line leaves it alone', pug: 'div.a(x="1" y="z)' },
    { name: 'an unclosed block is an error region and is left alone', pug: 'p\n  div.a(x' },
    { name: 'tab-indented', pug: 'section\n\t.a\n\t\t#b' },
    { name: 'never: an explicit div', options: never, pug: 'div.card#x(a)' },
    { name: 'never: a bare div', options: never, pug: 'div' },
    { name: 'never: an interpolated div', options: never, pug: 'p #[div.a x]' },
  ],
  invalid: [
    { pug: 'div.card#x(a)', output: '.card#x(a)', errors: [unexpected(2, 1)] },
    { name: 'an id shorthand', pug: 'div#x', output: '#x', errors: [unexpected(2, 1)] },
    { name: 'nested, with dot block and expansion', pug: 'div.a.\n  t\np\n  div#b: div.c x', output: '.a.\n  t\np\n  #b: .c x', errors: [unexpected(2, 1), unexpected(5, 3), unexpected(5, 10)] },
    { name: 'self-closing', pug: 'div.a/', output: '.a/', errors: [unexpected(2, 1)] },
    {
      name: 'a shorthand after the attributes is reported without a fix',
      pug: 'div(a).b',
      output: null,
      errors: [unexpected(2, 1)],
    },
    {
      name: 'an interpolated div is reported without a fix',
      pug: 'p #[div.a x]',
      output: null,
      errors: [unexpected(2, 5)],
    },
    {
      name: 'an expansion inside an interpolation is reported without a fix',
      pug: 'p #[a: div.b x]',
      output: null,
      errors: [unexpected(2, 8)],
    },
    { name: 'never', options: never, pug: '.card', output: 'div.card', errors: [missing(2, 1, 6)] },
    { name: 'never: an id first', options: never, pug: '#x.a(b)', output: 'div#x.a(b)', errors: [missing(2, 1, 3)] },
    { name: 'never: an interpolated implicit div', options: never, pug: 'p #[.a x]', output: 'p #[div.a x]', errors: [missing(2, 5, 7)] },
    {
      name: 'tab-indented',
      pug: 'section\n\tdiv.a\n\t\tdiv#b',
      output: 'section\n\t.a\n\t\t#b',
      errors: [unexpected(3, 2), unexpected(4, 3)],
    },
    {
      name: 'CRLF',
      crlf: true,
      pug: 'section\n  div.a\n    div#b',
      output: 'section\n  .a\n    #b',
      errors: [unexpected(3, 3), unexpected(4, 5)],
    },
    {
      name: 'never: CRLF',
      crlf: true,
      options: never,
      pug: 'section\n  .a\n    #b',
      output: 'section\n  div.a\n    div#b',
      errors: [missing(3, 3, 5), missing(4, 5, 7)],
    },
  ],
})
