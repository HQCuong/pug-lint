import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { fingerprint, parsePug } from '../src/index.ts'
import { assertInvariants, toCRLF } from './helpers.ts'
import { scaled } from './time-scale.ts'

const SEED = 20261118
const MUTATIONS_PER_FIXTURE = 300
const MUTATION_BUDGET_MS = scaled(200)
const LINEAR_LINES = 5000
const LINEAR_BUDGET_MS = scaled(500)

const dir = new URL('./fixtures/syntax/', import.meta.url)
const fixtures = readdirSync(dir)
  .filter((f) => f.endsWith('.pug'))
  .sort()
  .map((name) => ({ name, src: readFileSync(new URL(name, dir), 'utf8') }))

/** mulberry32: a small deterministic PRNG returning floats in [0, 1). */
function prng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** One random edit: delete a char, duplicate a char, or truncate at an offset. */
function mutate(src: string, rand: () => number): string {
  const op = Math.floor(rand() * 3)
  if (op === 2 || src.length === 0) return src.slice(0, Math.floor(rand() * (src.length + 1)))
  const i = Math.floor(rand() * src.length)
  return op === 0 ? src.slice(0, i) + src.slice(i + 1) : src.slice(0, i + 1) + src.slice(i)
}

describe('robustness: syntax fixtures', () => {
  it('has fixtures', () => {
    expect(fixtures.length).toBeGreaterThan(0)
  })

  for (const { name, src } of fixtures) {
    it(`${name}: keeps invariants and parses its CRLF mirror the same way`, () => {
      const lf = parsePug(src)
      assertInvariants(lf)
      const crlf = parsePug(toCRLF(src))
      assertInvariants(crlf)
      expect(fingerprint(crlf)).toBe(fingerprint(lf))
      expect(crlf.errors.length).toBe(lf.errors.length)
    })

    it(`${name}: survives ${MUTATIONS_PER_FIXTURE} seeded mutations`, () => {
      const rand = prng(SEED)
      for (let n = 0; n < MUTATIONS_PER_FIXTURE; n++) {
        const input = mutate(src, rand)
        const where = `mutation ${n} of ${name}: ${JSON.stringify(input)}`
        const t0 = performance.now()
        let doc
        try {
          doc = parsePug(input)
        } catch (err) {
          throw new Error(`parsePug threw on ${where}: ${String(err)}`)
        }
        const ms = performance.now() - t0
        if (ms >= MUTATION_BUDGET_MS) throw new Error(`parsePug took ${ms.toFixed(1)} ms on ${where}`)
        try {
          assertInvariants(doc)
        } catch (err) {
          throw new Error(`${String(err)} on ${where}`)
        }
      }
    })
  }
})

describe('robustness: linearity', () => {
  it(`parses a ${LINEAR_LINES}-line nested template in under ${LINEAR_BUDGET_MS} ms`, () => {
    const src = Array.from({ length: LINEAR_LINES }, (_, i) => `${'  '.repeat(i % 5)}.a(b="c") d`).join('\n')
    const t0 = performance.now()
    const doc = parsePug(src)
    const ms = performance.now() - t0
    assertInvariants(doc)
    expect(doc.errors).toEqual([])
    expect(doc.lines).toHaveLength(LINEAR_LINES)
    expect(ms).toBeLessThan(LINEAR_BUDGET_MS)
  })

  // Long runs of one character used to make two regexes quadratic (CodeQL js/polynomial-redos).
  it.each([
    ['blanks in code (fingerprint)', `- x = ${'\t'.repeat(100_000)}y\n`],
    ['blanks before a line break in code (fingerprint)', `- x = 1${' \t'.repeat(50_000)}\n  + 2\n`],
    ['dashes in an attribute block', `p(${'-'.repeat(100_000)})\n`],
  ])('stays linear on %s', (_, src) => {
    const t0 = performance.now()
    fingerprint(parsePug(src))
    expect(performance.now() - t0).toBeLessThan(LINEAR_BUDGET_MS)
  })
})
