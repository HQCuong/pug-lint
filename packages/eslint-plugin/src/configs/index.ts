// Flat configs: `base` (parser, Pug tokenizer, processor) and `recommended` (base + recommended vue-pug rules).
import type { ESLint, Linter, Rule } from 'eslint'
import vueParser from 'vue-eslint-parser'
import { createProcessor } from '../processor/index.ts'
import { vueCrashing } from './generated/vue-compat.ts'

export interface ConfigOptions {
  /** `vue/*` rules to keep reporting inside Pug templates (removed from the processor's suppression set). */
  keepVueRules?: string[]
}

// Type aliases, not interfaces: they must be assignable to `ESLint.Plugin['configs']` (an index signature).
export type Configs = {
  base: Linter.Config[]
  recommended: Linter.Config[]
}

/** What the configs need from the plugin object. */
export type ConfigPlugin = ESLint.Plugin & {
  rules: Record<string, Rule.RuleModule>
  tokenizerPath: string
}

const files = ['**/*.vue']

export function buildConfigs(plugin: ConfigPlugin, options: ConfigOptions = {}): Configs {
  const base: Linter.Config[] = [{
    name: 'vue-pug/setup',
    files,
    plugins: { 'vue-pug': plugin },
    languageOptions: {
      parser: vueParser,
      // A path, never a function: ESLint must be able to serialize the config (`--cache`).
      parserOptions: { templateTokenizer: { pug: plugin.tokenizerPath, jade: plugin.tokenizerPath } },
    },
    processor: createProcessor({ keepVueRules: options.keepVueRules ?? [] }),
    rules: Object.fromEntries(vueCrashing.map((id) => [id, 'off'])),
  }]
  const recommendedRules: Linter.RulesRecord = {}
  for (const [name, rule] of Object.entries(plugin.rules)) {
    if (rule.meta?.docs?.recommended === true) recommendedRules[`vue-pug/${name}`] = 'warn'
  }
  return {
    base,
    recommended: [...base, { name: 'vue-pug/recommended', files, rules: recommendedRules }],
  }
}
