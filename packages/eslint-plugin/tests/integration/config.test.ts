import { existsSync } from 'node:fs'
import { isAbsolute } from 'node:path'
import type { Linter } from 'eslint'
import pluginVue from 'eslint-plugin-vue'
import { describe, expect, it } from 'vitest'
import plugin from '../../src/index.ts'
import { eslintVersions } from '../helpers/eslint-versions.ts'
import type { EslintVersion } from '../helpers/eslint-versions.ts'

const vueRecommended = pluginVue.configs['flat/recommended'] as Linter.Config[]

function calculate(v: EslintVersion, config: Linter.Config[], file: string): Promise<Linter.Config> {
  const eslint = new v.ESLint({ overrideConfigFile: true, overrideConfig: config })
  return eslint.calculateConfigForFile(file) as Promise<Linter.Config>
}

/** `languageOptions.parserOptions` of a resolved config, untyped. */
const parserOptions = (c: Linter.Config): Record<string, unknown> | undefined =>
  c.languageOptions?.parserOptions as Record<string, unknown> | undefined

/** Dotted paths of every function value under `value`. */
function functionPaths(value: unknown, path = '', seen = new Set<unknown>()): string[] {
  if (typeof value === 'function') return [path]
  if (value === null || typeof value !== 'object' || seen.has(value)) return []
  seen.add(value)
  return Object.entries(value).flatMap(([key, v]) => functionPaths(v, `${path}.${key}`, seen))
}

describe('configs.base', () => {
  for (const v of eslintVersions) {
    describe(v.label, () => {
      const config = [...vueRecommended, ...plugin.configs.base]

      it('sets the tokenizer path and our processor, and leaves vue rules alone', async () => {
        const resolved = await calculate(v, config, 'A.vue')
        const tokenizer = parserOptions(resolved)!.templateTokenizer as Record<string, string>
        expect(tokenizer.pug).toBe(plugin.tokenizerPath)
        expect(tokenizer.jade).toBe(plugin.tokenizerPath)
        expect(isAbsolute(tokenizer.pug!)).toBe(true)
        expect(existsSync(tokenizer.pug!)).toBe(true)
        expect(resolved.processor).toBe(plugin.configs.base[0]!.processor)
        expect((resolved.processor as Linter.Processor).meta!.name).toBe('vue-pug/vue')
        const vueOnly = await calculate(v, vueRecommended, 'A.vue')
        expect(vueOnly.rules!['vue/html-indent']).toBeDefined()
        expect(resolved.rules!['vue/html-indent']).toEqual(vueOnly.rules!['vue/html-indent'])
      })

      it('puts no function under parserOptions', async () => {
        const resolved = await calculate(v, config, 'A.vue')
        expect(parserOptions(resolved)).toBeDefined()
        expect(functionPaths(parserOptions(resolved))).toEqual([])
      })

      it('deep-merges parserOptions with an earlier user entry', async () => {
        const user: Linter.Config = { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: 'espree' } } }
        const resolved = await calculate(v, [...vueRecommended, user, ...plugin.configs.base], 'A.vue')
        expect(parserOptions(resolved)!.parser).toBe('espree')
        expect(parserOptions(resolved)!.templateTokenizer).toBeDefined()
      })

      it('does not configure non-Vue files', async () => {
        const resolved = await calculate(v, config, 'a.js')
        expect(parserOptions(resolved)?.templateTokenizer).toBeUndefined()
      })
    })
  }

  it('names the processor after keepVueRules', () => {
    const processor = plugin.configure({ keepVueRules: ['vue/html-indent'] }).base[0]!.processor as Linter.Processor
    expect(processor.meta!.name).toContain('vue/html-indent')
  })

  it('builds recommended as base plus the registry block', () => {
    const { base, recommended } = plugin.configs
    expect(recommended.slice(0, base.length)).toEqual(base)
    expect(recommended[base.length]).toMatchObject({ name: 'vue-pug/recommended', files: ['**/*.vue'], rules: {} })
  })
})
