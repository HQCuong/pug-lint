// The rule registry: every `vue-pug/*` rule, keyed by its name without the prefix.
import type { Rule } from 'eslint'
import attributeCommas from './attribute-commas.ts'
import attributeParensSpacing from './attribute-parens-spacing.ts'
import indent from './indent.ts'
import noPugControlFlow from './no-pug-control-flow.ts'

export const rules: Record<string, Rule.RuleModule> = {
  'attribute-commas': attributeCommas,
  'attribute-parens-spacing': attributeParensSpacing,
  indent,
  'no-pug-control-flow': noPugControlFlow,
}
