import { Linter } from 'eslint'
import { Linter as Linter9 } from 'eslint9'
import type { Rule } from 'eslint'
import { describe, expect, it } from 'vitest'
import { applyFixes } from '../../src/processor/apply-fixes.ts'

/** Deterministic PRNG (mulberry32). */
function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const LETTERS = 'abcdefghij'

/** `/*<40 letters>*\/` and 1–6 random fixes inside the comment body (letters only, so every pass still parses). */
function randomCase(seed: number): { text: string; fixes: Rule.Fix[] } {
  const r = rng(seed)
  const int = (n: number): number => Math.floor(r() * n)
  const letters = (n: number): string => Array.from({ length: n }, () => LETTERS[int(LETTERS.length)]).join('')
  const body = letters(40)
  const text = `/*${body}*/`
  const lo = 2
  const hi = 2 + body.length
  const fixes = Array.from({ length: 1 + int(6) }, (): Rule.Fix => {
    const start = lo + int(hi - lo + 1)
    const end = Math.min(hi, start + int(6))
    return { range: [start, end], text: letters(int(4)) }
  })
  return { text, fixes }
}

/** Output of a real `Linter#verifyAndFix` whose only rule emits `fixes` on the first pass. */
function eslintOutput(LinterClass: typeof Linter, text: string, fixes: Rule.Fix[]): string {
  const rule: Rule.RuleModule = {
    meta: { type: 'layout', fixable: 'code', schema: [] },
    create(context) {
      return {
        Program(node) {
          if (context.sourceCode.text !== text) return
          for (const f of fixes) context.report({ node, message: 'm', fix: (fixer) => fixer.replaceTextRange(f.range, f.text) })
        },
      }
    },
  }
  const linter = new LinterClass()
  const config: Linter.Config[] = [{ plugins: { t: { rules: { r: rule } } }, rules: { 't/r': 'error' } }]
  return linter.verifyAndFix(text, config).output
}

describe('applyFixes', () => {
  it('sorts by range and skips overlapping fixes like ESLint', () => {
    const fixes: Rule.Fix[] = [
      { range: [4, 5], text: 'X' },
      { range: [0, 2], text: 'Y' },
      { range: [1, 3], text: 'Z' },
    ]
    const result = applyFixes('abcdef', fixes)
    expect(result.output).toBe('YcdXf')
    expect(result.applied).toHaveLength(2)
    expect(result.applied).toEqual([fixes[1], fixes[0]])
  })

  it('skips the second of two adjacent fixes', () => {
    const fixes: Rule.Fix[] = [
      { range: [0, 1], text: 'A' },
      { range: [1, 2], text: 'B' },
    ]
    const result = applyFixes('abc', fixes)
    expect(result.output).toBe('Abc')
    expect(result.applied).toEqual([fixes[0]])
  })

  it('returns the text unchanged without fixes', () => {
    expect(applyFixes('abc', [])).toEqual({ output: 'abc', applied: [] })
  })

  for (const [label, LinterClass] of [
    ['eslint9', Linter9 as unknown as typeof Linter],
    ['eslint10', Linter],
  ] as const) {
    it(`matches ${label} Linter#verifyAndFix on 30 seeded random fix sets`, () => {
      for (let seed = 1; seed <= 30; seed++) {
        const { text, fixes } = randomCase(seed)
        expect(applyFixes(text, fixes).output, `seed ${seed}`).toBe(eslintOutput(LinterClass, text, fixes))
      }
    })
  }
})
