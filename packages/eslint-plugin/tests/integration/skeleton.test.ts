// Walking-skeleton gate: the whole pipeline (vue-eslint-parser + Pug tokenizer + eslint-plugin-vue
// rules + our processor) through the public ESLint API, on both ESLint majors.
import { cpSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Linter } from 'eslint'
import pluginVue from 'eslint-plugin-vue'
import { describe, expect, it, vi } from 'vitest'
import { vueCrashing, vueSuppressed } from '../../src/configs/generated/vue-compat.ts'
import plugin from '../../src/index.ts'
import type { DropReason } from '../../src/processor/guard.ts'
import { createProcessor } from '../../src/processor/index.ts'
import { templateFingerprint } from '../../src/shared/templates.ts'
import { eslintVersions } from '../helpers/eslint-versions.ts'
import { lintText } from '../helpers/lint.ts'

const corpusDir = new URL('../fixtures/corpus/', import.meta.url)
const fixture = (name: string): string => readFileSync(new URL(name, corpusDir), 'utf8')

const Basic = fixture('Basic.vue')
const Bom = fixture('Bom.vue')
const Jade = fixture('Jade.vue')
const Html = fixture('Html.vue')
const Directives = fixture('Directives.vue')
const Broken = fixture('Broken.vue')
const GuardLive = fixture('GuardLive.vue')

const vueFiles = ['**/*.vue']
const vueRecommended = pluginVue.configs['flat/recommended'] as Linter.Config[]
const config: Linter.Config[] = [...vueRecommended, ...plugin.configs.base]
// `configs.base` turns the `vueCrashing` rules off everywhere. Comparisons with plain eslint-plugin-vue
// therefore use plain flat/recommended with the same rules off.
const crashingOff: Linter.Config = {
  files: vueFiles,
  rules: Object.fromEntries(Object.keys(vueCrashing).map((id) => [id, 'off'])),
}
const plainVue: Linter.Config[] = [...vueRecommended, crashingOff]

/** 1-based ESLint position of the nth occurrence of `needle` in `code` (BOM-stripped). */
function pos(code: string, needle: string, nth = 0): { line: number; column: number } {
  const text = code.replace(/^﻿/, '')
  let index = -1
  for (let n = 0; n <= nth; n++) {
    index = text.indexOf(needle, index + 1)
    if (index === -1) throw new Error(`pos(): occurrence ${nth} of ${JSON.stringify(needle)} not found`)
  }
  const before = text.slice(0, index)
  const line = before.split(/\r\n|\r|\n/).length
  return { line, column: index - Math.max(before.lastIndexOf('\n'), before.lastIndexOf('\r')) }
}

const summary = (messages: Linter.LintMessage[]): Pick<Linter.LintMessage, 'ruleId' | 'line' | 'column' | 'message'>[] =>
  messages.map(({ ruleId, line, column, message }) => ({ ruleId, line, column, message }))

const byRule = (messages: Linter.LintMessage[], ruleId: string): Linter.LintMessage[] =>
  messages.filter((m) => m.ruleId === ruleId)

/** The line of `output` containing `needle`. */
const lineOf = (output: string, needle: string): string =>
  output.split(/\r\n|\r|\n/).find((l) => l.includes(needle)) ?? ''

describe.each(eslintVersions)('walking skeleton ($label)', (v) => {
  describe('semantic rules on Basic.vue', () => {
    it('reports at exact positions, without directive or fatal noise', async () => {
      const { messages } = await lintText(v, Basic, config)
      expect(byRule(messages, 'vue/require-v-for-key').map(({ line, column }) => ({ line, column })))
        .toContainEqual(pos(Basic, 'li(v-for="item in items")'))
      expect(byRule(messages, 'vue/no-use-v-if-with-v-for').map((m) => m.line))
        .toContain(pos(Basic, 'div(v-if="ok"').line)
      const unused = byRule(messages, 'vue/no-unused-vars')
      expect(unused.map(({ line, column }) => ({ line, column }))).toEqual([pos(Basic, 'i) in list')])
      expect(unused[0]!.message).toContain("'i'")
      expect(messages.filter((m) => m.ruleId === 'vue/comment-directive')).toEqual([])
      expect(messages.filter((m) => m.fatal)).toEqual([])
    })

    it('flattens each/mixin bodies and skips //- comment bodies', async () => {
      const { messages } = await lintText(v, Basic, config)
      const keyLines = byRule(messages, 'vue/require-v-for-key').map((m) => m.line)
      expect(keyLines).toContain(pos(Basic, 'span(v-for="y in ys")').line)
      expect(keyLines).toContain(pos(Basic, 'span(v-for="z in zs")').line)
      const commentLine = pos(Basic, 'div(v-for="q in qs")').line
      expect(messages.filter((m) => m.line === commentLine)).toEqual([])
    })
  })

  describe('suppression', () => {
    it('hides every vueSuppressed rule inside the Pug template', async () => {
      const { messages } = await lintText(v, Basic, config)
      expect(messages.filter((m) => m.ruleId !== null && m.ruleId in vueSuppressed)).toEqual([])
    })

    it('leaves an HTML template alone: vue/html-indent reports and fixes as in plain eslint-plugin-vue', async () => {
      // vue/html-indent is in vueCrashing, so configs.base turns it off; a user may turn it back on
      // (it is safe on HTML templates). The processor must not suppress it there.
      const htmlIndent = vueRecommended.reduce<Linter.RuleEntry | undefined>(
        (entry, c) => c.rules?.['vue/html-indent'] ?? entry,
        undefined,
      )
      expect(htmlIndent).toBeDefined()
      const ours = [...config, { files: vueFiles, rules: { 'vue/html-indent': htmlIndent! } }]
      const { messages } = await lintText(v, Html, ours)
      expect(byRule(messages, 'vue/html-indent').length).toBeGreaterThan(0)
      const fixed = await lintText(v, Html, ours, { fix: true })
      const plain = await lintText(v, Html, vueRecommended, { fix: true })
      expect(fixed.output).not.toBe(Html)
      expect(fixed.output).toBe(plain.output)
    })
  })

  describe('fix run', () => {
    it.each(['Basic.vue', 'Crlf.vue', 'Tabs.vue', 'Bom.vue'])('%s: keeps structure, is idempotent, fixes through exact ranges', async (name) => {
      const input = fixture(name)
      const { output } = await lintText(v, input, config, { fix: true, filename: name })
      expect(templateFingerprint(output)).not.toBeNull()
      expect(templateFingerprint(output)).toBe(templateFingerprint(input))
      const again = await lintText(v, output, config, { fix: true, filename: name })
      expect(again.output).toBe(output)
      if (name === 'Crlf.vue') expect(/[^\r]\n/.test(output)).toBe(false)
      if (name === 'Bom.vue') expect(output.startsWith('﻿')).toBe(true)
      const button = lineOf(output, 'MyButton')
      expect(button).toContain(':foo-bar="x"')
      expect(button.indexOf('@click="onClick"')).toBeGreaterThan(button.indexOf('title='))
      // No vue-pug/* rule exists yet: commas and quotes are untouched.
      expect(button).toContain(', ')
      expect(button).toContain("title='hi'")
    })
  })

  it('BOM: positions equal those without a BOM', async () => {
    const basic = await lintText(v, Basic, config)
    const bom = await lintText(v, Bom, config, { filename: 'Bom.vue' })
    const at = (ms: Linter.LintMessage[]): { line: number; column: number } => {
      const m = byRule(ms, 'vue/require-v-for-key')[0]!
      return { line: m.line, column: m.column }
    }
    expect(at(bom.messages)).toEqual(pos(Basic, 'li(v-for="item in items")'))
    expect(at(bom.messages)).toEqual(at(basic.messages))
  })

  describe('cache', () => {
    it('lintText twice with one cacheLocation', async () => {
      const cacheLocation = join(mkdtempSync(join(tmpdir(), 'pug-lint-skeleton-')), '.eslintcache')
      const first = await lintText(v, Basic, config, { cache: true, cacheLocation })
      const second = await lintText(v, Basic, config, { cache: true, cacheLocation })
      expect(first.messages.length).toBeGreaterThan(0)
      expect(second.messages).toEqual(first.messages)
    })

    it('lintFiles twice over a copy of the corpus', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'pug-lint-skeleton-'))
      cpSync(fileURLToPath(corpusDir), join(dir, 'corpus'), { recursive: true })
      const cacheLocation = join(dir, '.eslintcache')
      const run = async (): Promise<[string, Linter.LintMessage[]][]> => {
        const eslint = new v.ESLint({ cwd: dir, overrideConfigFile: true, overrideConfig: config, cache: true, cacheLocation })
        const results = await eslint.lintFiles(['corpus/*.vue'])
        return results.map((r) => [r.filePath, r.messages])
      }
      const first = await run()
      const second = await run()
      expect(first.length).toBeGreaterThan(0)
      expect(first.flatMap(([, ms]) => ms).some((m) => m.ruleId === 'vue/require-v-for-key')).toBe(true)
      expect(second).toEqual(first)
    })
  })

  describe('directives (Directives.vue)', () => {
    const lintDirectives = (extra: Linter.Config[] = []): ReturnType<typeof lintText> =>
      lintText(v, Directives, [...config, ...extra], { filename: 'Directives.vue' })

    it('disable-next-line and disable/enable blocks work in //- comments', async () => {
      const { messages } = await lintDirectives()
      expect(byRule(messages, 'vue/require-v-for-key').map((m) => m.line)).toEqual([
        pos(Directives, 'li(v-for="c in cs")').line,
      ])
      expect(messages.filter((m) => m.fatal)).toEqual([])
    })

    it('reports an unused disable directive once through vue/comment-directive', async () => {
      const { messages } = await lintDirectives([
        { files: vueFiles, rules: { 'vue/comment-directive': ['error', { reportUnusedDisableDirectives: true }] } },
      ])
      const unused = byRule(messages, 'vue/comment-directive')
      expect(unused).toHaveLength(1)
      expect(unused[0]!.message).toContain('vue/no-v-html')
      expect(unused[0]!.line).toBe(pos(Directives, '//- eslint-disable-next-line vue/no-v-html').line)
    })

    it('linterOptions.reportUnusedDisableDirectives adds no clear/enable noise', async () => {
      const { messages } = await lintDirectives([{ linterOptions: { reportUnusedDisableDirectives: 'error' } }])
      expect(messages.filter((m) => /eslint-enable|clear/.test(m.message))).toEqual([])
      expect(byRule(messages, 'vue/require-v-for-key')).toHaveLength(1)
    })
  })

  describe('jade', () => {
    it('Jade.vue reports and fixes like Basic.vue', async () => {
      // Same filename for both: vue/multi-word-component-names reports the component name.
      const jade = await lintText(v, Jade, config)
      const basic = await lintText(v, Basic, config)
      expect(summary(jade.messages)).toEqual(summary(basic.messages))
      const jadeFixed = await lintText(v, Jade, config, { fix: true })
      const basicFixed = await lintText(v, Basic, config, { fix: true })
      expect(jadeFixed.output).toBe(basicFixed.output.replace('lang="pug"', 'lang="jade"'))
    })
  })

  describe('broken template (Broken.vue)', () => {
    it('reports one Pug parsing error, leaves the template alone and still fixes the script', async () => {
      const brokenConfig = [...config, { files: vueFiles, rules: { 'no-var': 'error' as const } }]
      const { messages, output } = await lintText(v, Broken, brokenConfig, { fix: true, filename: 'Broken.vue' })
      const parsing = byRule(messages, 'vue/no-parsing-error')
      expect(parsing).toHaveLength(1)
      expect(parsing[0]!.message.startsWith('Parsing error: Pug:')).toBe(true)
      const body = (s: string): string => s.slice(s.indexOf('<template'), s.indexOf('</template>'))
      expect(body(output)).toBe(body(Broken))
      expect(output).toMatch(/\b(let|const) a = 1/)
      expect(output).not.toContain('var a')
    })
  })

  describe('pass-through', () => {
    it.each(['Html.vue', 'NoTemplate.vue'])('%s: same as plain eslint-plugin-vue', async (name) => {
      const code = fixture(name)
      const ours = await lintText(v, code, config, { filename: name })
      const plain = await lintText(v, code, plainVue, { filename: name })
      expect(summary(ours.messages)).toEqual(summary(plain.messages))
      const oursFixed = await lintText(v, code, config, { fix: true, filename: name })
      const plainFixed = await lintText(v, code, plainVue, { fix: true, filename: name })
      expect(oursFixed.output).toBe(plainFixed.output)
    })

    // Plain eslint-plugin-vue skips a Pug template entirely; with the tokenizer an empty Pug template
    // is an empty template, so it gets exactly what an empty HTML template gets (vue/valid-template-root).
    it('EmptyPug.vue: same as plain eslint-plugin-vue on the empty HTML template', async () => {
      const code = fixture('EmptyPug.vue')
      const htmlTwin = code.replace(' lang="pug"', '')
      expect(htmlTwin).not.toBe(code)
      const ours = await lintText(v, code, config, { filename: 'EmptyPug.vue' })
      const plain = await lintText(v, htmlTwin, plainVue, { filename: 'EmptyPug.vue' })
      expect(summary(ours.messages)).toEqual(summary(plain.messages))
      const oursFixed = await lintText(v, code, config, { fix: true, filename: 'EmptyPug.vue' })
      const plainFixed = await lintText(v, htmlTwin, plainVue, { fix: true, filename: 'EmptyPug.vue' })
      expect(oursFixed.output.replace(' lang="pug"', '')).toBe(plainFixed.output)
    })
  })

  it('guard is live: structure-breaking vue fixes are dropped, their messages kept', async () => {
    const kept = ['vue/singleline-html-element-content-newline', 'vue/first-attribute-linebreak']
    const onDrop = vi.fn<(m: Linter.LintMessage, reason: DropReason) => void>()
    const guarded: Linter.Config[] = [
      ...vueRecommended,
      { ...plugin.configs.base[0]!, processor: createProcessor({ keepVueRules: kept, onDrop }) },
      { files: vueFiles, rules: Object.fromEntries(kept.map((id) => [id, 'error'])) },
    ]
    // On Basic.vue neither rule's applied fix breaks Pug (singleline-…-newline only inserts blank
    // lines; its other fix has an inverted range ESLint never applies), so GuardLive.vue is used:
    // first-attribute-linebreak replaces `(` with a line break there.
    const { messages, output } = await lintText(v, GuardLive, guarded, { fix: true, filename: 'GuardLive.vue' })
    const reasons = onDrop.mock.calls.map(([, reason]) => reason)
    expect(reasons.filter((r) => r === 'structure' || r === 'parse-error').length).toBeGreaterThan(0)
    expect(byRule(messages, 'vue/first-attribute-linebreak').map((m) => m.line)).toEqual([pos(GuardLive, 'href=').line])
    expect(output).toBe(GuardLive)
    expect(templateFingerprint(output)).toBe(templateFingerprint(GuardLive))
  })
})
