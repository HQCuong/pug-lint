import type { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import { createProcessor } from '../../src/processor/index.ts'
import type { DropReason } from '../../src/processor/guard.ts'
import { at, vue } from '../helpers/vue.ts'

/** A stand-in for eslint-plugin-vue's processor: one block, messages passed through. */
function fakeInner() {
  const seen: string[] = []
  const inner: Linter.Processor = {
    preprocess: (text: string) => {
      seen.push(text)
      return [text]
    },
    postprocess: (messages: Linter.LintMessage[][]) => messages[0]!,
  }
  return { inner, seen }
}

/** 1-based line and column of `offset` (LF text). */
function position(text: string, offset: number): { line: number; column: number } {
  const before = text.slice(0, offset)
  return { line: before.split('\n').length, column: offset - (before.lastIndexOf('\n') + 1) + 1 }
}

/** A message at the first `needle` of `text`, whose fix replaces it by `replacement`. */
function fixMsg(text: string, needle: string, replacement: string, ruleId = 'x/y'): Linter.LintMessage {
  const range = at(text, needle)
  return { ruleId, message: 'm', severity: 1, ...position(text, range[0]), fix: { range, text: replacement } }
}

// Line 1: <template lang="pug">   line 2: a(x,y)   line 3: </template>   lines 4–6: <script>
const code = vue('a(x,y)', '<script>\nfoo\n</script>\n')
const safe = fixMsg(code, ',', ' ')
const breaking = fixMsg(code, ')', '')

describe('createProcessor', () => {
  it('strips a breaking fix and keeps a safe one', () => {
    const { inner } = fakeInner()
    const processor = createProcessor({ inner })
    processor.preprocess!(code, 'A.vue')
    const [kept, dropped] = processor.postprocess!([[safe, breaking]], 'A.vue')
    expect(kept!.fix).toEqual(safe.fix)
    expect(dropped).toEqual({ ...breaking, fix: undefined } satisfies Linter.LintMessage)
    expect(dropped).not.toHaveProperty('fix')
  })

  it('passes the unstripped text to inner and guards fixes against the BOM-stripped text', () => {
    const { inner, seen } = fakeInner()
    const processor = createProcessor({ inner })
    const raw = '﻿' + code
    expect(processor.preprocess!(raw, 'A.vue')).toEqual([raw])
    expect(seen).toEqual([raw])
    const [kept, dropped] = processor.postprocess!([[safe, breaking]], 'A.vue')
    expect(kept!.fix).toEqual(safe.fix)
    expect(dropped).not.toHaveProperty('fix')
  })

  it('forgets the text after postprocess and never fails open on a second postprocess', () => {
    const { inner } = fakeInner()
    const processor = createProcessor({ inner })
    processor.preprocess!(code, 'A.vue')
    processor.postprocess!([[safe]], 'A.vue')
    const scriptFix = fixMsg(code, 'foo', 'bar')
    const withSuggestions: Linter.LintMessage = {
      ...safe,
      suggestions: [{ desc: 's', fix: { range: at(code, 'x'), text: 'z' } }],
    }
    const result = processor.postprocess!([[safe, scriptFix, withSuggestions]], 'A.vue')
    expect(result).toHaveLength(3)
    for (const m of result) {
      expect(m).not.toHaveProperty('fix')
      expect(m).not.toHaveProperty('suggestions')
    }
    expect(result[1]!.message).toBe(scriptFix.message)
  })

  it('guards interleaved files each against their own text', () => {
    const textA = vue('div(class="a")')
    const textB = vue('spa(class="b")')
    // Safe on A (class attribute to shorthand), structure-changing on B (tag renamed).
    const fix = fixMsg(textA, 'div(class="a")', 'div.a')
    const { inner } = fakeInner()
    const processor = createProcessor({ inner })
    processor.preprocess!(textA, 'A.vue')
    processor.preprocess!(textB, 'B.vue')
    expect(processor.postprocess!([[fix]], 'A.vue')[0]!.fix).toEqual(fix.fix)
    expect(processor.postprocess!([[fix]], 'B.vue')[0]).not.toHaveProperty('fix')
  })

  it('reports each dropped fix to onDrop', () => {
    const drops: [Linter.LintMessage, DropReason][] = []
    const { inner } = fakeInner()
    const processor = createProcessor({ inner, onDrop: (m, reason) => drops.push([m, reason]) })
    processor.preprocess!(code, 'A.vue')
    processor.postprocess!([[safe, breaking]], 'A.vue')
    expect(drops).toEqual([[breaking, 'parse-error']])
  })

  it('names itself after keepVueRules and supports autofix', () => {
    expect(createProcessor().meta).toMatchObject({ name: 'vue-pug/vue', version: expect.any(String) })
    expect(createProcessor({ keepVueRules: ['vue/b', 'vue/a'] }).meta!.name).toBe('vue-pug/vue+vue/a,vue/b')
    expect(createProcessor().supportsAutofix).toBe(true)
  })

  it('suppresses incompatible vue rules inside the template unless kept', () => {
    const indent: Linter.LintMessage = { ruleId: 'vue/html-indent', message: 'm', severity: 1, line: 2, column: 1 }
    const run = (keepVueRules: string[]) => {
      const { inner } = fakeInner()
      const processor = createProcessor({ inner, keepVueRules })
      processor.preprocess!(code, 'A.vue')
      return processor.postprocess!([[indent]], 'A.vue')
    }
    expect(run([])).toEqual([])
    expect(run(['vue/html-indent'])).toEqual([indent])
  })

  it('wraps eslint-plugin-vue\'s processor by default', () => {
    const processor = createProcessor()
    expect(processor.preprocess!(code, 'A.vue')).toEqual([code])
    expect(processor.postprocess!([[safe]], 'A.vue')).toEqual([safe])
  })
})
