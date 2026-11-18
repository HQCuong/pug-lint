import { readFileSync } from 'node:fs'
import { walk } from '@pug-lint/parser'
import { describe, expect, it } from 'vitest'
import { createPugRule } from '../../src/utils/create-rule.ts'
import { runRule } from '../helpers/rule-tester.ts'

const Html = readFileSync(new URL('../fixtures/corpus/Html.vue', import.meta.url), 'utf8')

// Reports every named tag at its name.
const tagNames = createPugRule<[]>({
  name: 'test-tag-names',
  meta: {
    type: 'suggestion',
    docs: { description: 'test rule', recommended: false },
    schema: [],
    messages: { tag: 'Tag {{name}}.' },
  },
  defaultOptions: [],
  check(ctx) {
    walk(ctx.doc, (node) => {
      if (node.type === 'Tag' && node.name) {
        ctx.report({ range: node.name.range, messageId: 'tag', data: { name: node.name.value } })
      }
    })
  },
})

interface MergeOptions { a?: string; b?: string; nested?: { c?: number; d?: number } }

// Reports `merged` once when it sees the expected merge of its defaults with the user's options.
const merging = createPugRule<[MergeOptions]>({
  name: 'test-merge',
  meta: {
    type: 'suggestion',
    docs: { description: 'test rule', recommended: false },
    schema: [{
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
        nested: { type: 'object', properties: { c: { type: 'number' }, d: { type: 'number' } }, additionalProperties: false },
      },
      additionalProperties: false,
    }],
    messages: { merged: 'Merged.', other: 'Got {{json}}.' },
  },
  defaultOptions: [{ a: 'x', b: 'y', nested: { c: 1, d: 2 } }],
  check(ctx) {
    const json = JSON.stringify(ctx.options)
    const expected = JSON.stringify([{ a: 'x', b: 'z', nested: { c: 1, d: 5 } }])
    ctx.report({ range: ctx.doc.range, messageId: json === expected ? 'merged' : 'other', data: { json } })
  },
})

// Fixes tag name `b` to `strong`: exercises runRule's output wrapping, CRLF and idempotency cases.
const strong = createPugRule<[]>({
  name: 'test-strong',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: { description: 'test rule', recommended: false },
    schema: [],
    messages: { strong: 'Use strong.' },
  },
  defaultOptions: [],
  check(ctx) {
    walk(ctx.doc, (node) => {
      if (node.type === 'Tag' && node.name?.value === 'b') {
        const range = node.name.range
        ctx.report({ range, messageId: 'strong', fix: (fixer) => fixer.replaceTextRange(range, 'strong') })
      }
    })
  },
})

// Reports every tag head that does not touch an error region.
const reliableTags = createPugRule<[]>({
  name: 'test-error-region',
  meta: {
    type: 'suggestion',
    docs: { description: 'test rule', recommended: false },
    schema: [],
    messages: { tag: 'Tag.' },
  },
  defaultOptions: [],
  check(ctx) {
    walk(ctx.doc, (node) => {
      if (node.type === 'Tag' && !ctx.inErrorRegion(node.range)) ctx.report({ range: node.range, messageId: 'tag' })
    })
  },
})

describe('createPugRule', () => {
  it('fills docs.url and defaultOptions', () => {
    expect(tagNames.meta?.docs?.url).toBe(
      'https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/test-tag-names.md',
    )
    expect(merging.meta?.defaultOptions).toEqual([{ a: 'x', b: 'y', nested: { c: 1, d: 2 } }])
  })
})

runRule('test-tag-names', tagNames, {
  valid: [
    { code: Html, name: 'HTML template: no-op' },
    { code: '<script setup>\nconst x = 1\n</script>\n', name: 'no template' },
    { code: '<template lang="pug"></template>\n', name: 'empty Pug template' },
  ],
  invalid: [
    {
      name: 'CRLF positions',
      pug: 'div\n  p\n\n  span.x hi',
      crlf: true,
      errors: [
        { messageId: 'tag', line: 2, column: 1, endLine: 2, endColumn: 4 },
        { messageId: 'tag', line: 3, column: 3, endLine: 3, endColumn: 4 },
        { messageId: 'tag', line: 5, column: 3, endLine: 5, endColumn: 7 },
      ],
    },
    {
      name: 'tab-indented positions',
      pug: 'div\n\tp',
      errors: [{ messageId: 'tag', line: 2, column: 1 }, { messageId: 'tag', line: 3, column: 2 }],
    },
  ],
})

runRule('test-strong', strong, {
  // Identical to the first output: runRule must not add it twice (RuleTester rejects duplicates).
  valid: ['p\n  strong x'],
  invalid: [
    { pug: 'p\n  b x', output: 'p\n  strong x', errors: [{ messageId: 'strong', line: 3, column: 3 }] },
    { name: 'same output twice', pug: 'p\n  b x', options: [], output: 'p\n  strong x', errors: [{ messageId: 'strong' }] },
    { name: 'CRLF output', pug: 'p\n  b x', crlf: true, output: 'p\n  strong x', errors: [{ messageId: 'strong', line: 3, column: 3 }] },
    {
      // A lone CR line break has no EOL a fix could reproduce: report only.
      name: 'lone CR: reported without a fix',
      code: '<template lang="pug">\rp\r  b x\r</template>\r',
      output: null,
      errors: [{ messageId: 'strong', line: 3, column: 3 }],
    },
  ],
})

runRule('test-error-region', reliableTags, {
  valid: [],
  invalid: [
    {
      name: 'skips the line holding an error and the continuation lines of its recovery region',
      // The unclosed '(' makes every later line part of the recovery region.
      pug: 'div\n  a(href="x" title=\n  b\nem',
      errors: [{ messageId: 'tag', line: 2 }],
    },
    {
      name: 'skips only the line holding an error',
      pug: 'div\n  p(x="1" y=)\n  em',
      errors: [{ messageId: 'tag', line: 2 }, { messageId: 'tag', line: 4 }],
    },
    {
      name: 'multi-line attribute blocks and values without errors are reliable',
      pug: 'a(\n  x="1"\n  :y=`{\n    a: 1\n  }`\n)\nb',
      errors: [{ messageId: 'tag', line: 2, endLine: 7 }, { messageId: 'tag', line: 8 }],
    },
  ],
})

runRule('test-merge', merging, {
  valid: [],
  invalid: [
    {
      name: 'partial user options are merged into meta.defaultOptions',
      pug: 'p',
      options: [{ b: 'z', nested: { d: 5 } }],
      errors: [{ messageId: 'merged' }],
    },
  ],
})
