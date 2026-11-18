import rule from '../../src/rules/prefer-shorthand.ts'
import { runRule } from '../helpers/rule-tester.ts'

// Positions are 1-based; line 1 is `<template lang="pug">`, so template line N is SFC line N + 1.
const err = (messageId: string, line: number, column: number, endColumn: number) => ({ messageId, line, column, endLine: line, endColumn })
const short = (line: number, column: number, endColumn: number) => err('useShorthand', line, column, endColumn)
const attr = (line: number, column: number, endColumn: number) => err('useAttribute', line, column, endColumn)

const classNever = [{ class: 'never', id: 'ignore' }]
const bothNever = [{ class: 'never', id: 'never' }]

runRule('prefer-shorthand', rule, {
  valid: [
    'div.a#b(:k="v")',
    'div(class="md:flex")',
    'div(class="a md:flex")',
    'div(class="w-1/2")',
    'div(:class="a")',
    'div(class=cls)',
    'div(class=`a`)',
    'div(class="")',
    'div(class)',
    '#x(id="y")',
    { name: 'an id that is not an identifier', pug: 'div(id="a b")' },
    { name: 'a dynamic id next to an id shorthand', pug: '#x(id=y)' },
    { name: 'a mixin call is not a tag', pug: '+m(class="a")' },
    { name: 'an error on the tag line leaves it alone', pug: 'div(class="a" y="z)' },
    { name: 'ignore', options: [{ class: 'ignore', id: 'ignore' }], pug: 'div(class="a" id="b")' },
    { name: 'never: attributes are fine', options: bothNever, pug: 'div(class="a" id="b")' },
    { name: 'never: id shorthand and id attribute together are left to the user', options: bothNever, pug: '#x(id="y")' },
  ],
  invalid: [
    {
      pug: 'div(class="a b")',
      output: 'div.a.b',
      errors: [{ ...short(2, 5, 16), data: { shorthand: '.a.b', name: 'class' } }],
    },
    { name: 'after an existing shorthand', pug: 'div.x(class="a" :k="v")', output: 'div.x.a(:k="v")', errors: [short(2, 7, 16)] },
    { name: 'the last attribute, after a comma', pug: 'div(:k="v", class="a")', output: 'div.a(:k="v")', errors: [short(2, 13, 22)] },
    {
      name: 'class and id: one combined fix',
      pug: 'div(id="x" class="a")',
      output: 'div#x.a',
      errors: [{ ...short(2, 5, 11), data: { shorthand: '#x', name: 'id' } }, short(2, 12, 21)],
    },
    { name: 'a component with inline text', pug: 'Foo(class="a") text', output: 'Foo.a text', errors: [short(2, 5, 14)] },
    { name: 'single quotes and unescaped', pug: "a(class!='a-b _c' href=\"/\")", output: 'a.a-b._c(href="/")', errors: [short(2, 3, 18)] },
    { name: 'an attribute between others', pug: 'a(x class="b" y)', output: 'a.b(x y)', errors: [short(2, 5, 14)] },
    { name: 'an implicit div', pug: '.x(class="a")', output: '.x.a', errors: [short(2, 4, 13)] },
    { name: 'self-closing, dot block and expansion', pug: 'img(class="a")/\np(class="b").\n  t\nli(class="c"): a', output: 'img.a/\np.b.\n  t\nli.c: a', errors: [short(2, 5, 14), short(3, 3, 12), short(5, 4, 13)] },
    { name: 'inside an interpolation', pug: 'p #[span(class="a") x]', output: 'p #[span.a x]', errors: [short(2, 10, 19)] },
    { name: 'a second attribute block', pug: 'a(x)(class="b")', output: 'a.b(x)', errors: [short(2, 6, 15)] },
    {
      name: 'a multi-line attribute block',
      pug: 'div(\n  class="a"\n  :k="v"\n)',
      output: 'div.a(\n  :k="v"\n)',
      errors: [short(3, 3, 12)],
    },
    { name: 'id only, next to an existing class shorthand', pug: 'div.a(id="x")', output: 'div.a#x', errors: [short(2, 7, 13)] },
    {
      name: 'never: implicit div gets div',
      options: classNever,
      pug: '.a.b',
      output: 'div(class="a b")',
      errors: [{ ...attr(2, 1, 3), data: { shorthand: '.a', name: 'class' } }, attr(2, 3, 5)],
    },
    { name: 'never: before the existing attributes', options: classNever, pug: 'p.a(x)', output: 'p(class="a" x)', errors: [attr(2, 2, 4)] },
    { name: 'never: an id shorthand stays', options: classNever, pug: '#x.a', output: '#x(class="a")', errors: [attr(2, 3, 5)] },
    { name: 'never: appended to a static class', options: classNever, pug: "p.a(x class='b')", output: "p(x class='b a')", errors: [attr(2, 2, 4)] },
    { name: 'never: the quote style of the block', options: classNever, pug: "p.a(x='1')", output: "p(class='a' x='1')", errors: [attr(2, 2, 4)] },
    { name: 'never: into an empty block', options: classNever, pug: 'p.a()', output: 'p(class="a")', errors: [attr(2, 2, 4)] },
    {
      name: 'never: class and id together',
      options: bothNever,
      pug: '#x.a.b text',
      output: 'div(id="x" class="a b") text',
      errors: [attr(2, 1, 3), attr(2, 3, 5), attr(2, 5, 7)],
    },
    {
      name: 'mixed: id never, class always',
      options: [{ class: 'always', id: 'never' }],
      pug: '#x(class="a")',
      output: '.a(id="x")',
      errors: [attr(2, 1, 3), short(2, 4, 13)],
    },
    {
      name: 'tab-indented',
      pug: 'section\n\tdiv(class="a")\n\t\tp(id="b" x)',
      output: 'section\n\tdiv.a\n\t\tp#b(x)',
      errors: [short(3, 6, 15), short(4, 5, 11)],
    },
    {
      name: 'CRLF',
      crlf: true,
      pug: 'section\n  div(\n    class="a"\n    x\n  )',
      output: 'section\n  div.a(\n    x\n  )',
      errors: [short(4, 5, 14)],
    },
    {
      name: 'never: CRLF',
      crlf: true,
      options: classNever,
      pug: 'section\n  .a\n    p.b',
      output: 'section\n  div(class="a")\n    p(class="b")',
      errors: [attr(3, 3, 5), attr(4, 6, 8)],
    },
  ],
})
