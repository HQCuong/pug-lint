// The rule registry: every `vue-pug/*` rule, keyed by its name without the prefix.
import type { Rule } from 'eslint'
import attributeCommas from './attribute-commas.ts'
import indent from './indent.ts'
import noPugControlFlow from './no-pug-control-flow.ts'

export const rules: Record<string, Rule.RuleModule> = {
  'attribute-commas': attributeCommas,
  indent,
  'no-pug-control-flow': noPugControlFlow,
}
