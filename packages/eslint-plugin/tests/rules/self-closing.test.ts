import rule from '../../src/rules/self-closing.ts'
import { runRule } from '../helpers/rule-tester.ts'

// Positions are 1-based; line 1 is `<template lang="pug">`, so template line N is SFC line N + 1.
const unexpected = (line: number, column: number) => ({ messageId: 'unexpected', line, column, endLine: line, endColumn: column + 1 })
const missing = (line: number, column: number, endColumn: number) => ({ messageId: 'missing', line, column, endLine: line, endColumn })

const components = ['always-components']

runRule('self-closing', rule, {
  valid: [
    'Foo(a)',
    'img',
    'div\n  p text',
    { name: 'a mixin call is not a tag', pug: '+foo' },
    { name: 'an error on the tag line leaves it alone', pug: 'img(a="1" b="x)/' },
    { name: 'an unclosed block is an error region and is left alone', pug: 'p\n  img(x/' },
    { name: 'tab-indented', pug: 'section\n\tdiv\n\t\timg' },
    { name: 'always-components: a component with inline text', options: components, pug: 'MyComp x' },
    { name: 'always-components: a component with children', options: components, pug: 'my-comp\n  p' },
    { name: 'always-components: trailing whitespace is text content in Pug', options: components, pug: 'MyComp \np' },
    { name: 'always-components: a component with code', options: components, pug: 'MyComp= x' },
    { name: 'always-components: a component with a dot block', options: components, pug: 'MyComp.\n  t' },
    { name: 'always-components: a component with block expansion', options: components, pug: 'MyComp: p' },
    { name: 'always-components: a self-closing component', options: components, pug: 'MyComp(a)/' },
    { name: 'always-components: an HTML tag', options: components, pug: 'img\ndiv' },
    {
      name: 'always-components: a self-closing component with inline text is left alone',
      options: components,
      pug: 'MyComp/ x',
    },
    { name: 'always-components: an implicit div is not a component', options: components, pug: '.a' },
    { name: 'always-components: tab-indented', options: components, pug: 'section\n\tMyComp/\n\t\t//- c' },
  ],
  invalid: [
    { pug: 'Foo(a)/', output: 'Foo(a)', errors: [unexpected(2, 7)] },
    { pug: 'img/', output: 'img', errors: [unexpected(2, 4)] },
    { name: 'shorthands and &attributes', pug: 'img.a#b&attributes(x)/', output: 'img.a#b&attributes(x)', errors: [unexpected(2, 22)] },
    { name: 'inside an interpolation', pug: 'p #[img/] x', output: 'p #[img] x', errors: [unexpected(2, 8)] },
    { name: 'at the end of an expansion chain', pug: 'li: a: img/', output: 'li: a: img', errors: [unexpected(2, 11)] },
    { name: 'a multi-line attribute block', pug: 'Foo(\n  a\n)/', output: 'Foo(\n  a\n)', errors: [unexpected(4, 2)] },
    { name: 'nested unbuffered comment', pug: 'Foo/\n  //- c', output: 'Foo\n  //- c', errors: [unexpected(2, 4)] },
    {
      // Pug renders `p/ x` as `<p/>x`: the text is a sibling, so removing `/` would move it inside.
      name: 'inline text after `/` is reported without a fix',
      pug: 'p/ x',
      output: null,
      errors: [unexpected(2, 2)],
    },
    { name: 'trailing whitespace after `/` is reported without a fix', pug: 'p/ \na', output: null, errors: [unexpected(2, 2)] },
    { name: 'code after `/` is reported without a fix', pug: 'p/= x', output: null, errors: [unexpected(2, 2)] },
    { name: 'a dot after `/` is reported without a fix', pug: 'p/.', output: null, errors: [unexpected(2, 2)] },
    { name: 'nested content is reported without a fix', pug: 'p/\n  a', output: null, errors: [unexpected(2, 2)] },
    {
      name: 'tab-indented',
      pug: 'section\n\timg/\n\t\t//- c',
      output: 'section\n\timg\n\t\t//- c',
      errors: [unexpected(3, 5)],
    },
    { name: 'CRLF', crlf: true, pug: 'section\n  img/\n  br/', output: 'section\n  img\n  br', errors: [unexpected(3, 6), unexpected(4, 5)] },
    { name: 'always-components', options: components, pug: 'MyComp(a)', output: 'MyComp(a)/', errors: [missing(2, 1, 7)] },
    { name: 'always-components: a hyphenated name', options: components, pug: 'my-comp', output: 'my-comp/', errors: [missing(2, 1, 8)] },
    {
      name: 'always-components: shorthands and &attributes',
      options: components,
      pug: 'MyComp.a#b(c)&attributes(x)',
      output: 'MyComp.a#b(c)&attributes(x)/',
      errors: [missing(2, 1, 7)],
    },
    {
      name: 'always-components: a multi-line attribute block',
      options: components,
      pug: 'MyComp(\n  a\n)',
      output: 'MyComp(\n  a\n)/',
      errors: [missing(2, 1, 7)],
    },
    {
      name: 'always-components: inside an interpolation and at the end of an expansion chain',
      options: components,
      pug: 'p #[my-comp] x\nli: MyComp',
      output: 'p #[my-comp/] x\nli: MyComp/',
      errors: [missing(2, 5, 12), missing(3, 5, 11)],
    },
    {
      name: 'always-components: an HTML tag must not self-close',
      options: components,
      pug: 'img/\nMyComp',
      output: 'img\nMyComp/',
      errors: [unexpected(2, 4), missing(3, 1, 7)],
    },
    {
      name: 'always-components: an error on another line does not stop the rule',
      options: components,
      pug: 'MyComp\np(a="x',
      output: 'MyComp/\np(a="x',
      errors: [missing(2, 1, 7)],
    },
    {
      name: 'always-components: tab-indented',
      options: components,
      pug: 'section\n\tMyComp\n\t\t//- c\n\tmy-comp',
      output: 'section\n\tMyComp\n\t\t//- c\n\tmy-comp/',
      errors: [missing(5, 2, 9)],
    },
    {
      name: 'always-components: CRLF',
      crlf: true,
      options: components,
      pug: 'section\n  MyComp\n  img/',
      output: 'section\n  MyComp/\n  img',
      errors: [missing(3, 3, 9), unexpected(4, 6)],
    },
  ],
})
