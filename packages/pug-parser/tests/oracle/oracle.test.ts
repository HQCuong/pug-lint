// Differential oracle: our parser against official `pug-lexer` + `pug-parser`
// on Pug's own test cases (tests/fixtures/pug-cases, vendored from pugjs/pug,
// MIT) and on hand-written Vue-flavoured templates (tests/fixtures/vue-style).
import { readdirSync, readFileSync } from 'node:fs'
import { isDeepStrictEqual } from 'node:util'
import { describe, expect, it } from 'vitest'
import { parsePug } from '../../src/index.ts'
import { knownDifferences } from './known-differences.ts'
import { dedent, officialSkeleton, ourSkeleton, type Skel } from './skeleton.ts'

const MAX_KNOWN_DIFFERENCES = 15
const MIN_VUE_STYLE = 20

interface Fixture { dir: 'pug-cases' | 'vue-style'; name: string; src: string }

function load(dir: Fixture['dir']): Fixture[] {
  const url = new URL(`../fixtures/${dir}/`, import.meta.url)
  return readdirSync(url).filter((f) => f.endsWith('.pug')).sort()
    // Offsets are into the BOM-stripped text, as ESLint gives it to rules.
    .map((name) => ({ dir, name, src: readFileSync(new URL(name, url), 'utf8').replace(/^﻿/, '') }))
}

const pugCases = load('pug-cases')
const vueStyle = load('vue-style')

/** Positions are compared for tags, mixin calls and attributes only. */
function comparable(nodes: Skel[]): Skel[] {
  return nodes.map((n) => {
    const positioned = n.kind === 'Tag' || n.kind === 'MixinCall'
    return {
      kind: n.kind,
      ...(n.name === undefined ? {} : { name: n.name }),
      line: positioned ? n.line : 0,
      column: positioned ? n.column : 0,
      ...(n.attrs ? { attrs: n.attrs } : {}),
      children: comparable(n.children),
    }
  })
}

/** `nodes` with every column moved right by `width` (undoing a de-indent). */
function shift(nodes: Skel[], width: number): Skel[] {
  return nodes.map((n) => ({
    ...n,
    column: n.column + width,
    ...(n.attrs ? { attrs: n.attrs.map((a) => ({ ...a, column: a.column + width })) } : {}),
    children: shift(n.children, width),
  }))
}

/** Both sides for one fixture: a Vue-style one with an indented first line is de-indented for Pug (ruling C-6). */
function run({ dir, src }: Fixture): { officialOk: boolean; oursOk: boolean; official: Skel[]; ours: Skel[] } {
  const { text, width } = dir === 'vue-style' && /^[ \t]/.test(src) ? dedent(src) : { text: src, width: 0 }
  const official = officialSkeleton(text)
  const doc = parsePug(src)
  return {
    officialOk: official.ok,
    oursOk: doc.errors.length === 0,
    official: official.ok ? comparable(shift(official.nodes, width)) : [],
    ours: comparable(ourSkeleton(doc)),
  }
}

describe('differential oracle against pug-lexer + pug-parser', () => {
  it('has the vendored corpus and the Vue-style fixtures', () => {
    expect(pugCases.length).toBeGreaterThan(100)
    expect(vueStyle.length).toBeGreaterThanOrEqual(MIN_VUE_STYLE)
  })

  for (const fixture of [...pugCases, ...vueStyle]) {
    if (fixture.dir === 'pug-cases' && fixture.name in knownDifferences) continue
    it(`${fixture.dir}/${fixture.name}: same accept/reject and skeleton as Pug`, () => {
      const result = run(fixture)
      expect(result.oursOk).toBe(result.officialOk)
      if (result.officialOk) expect(result.ours).toEqual(result.official)
    })
  }

  it(`lists at most ${MAX_KNOWN_DIFFERENCES} known differences, each a pug-cases fixture that still differs`, () => {
    const names = Object.keys(knownDifferences)
    expect(names.length).toBeLessThanOrEqual(MAX_KNOWN_DIFFERENCES)
    for (const name of names) {
      const fixture = pugCases.find((f) => f.name === name)
      expect(fixture, `${name} is not a pug-cases fixture`).toBeDefined()
      const result = run(fixture!)
      const differs = result.oursOk !== result.officialOk || (result.officialOk && !isDeepStrictEqual(result.ours, result.official))
      expect(differs, `${name} no longer differs: remove it from knownDifferences`).toBe(true)
    }
  })
})
