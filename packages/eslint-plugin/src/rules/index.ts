// The rule registry: every `vue-pug/*` rule, keyed by its name without the prefix.
import type { Rule } from 'eslint'
import noPugControlFlow from './no-pug-control-flow.ts'

export const rules: Record<string, Rule.RuleModule> = {
  'no-pug-control-flow': noPugControlFlow,
}
