// The all-rules harness config: the shipped `recommended` config after eslint-plugin-vue's
// `flat/recommended`, with the setup entry's processor swapped for one that reports dropped fixes.
import type { Linter, Rule } from 'eslint'
import pluginVue from 'eslint-plugin-vue'
import { buildConfigs } from '../../src/configs/index.ts'
import plugin from '../../src/index.ts'
import type { ProcessorOptions } from '../../src/processor/index.ts'
import { createProcessor } from '../../src/processor/index.ts'

/**
 * `extraRules` (tests only) are added to a copy of the plugin, never to the real registry; like
 * registered rules, they are enabled when `meta.docs.recommended` is true.
 */
export function allRulesConfig(
  spy: NonNullable<ProcessorOptions['onDrop']>,
  extraRules: Record<string, Rule.RuleModule> = {},
): Linter.Config[] {
  const recommended = Object.keys(extraRules).length === 0
    ? plugin.configs.recommended
    : buildConfigs({ ...plugin, rules: { ...plugin.rules, ...extraRules } }).recommended
  const ours = recommended.map((c) =>
    c.name === 'vue-pug/setup' ? { ...c, processor: createProcessor({ onDrop: spy }) } : c,
  )
  if (!ours.some((c) => c.name === 'vue-pug/setup')) throw new Error('allRulesConfig(): no vue-pug/setup entry')
  return [...(pluginVue.configs['flat/recommended'] as Linter.Config[]), ...ours]
}
