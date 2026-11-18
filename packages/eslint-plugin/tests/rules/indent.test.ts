import type { Linter } from 'eslint'
import vueParser from 'vue-eslint-parser'
import { describe, expect, it } from 'vitest'
import { tokenizerPath } from '../../src/index.ts'
import type { DropReason } from '../../src/processor/guard.ts'
import { guardMessages } from '../../src/processor/guard.ts'
import rule from '../../src/rules/indent.ts'
import { eslintVersions } from '../helpers/eslint-versions.ts'
import { lintText } from '../helpers/lint.ts'
import { runRule } from '../helpers/rule-tester.ts'
import { vue } from '../helpers/vue.ts'

const unexpected = (line: number, expected: string, actual: string) =>
  ({ messageId: 'unexpected', data: { expected, actual }, line, column: 1 })

runRule('indent', rule, {
  valid: [
    'div\n  p\n    a',
    { pug: 'div\n\tp', options: ['tab'] },
    'a(\n  x\n  y\n) t',
    { pug: '  div\n    p', options: [2, { baseIndent: 1 }] },
    { pug: 'div\n    p\n        a', options: [4] },
    // Blank and whitespace-only lines are left to core's no-trailing-spaces / no-multiple-empty-lines.
    'div\n  p\n     \n  a',
    { name: 'error line and its recovery region are untouched', pug: 'div\n      a(href="x\n   whatever' },
    {
      name: 'lines nested under buffered code (an error-recovery region, blank lines included) are untouched',
      pug: 'div\n  = x\n      p\n\n   \n   a',
    },
    { name: 'an unclosed paren turns the rest into an untouched recovery region', pug: 'div\n  a(x\n\n      b\n\nc' },
    // Invalid Pug: a quoted JS string cannot contain a line break, so the parse fails there.
    { name: 'a line break inside a quoted value is a recovery region', pug: 'div\n  a(title="x\n      y") t\n      p' },
    { name: 'jade template', code: '<template lang="jade">\ndiv\n  p\n</template>\n' },
  ],
  invalid: [
    {
      pug: 'div\n    p\n        a',
      output: 'div\n  p\n    a',
      errors: [unexpected(3, '2 spaces', '4 spaces'), unexpected(4, '4 spaces', '8 spaces')],
    },
    { pug: 'div\n\tp', output: 'div\n  p', errors: [unexpected(3, '2 spaces', '1 tab')] },
    { pug: 'div\n  p', options: ['tab'], output: 'div\n\tp', errors: [unexpected(3, '1 tab', '2 spaces')] },
    { pug: '\tdiv\n\t\tp', output: 'div\n  p', errors: [unexpected(2, '0 spaces', '1 tab'), unexpected(3, '2 spaces', '2 tabs')] },
    {
      name: 'attribute lines and the closing paren',
      pug: 'a(\n      x\n   y\n      ) t',
      output: 'a(\n  x\n  y\n) t',
      errors: [unexpected(3, '2 spaces', '6 spaces'), unexpected(4, '2 spaces', '3 spaces'), unexpected(5, '0 spaces', '6 spaces')],
    },
    {
      name: 'raw block keeps its relative indentation',
      pug: 'div\n      p.\n          one\n            two',
      output: 'div\n  p.\n    one\n      two',
      errors: [unexpected(3, '2 spaces', '6 spaces'), unexpected(4, '4 spaces', '10 spaces'), unexpected(5, '6 spaces', '12 spaces')],
    },
    {
      name: 'multi-line expression value shifts with its attribute',
      pug: 'a(\n      :c={ a: 1,\n        b: 2 }\n)',
      output: 'a(\n  :c={ a: 1,\n    b: 2 }\n)',
      errors: [unexpected(3, '2 spaces', '6 spaces'), unexpected(4, '4 spaces', '8 spaces')],
    },
    {
      name: 'empty and whitespace-only lines inside a multi-line value are untouched',
      pug: 'a(\n    :c={\n\n   \n      b: 2 }\n)',
      output: 'a(\n  :c={\n\n   \n    b: 2 }\n)',
      errors: [unexpected(3, '2 spaces', '4 spaces'), unexpected(6, '4 spaces', '6 spaces')],
    },
    {
      name: 'a line starting inside a template literal value keeps its whitespace (it is part of the value)',
      pug: 'div\n    a(title=`x\n      y`) t',
      output: 'div\n  a(title=`x\n      y`) t',
      errors: [unexpected(3, '2 spaces', '4 spaces')],
    },
    {
      name: 'a line starting inside a template literal within an expression value keeps its whitespace',
      pug: 'div\n    a(:t=f(`x\n      y`))',
      output: 'div\n  a(:t=f(`x\n      y`))',
      errors: [unexpected(3, '2 spaces', '4 spaces')],
    },
    {
      name: 'a line starting inside a template literal of an object value keeps its whitespace; the others shift',
      pug: 'div\n    a(:c={ a: `x\n      y`,\n      b: 2 })',
      output: 'div\n  a(:c={ a: `x\n      y`,\n    b: 2 })',
      errors: [unexpected(3, '2 spaces', '4 spaces'), unexpected(5, '4 spaces', '6 spaces')],
    },
    {
      name: 'a line starting inside a template literal mixin argument keeps its whitespace',
      pug: 'div\n    +m(`a\n      b`)',
      output: 'div\n  +m(`a\n      b`)',
      errors: [unexpected(3, '2 spaces', '4 spaces')],
    },
    {
      name: 'comment body lines shift with their comment',
      pug: 'div\n    // note\n      body\n\n        more\n    //- hidden\n          x\n            y\n    p',
      output: 'div\n  // note\n    body\n\n      more\n  //- hidden\n    x\n      y\n  p',
      errors: [
        unexpected(3, '2 spaces', '4 spaces'),
        unexpected(4, '4 spaces', '6 spaces'),
        unexpected(6, '6 spaces', '8 spaces'),
        unexpected(7, '2 spaces', '4 spaces'),
        unexpected(8, '4 spaces', '10 spaces'),
        unexpected(9, '6 spaces', '12 spaces'),
        unexpected(10, '2 spaces', '4 spaces'),
      ],
    },
    {
      name: 'mixin-call argument lines shift with the call line; the closing paren takes the call depth',
      pug: 'div\n    +m(\n      a,\n    b\n    )',
      output: 'div\n  +m(\n    a,\n  b\n  )',
      errors: [
        unexpected(3, '2 spaces', '4 spaces'),
        unexpected(4, '4 spaces', '6 spaces'),
        unexpected(5, '2 spaces', '4 spaces'),
        unexpected(6, '2 spaces', '4 spaces'),
      ],
    },
    {
      name: 'tab-indented raw block converted to spaces keeps the characters past the block indentation',
      pug: 'div\n\tp.\n\t\tone\n\t\t\ttwo',
      output: 'div\n  p.\n    one\n    \ttwo',
      errors: [unexpected(3, '2 spaces', '1 tab'), unexpected(4, '4 spaces', '2 tabs'), unexpected(5, '4 spaces and 1 tab', '3 tabs')],
    },
    {
      name: 'raw line less indented than its anchor never goes below the anchor',
      pug: 'p.\n      one\n   two',
      output: 'p.\n  one\n  two',
      errors: [unexpected(3, '2 spaces', '6 spaces'), unexpected(4, '2 spaces', '3 spaces')],
    },
    {
      name: 'anchored line with other whitespace characters than its anchor is left alone',
      pug: 'div\n  p.\n      one\n\t\t\ttwo',
      output: 'div\n  p.\n    one\n\t\t\ttwo',
      errors: [unexpected(4, '4 spaces', '6 spaces')],
    },
    {
      // Rule-level behavior only: in a real run the guard drops every fix in a template with a parse error.
      name: 'line holding a parse error is skipped, its sibling is fixed',
      pug: 'div\n   p(x="1" y=)\n   em',
      output: 'div\n   p(x="1" y=)\n  em',
      errors: [unexpected(4, '2 spaces', '3 spaces')],
    },
    {
      name: 'buffered-code line is fixed, the recovery region nested under it is not',
      pug: 'div\n    = x\n      p\n\n      a',
      output: 'div\n  = x\n      p\n\n      a',
      errors: [unexpected(3, '2 spaces', '4 spaces')],
    },
    {
      name: 'lines before an unclosed paren are fixed, the recovery region is not',
      pug: 'div\n    span\n  a(x\n\n      b\n\nc',
      output: 'div\n  span\n  a(x\n\n      b\n\nc',
      errors: [unexpected(3, '2 spaces', '4 spaces')],
    },
    {
      name: 'baseIndent',
      pug: 'div\n  p',
      options: [2, { baseIndent: 1 }],
      output: '  div\n    p',
      errors: [unexpected(2, '2 spaces', '0 spaces'), unexpected(3, '4 spaces', '2 spaces')],
    },
    {
      name: 'content on the <template> line has no leading whitespace to fix',
      code: '<template lang="pug">div\n p\n</template>\n',
      options: [2, { baseIndent: 1 }],
      output: '<template lang="pug">div\n    p\n</template>\n',
      errors: [unexpected(2, '4 spaces', '1 space')],
    },
    {
      name: 'CRLF',
      pug: 'div\n    p\n\n        a',
      crlf: true,
      output: 'div\n  p\n\n    a',
      errors: [unexpected(3, '2 spaces', '4 spaces'), unexpected(5, '4 spaces', '8 spaces')],
    },
  ],
})

describe('indent fixes and the guard', () => {
  const config: Linter.Config[] = [{
    files: ['**/*.vue'],
    plugins: { 'vue-pug': { rules: { indent: rule } } },
    languageOptions: { parser: vueParser, parserOptions: { templateTokenizer: { pug: tokenizerPath } } },
    rules: { 'vue-pug/indent': 'warn' },
  }]
  // Pug indentation is structure: a fix that moved `section` without its children and its sibling
  // `footer` would change the tree, and the guard checks every fix alone.
  const code = vue('div\n     section\n       h1 Title\n       p\n          span text\n     footer\n           small x')
  for (const v of eslintVersions) {
    it(`every fix alone is safe (${v.label})`, async () => {
      const { messages } = await lintText(v, code, config)
      expect(messages).toHaveLength(6)
      const drops: DropReason[] = []
      const kept = guardMessages(code, messages, (_, reason) => drops.push(reason))
      expect(drops).toEqual([])
      expect(kept.every((m) => m.fix)).toBe(true)
    })
  }

  // Every report carries the same fix; the guard must verify it once, not once per message.
  it('lints and guards ~2000 misindented lines in linear time', async () => {
    const pug = 'div\n' + Array.from({ length: 1000 }, (_, i) => `\tsection\n\t\tp(class="a${i}") text ${i}`).join('\n')
    const big = vue(pug)
    const v = eslintVersions.at(-1)!
    const { messages } = await lintText(v, big, config)
    expect(messages).toHaveLength(2000)
    const t0 = performance.now()
    const kept = guardMessages(big, messages)
    const ms = performance.now() - t0
    expect(kept.every((m) => m.fix)).toBe(true)
    // Measured ~50 ms; the per-message (quadratic) verification took several seconds here.
    expect(ms).toBeLessThan(1500)
  })
})
