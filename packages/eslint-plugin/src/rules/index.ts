// The rule registry: every `vue-pug/*` rule, keyed by its name without the prefix.
import type { Rule } from 'eslint'

export const rules: Record<string, Rule.RuleModule> = {}
