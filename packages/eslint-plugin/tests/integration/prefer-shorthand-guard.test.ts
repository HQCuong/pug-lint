// vue-pug/prefer-shorthand through the real processor: its fixes change the class/id form but not the
// structural fingerprint, so the guard lets them through. A control rule that loses a class is dropped,
// which proves the pass is due to the class-aware fingerprint and not to a disabled guard.
import type { Linter, Rule } from 'eslint'
import pluginVue from 'eslint-plugin-vue'
import { walk } from '@pug-lint/parser'
import { describe, expect, it, vi } from 'vitest'
import { buildConfigs } from '../../src/configs/index.ts'
import plugin from '../../src/index.ts'
import type { DropReason } from '../../src/processor/guard.ts'
import { createProcessor } from '../../src/processor/index.ts'
import { createPugRule } from '../../src/utils/create-rule.ts'
import { eslintVersions } from '../helpers/eslint-versions.ts'
import { lintText } from '../helpers/lint.ts'
import { vue } from '../helpers/vue.ts'

type Spy = (m: Linter.LintMessage, reason: DropReason) => void

/** Rewrites `div(class="a b")` to `div.a`: loses the class `b`. */
const losesClass = createPugRule<[]>({
  name: 'test-loses-class',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: { description: 'test rule', recommended: false },
    schema: [],
    messages: { m: 'm' },
  },
  defaultOptions: [],
  check(ctx) {
    walk(ctx.doc, (node) => {
      if (node.type !== 'Tag') return
      for (const block of node.attributeBlocks) {
        if (ctx.text.slice(...block.range) !== '(class="a b")') continue
        ctx.report({ range: block.range, messageId: 'm', fix: (fixer) => fixer.replaceTextRange(block.range, '.a') })
      }
    })
  },
})

/** flat/recommended, then `configs.base` (with `extraRules` in the plugin) whose processor reports drops to `spy`, then `rules`. */
function config(spy: Spy, rules: Linter.RulesRecord, extraRules: Record<string, Rule.RuleModule> = {}): Linter.Config[] {
  const base = buildConfigs({ ...plugin, rules: { ...plugin.rules, ...extraRules } }).base
  return [
    ...(pluginVue.configs['flat/recommended'] as Linter.Config[]),
    ...base.map((c) => (c.name === 'vue-pug/setup' ? { ...c, processor: createProcessor({ onDrop: spy }) } : c)),
    { files: ['**/*.vue'], rules },
  ]
}

describe.each(eslintVersions)('prefer-shorthand through the guard ($label)', (v) => {
  it('always: class="a b" becomes .a.b', async () => {
    const spy = vi.fn<Spy>()
    const { output, messages } = await lintText(v, vue('div(class="a b" :k="v")'), config(spy, { 'vue-pug/prefer-shorthand': 'warn' }), { fix: true })
    expect(output).toBe(vue('div.a.b(:k="v")'))
    expect(spy).not.toHaveBeenCalled()
    expect(messages.filter((m) => m.ruleId === 'vue-pug/prefer-shorthand')).toEqual([])
  })

  it('never: .a.b becomes div(class="a b")', async () => {
    const spy = vi.fn<Spy>()
    const rules: Linter.RulesRecord = { 'vue-pug/prefer-shorthand': ['warn', { class: 'never' }] }
    const { output, messages } = await lintText(v, vue('.a.b'), config(spy, rules), { fix: true })
    expect(output).toBe(vue('div(class="a b")'))
    expect(spy).not.toHaveBeenCalled()
    expect(messages.filter((m) => m.ruleId === 'vue-pug/prefer-shorthand')).toEqual([])
  })

  it('control: a fix that loses a class is dropped as a structure change', async () => {
    const spy = vi.fn<Spy>()
    const code = vue('div(class="a b")')
    const { output } = await lintText(v, code, config(spy, { 'vue-pug/test-loses-class': 'warn' }, { 'test-loses-class': losesClass }), { fix: true })
    expect(output).toBe(code)
    expect(spy.mock.calls.map(([m, reason]) => [m.ruleId, reason])).toContainEqual(['vue-pug/test-loses-class', 'structure'])
  })
})
