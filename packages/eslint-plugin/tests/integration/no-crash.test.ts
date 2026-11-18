// No vue/* rule may throw on a Pug template: a crash aborts the whole file before the
// processor's postprocess runs, so suppression cannot hide it.
import { readdirSync, readFileSync } from 'node:fs'
import { Linter } from 'eslint'
import type { Rule } from 'eslint'
import { Linter as Linter9 } from 'eslint9'
import pluginVue from 'eslint-plugin-vue'
import { describe, expect, it } from 'vitest'
import { vueCrashing } from '../../src/configs/generated/vue-compat.ts'
import plugin from '../../src/index.ts'
import { eslintVersions } from '../helpers/eslint-versions.ts'
import { scaled } from '../helpers/time-scale.ts'
import { toCRLF, vue } from '../helpers/vue.ts'

const linters = { eslint9: Linter9 as unknown as typeof Linter, eslint10: Linter }

const corpusDir = new URL('../fixtures/corpus/', import.meta.url)
const corpus: [string, string][] = readdirSync(corpusDir)
  .filter((f) => f.endsWith('.vue'))
  .sort()
  .flatMap((name): [string, string][] => {
    const text = readFileSync(new URL(name, corpusDir), 'utf8')
    return [[name, text], [`crlf-${name}`, toCRLF(text)]]
  })
// Shapes the corpus lacks: nesting at several depths, text forms, early closes, void and self-closing tags.
corpus.push(['Shapes.vue', vue([
  'div',
  '  p(class="a") {{ x }}',
  '  ul',
  '    li: a(href="#") x',
  '    li',
  '      | text {{ y }}',
  '  input(type="text")',
  '  Foo/',
  '  p',
  '    div inner',
  '    | after',
  '  textarea {{ t }}',
  '  script.',
  '    const a = 1',
  '| root text',
].join('\n'))])
// A registered component in the wrong casing: vue/component-name-in-template-casing's fixer reads the end tag's first token.
corpus.push(['Casing.vue', vue('div\n  my-button Save', '<script>\nexport default { components: { MyButton: {} } }\n</script>\n')])

const vueRecommended = pluginVue.configs['flat/recommended'] as Linter.Config[]
const allVueRules = Object.keys(pluginVue.rules as Record<string, Rule.RuleModule>).map((name) => `vue/${name}`)

/** Lints `code`; returns the thrown error's message, or null. */
function crash(LinterClass: typeof Linter, code: string, filename: string, config: Linter.Config[]): string | null {
  try {
    new LinterClass({ configType: 'flat' }).verify(code, config, filename)
    return null
  } catch (error) {
    return error instanceof Error ? error.message.split('\n')[0]! : String(error)
  }
}

describe.each(eslintVersions)('no vue rule throws on Pug ($label)', (v) => {
  const LinterClass = linters[v.label]

  it.each(corpus)('flat/recommended + configs.base: %s', (name, code) => {
    expect(crash(LinterClass, code, name, [...vueRecommended, ...plugin.configs.base])).toBeNull()
  })

  // Enabling a rule here overrides `configs.base`, so the rules it turns off are found again.
  it('every pluginVue rule, default options, over the corpus: only vueCrashing throws', () => {
    const crashing = new Set<string>()
    for (const [name, code] of corpus) {
      const all = Object.fromEntries(allVueRules.map((r) => [r, 'error'] as const))
      if (crash(LinterClass, code, name, [...vueRecommended, ...plugin.configs.base, { rules: all }]) === null) continue
      // Something threw: find each culprit alone.
      for (const rule of allVueRules) {
        const only = { ...Object.fromEntries(allVueRules.map((r) => [r, 'off'] as const)), [rule]: 'error' as const }
        if (crash(LinterClass, code, name, [...vueRecommended, ...plugin.configs.base, { rules: only }]) !== null) {
          crashing.add(rule)
        }
      }
    }
    // The committed list comes from the current eslint-plugin-vue; the floor job's older release may crash on
    // a different set, so there only "nothing outside the base config's reach crashes" is kept (the test above).
    if (process.env.PUG_LINT_SKIP_COMPAT_DRIFT !== '1') {
      expect([...crashing].sort()).toEqual(Object.keys(vueCrashing).sort())
    }
    // One rule-by-rule bisection per throwing fixture: seconds per fixture, so it outgrows the default 5s.
  }, scaled(60_000))
})
