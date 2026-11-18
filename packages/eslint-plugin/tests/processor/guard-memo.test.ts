// The guard verifies identical fixes once (vue-pug/indent puts one fix on every message it reports).
// A separate file: the applyFixes spy (vi.mock) applies to the whole file.
import type { Linter } from 'eslint'
import { describe, expect, it, vi } from 'vitest'
import { applyFixes } from '../../src/processor/apply-fixes.ts'
import { guardMessages } from '../../src/processor/guard.ts'
import { at, vue } from '../helpers/vue.ts'

vi.mock('../../src/processor/apply-fixes.ts', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/processor/apply-fixes.ts')>()
  return { applyFixes: vi.fn(original.applyFixes) }
})

const message = (fix: Linter.LintMessage['fix'], line: number): Linter.LintMessage =>
  ({ ruleId: 'x/y', message: 'm', severity: 1, line, column: 1, ...(fix && { fix }) })

describe('guardMessages memoizes single-fix verdicts', () => {
  it('verifies N identical fixes once (plus the merged check)', () => {
    const text = vue('div\n    p\n    a')
    const [start] = at(text, '    p')
    const [, end] = at(text, '    a')
    const fix = { range: [start, end] as [number, number], text: '  p\n  a' }
    const messages = [3, 4, 3, 4, 3].map((line) => message({ ...fix, range: [...fix.range] }, line))
    vi.mocked(applyFixes).mockClear()
    const drops: string[] = []
    const result = guardMessages(text, messages, (_, reason) => drops.push(reason))
    expect(drops).toEqual([])
    expect(result.every((m) => m.fix)).toBe(true)
    // One verification of the shared fix alone, one of the survivors merged (step 6).
    expect(vi.mocked(applyFixes)).toHaveBeenCalledTimes(2)
  })

  it('still reports every message whose shared fix is dropped', () => {
    const text = vue('div\n  p\n  a')
    const [start, end] = at(text, '  a')
    const messages = [1, 2, 3].map((line) => message({ range: [start, end], text: '    a' }, line))
    const drops: string[] = []
    const result = guardMessages(text, messages, (_, reason) => drops.push(reason))
    expect(drops).toEqual(['structure', 'structure', 'structure'])
    expect(result.some((m) => m.fix)).toBe(false)
  })
})
