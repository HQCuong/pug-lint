// The all-rules harness config: the shipped `recommended` config after eslint-plugin-vue's
// `flat/recommended`, with the setup entry's processor swapped for one that reports dropped fixes.
import type { Linter } from 'eslint'
import pluginVue from 'eslint-plugin-vue'
import plugin from '../../src/index.ts'
import type { ProcessorOptions } from '../../src/processor/index.ts'
import { createProcessor } from '../../src/processor/index.ts'

export function allRulesConfig(spy: NonNullable<ProcessorOptions['onDrop']>): Linter.Config[] {
  const ours = plugin.configs.recommended.map((c) =>
    c.name === 'vue-pug/setup' ? { ...c, processor: createProcessor({ onDrop: spy }) } : c,
  )
  if (!ours.some((c) => c.name === 'vue-pug/setup')) throw new Error('allRulesConfig(): no vue-pug/setup entry')
  return [...(pluginVue.configs['flat/recommended'] as Linter.Config[]), ...ours]
}
