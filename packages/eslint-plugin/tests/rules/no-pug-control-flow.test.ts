import rule from '../../src/rules/no-pug-control-flow.ts'
import { runRule } from '../helpers/rule-tester.ts'

runRule('no-pug-control-flow', rule, {
  valid: [
    'ul\n  li(v-for="i in xs" :key="i") {{ i }}',
    { pug: 'include ./a.pug', options: [{ allow: ['include'] }] },
    // Tag interpolation is plain markup.
    'p #[b x]',
    { pug: 'if a\n  p\nelse\n  span', options: [{ allow: ['control'] }] },
    { pug: '- var a = 1\np= a', options: [{ allow: ['code'] }] },
    { pug: '+card\nmixin card\n  p', options: [{ allow: ['mixin'] }] },
    { pug: 'p #{a}', options: [{ allow: ['interpolation'] }] },
    { code: '<template><div/></template>\n', name: 'non-Pug template' },
  ],
  invalid: [
    { pug: 'if a\n  p', errors: [{ messageId: 'control', line: 2, column: 1 }] },
    { pug: '- var a = 1', errors: [{ messageId: 'code', line: 2, column: 1 }] },
    { pug: 'p= a', errors: [{ messageId: 'code', line: 2, column: 2 }] },
    { pug: '+card', errors: [{ messageId: 'mixin', line: 2, column: 1 }] },
    { pug: 'mixin card\n  p', errors: [{ messageId: 'mixin', line: 2, column: 1 }] },
    { pug: 'p #{a}', errors: [{ messageId: 'interpolation', line: 2, column: 3 }] },
    { pug: 'include ./a.pug', errors: [{ messageId: 'control', line: 2, column: 1 }] },
    {
      name: 'include-like keywords report as control',
      pug: 'doctype html\nextends ./layout.pug\nblock content\n  p\nappend a\n  p\nprepend b\n  p\nyield',
      errors: [2, 3, 4, 6, 8, 10].map((line) => ({ messageId: 'control', line, column: 1 })),
    },
    {
      name: 'nested constructs are each reported',
      pug: 'div\n  each x in xs\n    case x\n      when 1\n        p #{x}\n      default\n        = x',
      errors: [
        { messageId: 'control', line: 3, column: 3 },
        { messageId: 'control', line: 4, column: 5 },
        { messageId: 'control', line: 5, column: 7 },
        { messageId: 'interpolation', line: 6, column: 11 },
        { messageId: 'control', line: 7, column: 7 },
        { messageId: 'code', line: 8, column: 9 },
      ],
    },
    {
      name: 'allow keeps the other categories',
      pug: 'if a\n  p= a',
      options: [{ allow: ['control'] }],
      errors: [{ messageId: 'code', line: 3, column: 4 }],
    },
    {
      name: 'allow include does not allow control',
      pug: 'include ./a.pug\nunless b\n  p',
      options: [{ allow: ['include'] }],
      errors: [{ messageId: 'control', line: 3, column: 1 }],
    },
    {
      name: 'CRLF positions',
      pug: 'div\n  p #{a}\n  - b()',
      crlf: true,
      errors: [{ messageId: 'interpolation', line: 3, column: 5 }, { messageId: 'code', line: 4, column: 3 }],
    },
    {
      name: 'jade template',
      code: '<template lang="jade">\nif a\n  p\n</template>\n',
      errors: [{ messageId: 'control', line: 2, column: 1 }],
    },
  ],
})
