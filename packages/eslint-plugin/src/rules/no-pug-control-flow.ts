// vue-pug/no-pug-control-flow: reports Pug constructs that run at compile time (conditionals,
// loops, code, mixins, `#{…}` interpolation, includes), which Vue never sees as reactive.
import type { ControlKeyword } from 'pug-lint-parser'
import { walk } from 'pug-lint-parser'
import { createPugRule } from '../utils/create-rule.ts'

type Category = 'control' | 'code' | 'mixin' | 'interpolation' | 'include'
type Options = [{ allow?: Category[] }]

const CATEGORIES: Category[] = ['control', 'code', 'mixin', 'interpolation', 'include']

const INCLUDE_KEYWORDS = new Set<ControlKeyword>(['include', 'extends', 'block', 'append', 'prepend', 'yield', 'doctype'])

const categoryOf = (keyword: ControlKeyword): Category =>
  keyword === 'mixin' ? 'mixin' : INCLUDE_KEYWORDS.has(keyword) ? 'include' : 'control'

export default createPugRule<Options>({
  name: 'no-pug-control-flow',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow Pug compile-time constructs (control flow, code, mixins, `#{}` interpolation, includes)',
      recommended: false,
    },
    schema: [{
      type: 'object',
      properties: {
        allow: { type: 'array', items: { enum: CATEGORIES }, uniqueItems: true },
      },
      additionalProperties: false,
    }],
    messages: {
      control: "Pug '{{keyword}}' runs at compile time; use Vue directives instead.",
      code: 'Pug code runs at compile time; use Vue bindings or script code instead.',
      mixin: 'Pug mixins expand at compile time; use a Vue component instead.',
      interpolation: "Pug '#{}' interpolation runs at compile time; use Vue text interpolation instead.",
    },
  },
  defaultOptions: [{ allow: [] }],
  check(ctx) {
    const allowed = new Set(ctx.options[0]?.allow ?? [])
    walk(ctx.doc, (node) => {
      switch (node.type) {
        case 'Control': {
          const category = categoryOf(node.keyword)
          if (allowed.has(category)) return
          if (category === 'mixin') ctx.report({ range: node.range, messageId: 'mixin' })
          else ctx.report({ range: node.range, messageId: 'control', data: { keyword: node.keyword } })
          return
        }
        case 'Code':
          if (!allowed.has('code')) ctx.report({ range: node.range, messageId: 'code' })
          return
        case 'MixinCall':
          if (!allowed.has('mixin')) ctx.report({ range: node.range, messageId: 'mixin' })
          return
        case 'Text':
          if (allowed.has('interpolation')) return
          for (const part of node.parts) {
            if (part.type === 'Interpolation') ctx.report({ range: part.range, messageId: 'interpolation' })
          }
          return
      }
    })
  },
})
