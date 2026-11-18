// The rule registry: every `vue-pug/*` rule, keyed by its name without the prefix.
import type { Rule } from 'eslint'
import attributeCommas from './attribute-commas.ts'
import attributeEqualsSpacing from './attribute-equals-spacing.ts'
import attributeParensNewline from './attribute-parens-newline.ts'
import attributeParensSpacing from './attribute-parens-spacing.ts'
import attributeQuotes from './attribute-quotes.ts'
import implicitDiv from './implicit-div.ts'
import indent from './indent.ts'
import maxAttributesPerLine from './max-attributes-per-line.ts'
import noMultiSpaces from './no-multi-spaces.ts'
import noPugControlFlow from './no-pug-control-flow.ts'
import preferShorthand from './prefer-shorthand.ts'
import selfClosing from './self-closing.ts'

export const rules: Record<string, Rule.RuleModule> = {
  'attribute-commas': attributeCommas,
  'attribute-equals-spacing': attributeEqualsSpacing,
  'attribute-parens-newline': attributeParensNewline,
  'attribute-parens-spacing': attributeParensSpacing,
  'attribute-quotes': attributeQuotes,
  'implicit-div': implicitDiv,
  indent,
  'max-attributes-per-line': maxAttributesPerLine,
  'no-multi-spaces': noMultiSpaces,
  'no-pug-control-flow': noPugControlFlow,
  'prefer-shorthand': preferShorthand,
  'self-closing': selfClosing,
}
