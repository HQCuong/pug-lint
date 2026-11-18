import type { Linter } from 'eslint'
import pluginVue from 'eslint-plugin-vue'
import { describe, expect, it } from 'vitest'
import plugin from '../../src/index.ts'
import { eslintVersions } from '../helpers/eslint-versions.ts'
import { lintText } from '../helpers/lint.ts'
import { vue } from '../helpers/vue.ts'

const vueRecommended = pluginVue.configs['flat/recommended'] as Linter.Config[]
const config = [...vueRecommended, ...plugin.configs.recommended]

const recommendedRules = [
  'indent',
  'attribute-commas',
  'attribute-parens-spacing',
  'attribute-parens-newline',
  'max-attributes-per-line',
  'attribute-equals-spacing',
  'no-multi-spaces',
  'attribute-quotes',
  'implicit-div',
  'self-closing',
  'prefer-shorthand',
]

describe('configs.recommended', () => {
  it('enables exactly the 11 recommended rules at warn, not no-pug-control-flow', () => {
    const block = plugin.configs.recommended.find((c) => c.name === 'vue-pug/recommended')!
    expect(Object.keys(block.rules!).sort()).toEqual(recommendedRules.map((r) => `vue-pug/${r}`).sort())
    expect(block.rules).not.toHaveProperty('vue-pug/no-pug-control-flow')
    for (const level of Object.values(block.rules!)) expect(level).toBe('warn')
  })

  it('registers all 12 rules with description, schema and messages', () => {
    expect(Object.keys(plugin.rules).sort()).toEqual([...recommendedRules, 'no-pug-control-flow'].sort())
    for (const [name, rule] of Object.entries(plugin.rules)) {
      expect(rule.meta?.docs?.description, name).toBeTruthy()
      expect(rule.meta?.schema, name).toBeDefined()
      expect(rule.meta?.messages, name).toBeDefined()
    }
  })

  for (const v of eslintVersions) {
    describe(v.label, () => {
      it('fixes attributes to the recommended shape', async () => {
        const src = vue(`MyButton(@click="onClick", :fooBar="x", title='hi') Save`)
        const { output } = await lintText(v, src, config, { fix: true })
        expect(output).toBe(vue(`MyButton(:foo-bar="x" title="hi" @click="onClick") Save`))
      })

      it('moves a static class attribute into the shorthand after the last shorthand', async () => {
        const src = vue(`.card#main(class="wrap")`)
        const { output } = await lintText(v, src, config, { fix: true })
        expect(output).toBe(vue(`.card#main.wrap`))
      })
    })
  }
})
