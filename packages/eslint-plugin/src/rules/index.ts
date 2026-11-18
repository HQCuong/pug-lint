// The rule registry: every `vue-pug/*` rule, keyed by its name without the prefix.
import type { Rule } from 'eslint'
import attributeCommas from './attribute-commas.ts'
import attributeEqualsSpacing from './attribute-equals-spacing.ts'
import attributeParensNewline from './attribute-parens-newline.ts'
import attributeParensSpacing from './attribute-parens-spacing.ts'
import indent from './indent.ts'
import maxAttributesPerLine from './max-attributes-per-line.ts'
import noPugControlFlow from './no-pug-control-flow.ts'

export const rules: Record<string, Rule.RuleModule> = {
  'attribute-commas': attributeCommas,
  'attribute-equals-spacing': attributeEqualsSpacing,
  'attribute-parens-newline': attributeParensNewline,
  'attribute-parens-spacing': attributeParensSpacing,
  indent,
  'max-attributes-per-line': maxAttributesPerLine,
  'no-pug-control-flow': noPugControlFlow,
}
