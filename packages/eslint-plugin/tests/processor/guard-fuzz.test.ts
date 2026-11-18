// Guard fuzz: seeded random single edits (insert, delete or replace a few characters with Pug-ish
// snippets) on every corpus, format and Vue-style template. Whenever the guard keeps an edit (it
// parses and keeps the fingerprint), the real Pug must compile the result, as Vue hands it over:
// the property behind "no autofix can ever break a Pug template". Deterministic; a failure names
// the template, the seed and the edit.
import { readdirSync, readFileSync } from 'node:fs'
import type { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import { guardMessages } from '../../src/processor/guard.ts'
import { findPugTemplateRanges } from '../../src/shared/templates.ts'
import { pugError } from '../helpers/pug-oracle.ts'
import { scaled } from '../helpers/time-scale.ts'
import { vue } from '../helpers/vue.ts'

const SEEDS = [1, 2, 3]
const EDITS_PER_SEED = 100

const SNIPPETS = [
  '"', "'", '`', '(', ')', '[', ']', '{', '}', ',', '.', '#', ':', '|', '=', '!', '/', '\\', ' ', '  ', '\t',
  '\n', '\n  ', '\n\t', '\n\n', '\r\n', '-', '+', '&', '<', '>', 'a', '${', '#{', '#[', '//', '//-', '{{', '}}',
  '&attributes(', '.\n', ': ', '= ', '-\n', '| ', 'if ', 'each x in y', '+m(', 'div/',
]

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

const readDir = (url: URL, ext: string): { name: string; text: string }[] =>
  readdirSync(url).filter((f) => f.endsWith(ext)).sort()
    .map((f) => ({ name: f, text: readFileSync(new URL(f, url), 'utf8').replace(/^﻿/, '') }))

const vueStyle = new URL('../../../pug-parser/tests/fixtures/vue-style/', import.meta.url)
const templates = [
  ...readDir(new URL('../fixtures/corpus/', import.meta.url), '.vue'),
  ...readDir(new URL('../fixtures/format/', import.meta.url), '.vue'),
  ...readDir(vueStyle, '.pug').map(({ name, text }) => ({ name, text: vue(text) })),
].flatMap(({ name, text }) => {
  const [range] = findPugTemplateRanges(text)
  // Templates Pug itself rejects (Broken.vue) have nothing to keep intact.
  return range && pugError(text.slice(...range)) === null ? [{ name, text, range }] : []
})

describe('guard fuzz: every edit the guard keeps compiles with the real Pug', () => {
  it('has the templates', () => {
    expect(templates.length).toBeGreaterThan(40)
  })

  it.each(templates)('$name', ({ text, range: [start, end] }) => {
    const broken: string[] = []
    let kept = 0
    for (const seed of SEEDS) {
      const rand = prng(seed)
      for (let n = 0; n < EDITS_PER_SEED; n++) {
        const a = start + Math.floor(rand() * (end - start))
        const mode = rand()
        const b = mode < 0.4 ? a : Math.min(a + 1 + Math.floor(rand() * 3), end)
        const insert = mode > 0.7 ? '' : SNIPPETS[Math.floor(rand() * SNIPPETS.length)]!
        if (a === b && insert === '') continue
        const message: Linter.LintMessage = { ruleId: 'x/y', message: 'm', severity: 1, line: 1, column: 1, fix: { range: [a, b], text: insert } }
        if (!guardMessages(text, [message])[0]!.fix) continue
        kept++
        const error = pugError(text.slice(start, a) + insert + text.slice(b, end))
        if (error !== null) {
          broken.push(`seed ${seed} #${n}: ${JSON.stringify(text.slice(Math.max(start, a - 20), a))} [${JSON.stringify(text.slice(a, b))} -> ${JSON.stringify(insert)}] ${JSON.stringify(text.slice(b, b + 20))}: ${error}`)
        }
      }
    }
    expect(broken).toEqual([])
    // Not vacuous: the guard keeps some of the edits.
    expect(kept).toBeGreaterThan(0)
  }, scaled(20000))
})
