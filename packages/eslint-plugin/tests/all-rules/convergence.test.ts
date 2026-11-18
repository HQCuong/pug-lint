// Convergence gate: for every format fixture, fixing whitespace noise added to the fixed output must
// give the fixed output back, under both ESLint majors and the recommended config. A failure is a
// rule-ownership or non-canonical-output bug in a rule.
import { readdirSync, readFileSync } from 'node:fs'
import { basename } from 'node:path'
import type { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import plugin from '../../src/index.ts'
import { templateFingerprint } from '../../src/shared/templates.ts'
import type { EslintVersion } from '../helpers/eslint-versions.ts'
import { eslintVersions } from '../helpers/eslint-versions.ts'
import { lintText } from '../helpers/lint.ts'
import { vue } from '../helpers/vue.ts'
import { allRulesConfig } from './config.ts'
import { mutateWhitespace } from './mutate.ts'

const dir = new URL('../fixtures/format/', import.meta.url)
const fixtures = readdirSync(dir)
  .filter((f) => f.endsWith('.vue'))
  .sort()
  .map((f) => ({ name: basename(f, '.vue'), text: readFileSync(new URL(f, dir), 'utf8') }))
const largest = fixtures.reduce((a, b) => (b.text.length > a.text.length ? b : a))

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1)
const TIME_BUDGET_MS = 2000

const ours = (ruleId: string | null): boolean => ruleId?.startsWith('vue-pug/') ?? false

/** Fixes `text` with `config`; fails on a guard drop of a `vue-pug/*` fix. */
async function fix(v: EslintVersion, name: string, text: string, config?: Linter.Config[]): Promise<string> {
  const drops: string[] = []
  const used = config ?? allRulesConfig((m, reason) => {
    if (ours(m.ruleId)) drops.push(`${m.ruleId}@${m.line}: ${reason}`)
  })
  const { output } = await lintText(v, text, used, { fix: true, filename: `${name}.vue` })
  expect(drops).toEqual([])
  return output
}

/** `<script>` and `<style>` blocks, start tag to end tag. */
const nonTemplateBlocks = (text: string): string[] =>
  [...text.matchAll(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/g)].map((m) => m[0])

describe('mutateWhitespace', () => {
  const text = vue([
    'div.a',
    '  .b(x="1" , y=\'2\')',
    '  p.',
    '    one',
    '      two',
    '  a(',
    '    x',
    '    :c=`{',
    ' a }`',
    '  )',
  ].join('\n'))

  it('is deterministic per seed and keeps the fingerprint', () => {
    for (const seed of SEEDS) {
      const out = mutateWhitespace(text, seed)
      expect(mutateWhitespace(text, seed)).toBe(out)
      expect(templateFingerprint(out)).toBe(templateFingerprint(text))
    }
    const outputs = new Set(SEEDS.map((seed) => mutateWhitespace(text, seed)))
    expect(outputs.size).toBeGreaterThan(10)
  })

  it('re-indents with the indent model: raw and in-string offsets are kept relative to their anchor', () => {
    const reindented = SEEDS.map((seed) => mutateWhitespace(text, seed).split('\n'))
      .filter((lines) => lines.some((l) => l.startsWith('   p.') || l.startsWith('    p.')))
    expect(reindented.length).toBeGreaterThan(0)
    for (const lines of reindented) {
      const p = lines.find((l) => /^ +p\.$/.test(l))!.match(/^ */)![0].length
      const one = lines.find((l) => l.trim() === 'one')!.match(/^ */)![0].length
      const two = lines.find((l) => l.trim() === 'two')!.match(/^ */)![0].length
      expect(one).toBe(2 * p)
      expect(two - one).toBe(2)
      // Inside the template literal: whitespace is the value, never moved.
      expect(lines).toContain(' a }`')
    }
  })

  it('never swaps quotes around a body with a quote, backslash or line break', () => {
    const quoted = vue('p(title="it\'s" alt="a\\\\b" :x=`a\nb`) x')
    for (const seed of SEEDS) {
      const out = mutateWhitespace(quoted, seed)
      expect(out).toMatch(/title\s*=\s*"it's"/)
      expect(out).toMatch(/alt\s*=\s*"a\\\\b"/)
      expect(out).toContain('`a\nb`')
    }
  })
})

describe.each(eslintVersions)('convergence ($label)', (v) => {
  describe.each(fixtures)('$name', ({ name, text }) => {
    it('fixes every whitespace mutation of its fixed output back to it', async () => {
      const fixed = await fix(v, name, text)
      let changed = 0
      for (const seed of SEEDS) {
        const mutated = mutateWhitespace(fixed, seed)
        if (mutated !== fixed) changed++
        expect({ seed, output: await fix(v, name, mutated) }).toEqual({ seed, output: fixed })
      }
      // The noise must reach the template, or the gate checks nothing.
      if (templateFingerprint(fixed) !== '') expect(changed).toBeGreaterThanOrEqual(SEEDS.length / 2)
    })

    it('keeps <script> and <style> byte-identical with only template rules enabled', async () => {
      const blocks = nonTemplateBlocks(text)
      expect(blocks.length).toBeGreaterThan(0)
      const fixed = await fix(v, name, text, plugin.configs.recommended)
      expect(nonTemplateBlocks(fixed)).toEqual(blocks)
    })
  })

  it(`fixes the largest format fixture (${largest.name}) in under ${TIME_BUDGET_MS} ms`, async () => {
    const start = performance.now()
    await fix(v, largest.name, largest.text)
    expect(performance.now() - start).toBeLessThan(TIME_BUDGET_MS)
  })
})
