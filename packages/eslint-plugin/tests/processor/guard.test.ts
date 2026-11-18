import type { Linter, Rule } from 'eslint'
import { describe, expect, it, vi } from 'vitest'
import { applyFixes } from '../../src/processor/apply-fixes.ts'
import { guardMessages } from '../../src/processor/guard.ts'
import type { DropReason } from '../../src/processor/guard.ts'
import { templateFingerprint } from '../../src/shared/templates.ts'
import { at, toCRLF, vue } from '../helpers/vue.ts'

const body = (pug: string, script = ''): string => vue(pug, script)

/** 1-based line and column of `offset`, counting lines the way ESLint does. */
function position(text: string, offset: number): { line: number; column: number } {
  const before = text.slice(0, offset)
  const breaks = before.match(/\r\n|[\r\n\u2028\u2029]/g) ?? []
  const lastBreak = Math.max(before.lastIndexOf('\n'), before.lastIndexOf('\r'))
  return { line: breaks.length + 1, column: offset - (lastBreak + 1) + 1 }
}

/** A message located at the first `needle`, with a fix replacing it by `replacement`. */
function fixMsg(text: string, needle: string, replacement: string, ruleId = 'x/y'): Linter.LintMessage {
  const range = at(text, needle)
  return { ruleId, message: 'm', severity: 1, ...position(text, range[0]), fix: { range, text: replacement } }
}

/** A message at `range` whose fix replaces `range` by `replacement`. */
function rangeMsg(text: string, range: Rule.Fix['range'], replacement: string): Linter.LintMessage {
  return { ruleId: 'x/y', message: 'm', severity: 1, ...position(text, range[0]), fix: { range, text: replacement } }
}

function guard(text: string, messages: Linter.LintMessage[]) {
  const drops: [Linter.LintMessage, DropReason][] = []
  const result = guardMessages(text, messages, (m, reason) => drops.push([m, reason]))
  return { result, drops, reasons: drops.map(([, r]) => r) }
}

/** Keep-cases, also run on CRLF text. */
const keptCases: [string, (eol: (s: string) => string) => { text: string; message: Linter.LintMessage }][] = [
  ['safe comma fix', (eol) => {
    const text = eol(body('a(x,y)'))
    return { text, message: fixMsg(text, ',', ' ') }
  }],
  ['class attribute to shorthand', (eol) => {
    const text = eol(body('div(class="a")'))
    return { text, message: fixMsg(text, 'div(class="a")', 'div.a') }
  }],
]

describe('guardMessages', () => {
  for (const [name, make] of keptCases) {
    for (const [label, eol] of [['LF', (s: string) => s], ['CRLF', toCRLF]] as const) {
      it(`keeps the fix: ${name} (${label})`, () => {
        const { text, message } = make(eol)
        const { result, drops } = guard(text, [message])
        expect(drops).toEqual([])
        expect(result).toHaveLength(1)
        expect(result[0]!.fix).toEqual(message.fix)
      })
    }
  }

  it('drops a parse-breaking fix and keeps the message', () => {
    const text = body('a(x="1")')
    const message = fixMsg(text, ')', '')
    const { result, drops } = guard(text, [message])
    expect(result).toHaveLength(1)
    expect(result[0]!.fix).toBeUndefined()
    expect('fix' in result[0]!).toBe(false)
    expect(result[0]!.message).toBe('m')
    expect(drops).toHaveLength(1)
    expect(drops[0]![0]).toBe(message)
    expect(drops[0]![1]).toBe('parse-error')
  })

  it.each([
    ['inline text moved to its own line', 'p Hello', ' Hello', '\nHello'],
    ['HTML-style fixer output', 'div\n  p x\n  a(x="1" y="2") t', ' t', '\nt'],
    ['attribute count change', 'a(x y)', ' y', ''],
    ['static class changed', 'div(class="a")', 'div(class="a")', 'div.b'],
  ])('drops a structure-changing fix: %s', (_name, pug, needle, replacement) => {
    const text = body(pug)
    const { result, reasons } = guard(text, [fixMsg(text, needle, replacement)])
    expect(result).toHaveLength(1)
    expect(result[0]!.fix).toBeUndefined()
    expect(reasons).toEqual(['structure'])
  })

  for (const [label, eol] of [['LF', (s: string) => s], ['CRLF', toCRLF]] as const) {
    it(`verifies surviving fixes together and drops the one that breaks the combination (${label})`, () => {
      const text = eol(body('a\n  b\n    c'))
      const fixA = fixMsg(text, '  b', '   b')
      const fixB = fixMsg(text, '    c', '   c')
      // Each fix alone keeps the structure; together b and c become siblings.
      const before = templateFingerprint(text)
      expect(templateFingerprint(applyFixes(text, [fixA.fix!]).output)).toBe(before)
      expect(templateFingerprint(applyFixes(text, [fixB.fix!]).output)).toBe(before)
      expect(templateFingerprint(applyFixes(text, [fixA.fix!, fixB.fix!]).output)).not.toBe(before)

      const { result, drops } = guard(text, [fixA, fixB])
      expect(result[0]!.fix).toEqual(fixA.fix)
      expect(result[1]!.fix).toBeUndefined()
      expect(drops).toEqual([[fixB, 'combined']])
      const survivors = result.flatMap((m) => (m.fix ? [m.fix] : []))
      expect(templateFingerprint(applyFixes(text, survivors).output)).toBe(before)
    })
  }

  it('drops every template fix on a broken template but keeps script fixes', () => {
    const text = body('a(href="x', '<script>\nfoo\n</script>\n')
    const inTemplate = fixMsg(text, 'a(', 'b(')
    const inScript = fixMsg(text, 'foo', 'bar')
    const { result, drops } = guard(text, [inTemplate, inScript])
    expect(result[0]!.fix).toBeUndefined()
    expect(result[1]!.fix).toEqual(inScript.fix)
    expect(drops).toEqual([[inTemplate, 'broken-template']])
  })

  it('drops a fix that straddles the template boundary', () => {
    const text = body('p Hello')
    const range: Rule.Fix['range'] = [at(text, 'Hello')[0], at(text, '</template>')[0] + 2]
    const { result, reasons } = guard(text, [rangeMsg(text, range, 'Bye')])
    expect(result[0]!.fix).toBeUndefined()
    expect(reasons).toEqual(['boundary'])
  })

  it('leaves fixes entirely outside the template untouched', () => {
    const text = body('p Hello', '<script>\nfoo\n</script>\n')
    const outside = fixMsg(text, 'foo', 'bar')
    const inside = fixMsg(text, ' Hello', '\nHello')
    const { result, drops } = guard(text, [outside, inside])
    expect(result[0]).toBe(outside)
    expect(drops).toEqual([[inside, 'structure']])
  })

  it('returns the input array when there is no Pug template', () => {
    const text = '<template><div/></template>\n'
    const messages = [rangeMsg(text, at(text, 'div'), 'span')]
    const result = guardMessages(text, messages)
    expect(result).toBe(messages)
    expect(result[0]!.fix).toEqual({ range: at(text, 'div'), text: 'span' })
  })

  it('returns the input array when no fix touches a template', () => {
    const text = body('p Hello', '<script>\nfoo\n</script>\n')
    const messages = [fixMsg(text, 'foo', 'bar'), { ruleId: 'x/y', message: 'n', severity: 1 as const, line: 2, column: 1 }]
    expect(guardMessages(text, messages)).toBe(messages)
  })

  it('never fails open on a cache miss', () => {
    const text = body('a(x="1")')
    const message = fixMsg(text, ')', '')
    delete (globalThis as Record<symbol, unknown>)[Symbol.for('pug-lint.templates')]
    const { result, reasons } = guard(text, [message])
    expect(result[0]!.fix).toBeUndefined()
    expect(reasons).toEqual(['parse-error'])
  })

  it('removes only the failing suggestions and keeps the message', () => {
    const text = body('a(x="1")')
    const safe: Linter.LintSuggestion = { desc: 'safe', fix: { range: at(text, 'x="1"'), text: 'y="1"' } }
    const breaking: Linter.LintSuggestion = { desc: 'breaking', fix: { range: at(text, ')'), text: '' } }
    const message: Linter.LintMessage = { ruleId: 'x/y', message: 'm', severity: 1, ...position(text, at(text, 'a(')[0]), suggestions: [safe, breaking] }
    const { result } = guard(text, [message])
    expect(result).toHaveLength(1)
    expect(result[0]!.message).toBe('m')
    expect(result[0]!.suggestions).toEqual([safe])
  })

  it('never mutates its input', () => {
    const text = body('a(x="1")\n  b\n    c')
    const messages: Linter.LintMessage[] = [
      fixMsg(text, ')', ''),
      fixMsg(text, '  b', '   b'),
      fixMsg(text, '    c', '   c'),
      {
        ruleId: 'x/y', message: 'm', severity: 1, line: 2, column: 1,
        suggestions: [{ desc: 'breaking', fix: { range: at(text, '('), text: '' } }],
      },
    ]
    const snapshot = structuredClone(messages)
    guardMessages(text, messages)
    expect(messages).toEqual(snapshot)
  })

  it('reports a dropped fix through onDrop only once per fix', () => {
    const text = body('a(x="1")')
    const onDrop = vi.fn()
    guardMessages(text, [fixMsg(text, ')', '')], onDrop)
    expect(onDrop).toHaveBeenCalledTimes(1)
  })
})
