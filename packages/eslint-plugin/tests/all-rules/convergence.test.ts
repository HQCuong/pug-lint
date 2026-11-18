// Convergence gate: for every format fixture, fixing whitespace noise added to the fixed output must
// give the fixed output back, under both ESLint majors and the recommended config. A failure is a
// rule-ownership or non-canonical-output bug in a rule.
import { readdirSync, readFileSync } from 'node:fs'
import { basename } from 'node:path'
import type { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import plugin from '../../src/index.ts'
import { findPugTemplateRanges, templateFingerprint } from '../../src/shared/templates.ts'
import type { EslintVersion } from '../helpers/eslint-versions.ts'
import { eslintVersions } from '../helpers/eslint-versions.ts'
import { lintText } from '../helpers/lint.ts'
import { scaled } from '../helpers/time-scale.ts'
import { vue } from '../helpers/vue.ts'
import { allRulesConfig } from './config.ts'
import type { MutationKind } from './mutate.ts'
import { mutateWhitespace } from './mutate.ts'

const dir = new URL('../fixtures/format/', import.meta.url)
const snapshot = (name: string): string =>
  readFileSync(new URL(`__snapshots__/${name}.fixed.vue`, import.meta.url), 'utf8')
const fixtures = readdirSync(dir)
  .filter((f) => f.endsWith('.vue'))
  .sort()
  .map((f) => ({ name: basename(f, '.vue'), text: readFileSync(new URL(f, dir), 'utf8') }))

// The guard re-parses the whole template once per distinct fix, so fixing noise over n lines costs
// about n² (measured: ~0.2 s for 400 lines, ~1 s for 800, ~12 s for 3000). Two copies (~400 lines)
// keep this check far from the budget; larger inputs are an open guard performance issue.
const SYNTHETIC_COPIES = 2
/** The fixed template bodies of every format fixture (LF, from their reviewed snapshots), concatenated `SYNTHETIC_COPIES` times. */
function syntheticCanonical(): string {
  const bodies = fixtures.map(({ name }) => {
    const text = snapshot(name).replace(/\r\n/g, '\n')
    const [range] = findPugTemplateRanges(text)
    return text.slice(...range!).replace(/^\n+|\n+$/g, '')
  })
  return vue(Array.from({ length: SYNTHETIC_COPIES }, () => bodies.join('\n')).join('\n'))
}

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1)
const TIME_BUDGET_MS = scaled(2000)

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

/** The text before and after the Pug template's content. */
function outsideTemplate(text: string): [string, string] {
  const [range] = findPugTemplateRanges(text)
  return [text.slice(0, range![0]), text.slice(range![1])]
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
  it('applies every mutation kind for some seed', () => {
    const kinds = new Set<MutationKind>()
    const outputs = SEEDS.map((seed) => mutateWhitespace(text, seed, kinds))
    const all: MutationKind[] = [
      'comma-added', 'comma-removed', 'attribute-spacing', 'paren-spacing', 'equals-spacing',
      'quote-swap', 'div-added', 'div-removed', 'reindent', 'anchored-shift',
    ]
    expect([...kinds].sort()).toEqual(all.sort())
    // And the effects are visible in the text.
    const some = (re: RegExp): boolean => outputs.some((out) => re.test(out))
    expect(some(/x\s*=\s*"1"\s*,\s*y/)).toBe(true)
    expect(some(/x\s*=\s*"1"\s+y/)).toBe(true)
    expect(some(/\( +x/)).toBe(true)
    expect(some(/x = /)).toBe(true)
    expect(some(/x\s*=\s*'1'/)).toBe(true)
    expect(some(/y\s*=\s*"2"/)).toBe(true)
    expect(some(/^\.a$/m)).toBe(true)
    expect(some(/^ +div\.b/m)).toBe(true)
    expect(some(/^ {4}p\.\n {8}one\n {10}two$/m)).toBe(true)
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
      expect(outsideTemplate(fixed)).toEqual(outsideTemplate(text))
      // Not vacuous: a non-canonical template was rewritten.
      if (text !== snapshot(name)) expect(fixed).not.toBe(text)
    })
  })

  it(`fixes a large synthetic template (every format fixture, ${SYNTHETIC_COPIES}×, mutated) in under ${TIME_BUDGET_MS} ms`, async () => {
    const canonical = syntheticCanonical()
    expect(canonical.split('\n').length).toBeGreaterThan(400)
    // The first seed whose noise includes a re-indent: every line then needs fixing.
    let mutated = canonical
    for (let seed = 1; seed <= SEEDS.length && mutated === canonical; seed++) {
      const kinds = new Set<MutationKind>()
      const out = mutateWhitespace(canonical, seed, kinds)
      if (kinds.has('reindent')) mutated = out
    }
    expect(mutated).not.toBe(canonical)
    const start = performance.now()
    const output = await fix(v, 'Synthetic', mutated)
    expect(performance.now() - start).toBeLessThan(TIME_BUDGET_MS)
    expect(output).toBe(canonical)
  })
})
