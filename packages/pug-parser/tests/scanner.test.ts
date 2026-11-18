import { describe, expect, it } from 'vitest'
import type { PugDocument, PugLine, Tag, Text } from '../src/ast.ts'
import { scanLines } from '../src/scanner.ts'
import { assertInvariants, at, toCRLF } from './helpers.ts'

const slice = (text: string, [s, e]: readonly [number, number]): string => text.slice(s, e)

describe('scanLines', () => {
  it('splits lines with mixed EOLs and records indent ranges', () => {
    const text = 'a\n  b\r\n\tc'
    const lines = scanLines(text, 0, text.length)
    expect(lines).toHaveLength(3)
    expect(lines.map((l) => slice(text, l.range))).toEqual(['a', '  b', '\tc'])
    expect(lines.map((l) => slice(text, l.indent))).toEqual(['', '  ', '\t'])
    expect(lines.map((l) => l.eol)).toEqual(['\n', '\r\n', ''])
    expect(lines.map((l) => l.blank)).toEqual([false, false, false])
  })

  it('treats a lone \\r as an EOL', () => {
    const text = 'a\rb'
    const lines = scanLines(text, 0, text.length)
    expect(lines.map((l) => slice(text, l.range))).toEqual(['a', 'b'])
    expect(lines.map((l) => l.eol)).toEqual(['\r', ''])
  })

  it('marks whitespace-only and empty lines as blank', () => {
    const text = 'a\n  \t\n\nb'
    const lines = scanLines(text, 0, text.length)
    expect(lines.map((l) => l.blank)).toEqual([false, true, true, false])
    expect(slice(text, lines[1]!.indent)).toBe('  \t')
  })

  it('yields a final empty line after a trailing EOL, and one empty line for empty input', () => {
    const text = 'a\n'
    const lines = scanLines(text, 0, text.length)
    expect(lines.map((l) => l.range)).toEqual([at(text, 'a'), [2, 2]])
    expect(lines[1]!.blank).toBe(true)
    expect(scanLines('', 0, 0)).toEqual([{ range: [0, 0], indent: [0, 0], eol: '', blank: true }])
  })

  it('stays inside [start, end] of a larger string', () => {
    const text = '<template lang="pug">\r\n  div\r\n    p hi\r\n</template>'
    const start = at(text, '>')[1]
    const end = at(text, '</template>')[0]
    const lines = scanLines(text, start, end)
    for (const l of lines) {
      for (const r of [l.range, l.indent]) {
        expect(r[0]).toBeGreaterThanOrEqual(start)
        expect(r[1]).toBeLessThanOrEqual(end)
        expect(r[0]).toBeLessThanOrEqual(r[1])
      }
    }
    expect(lines.map((l) => slice(text, l.range))).toEqual(['', '  div', '    p hi', ''])
    expect(lines.map((l) => l.eol)).toEqual(['\r\n', '\r\n', '\r\n', ''])
    expect(lines[0]!.range[0]).toBe(start)
    expect(lines.at(-1)!.range[1]).toBe(end)
  })

  it('does not consume a \\r\\n pair that is split by end', () => {
    const text = 'a\r\nb'
    const lines = scanLines(text, 0, 2)
    expect(lines.map((l) => l.eol)).toEqual(['\r', ''])
    expect(lines.at(-1)!.range).toEqual([2, 2])
  })
})

describe('test helpers', () => {
  it('at() finds the nth occurrence and throws when missing', () => {
    expect(at('abcab', 'ab')).toEqual([0, 2])
    expect(at('abcab', 'ab', 1)).toEqual([3, 5])
    expect(() => at('abc', 'x')).toThrow(/x/)
  })

  it('toCRLF() normalizes every EOL to \\r\\n', () => {
    expect(toCRLF('a\nb\r\nc\rd')).toBe('a\r\nb\r\nc\r\nd')
  })
})

describe('assertInvariants', () => {
  const text = 'div\n  p hi'
  const lineTable = (): PugLine[] =>
    scanLines(text, 0, text.length).map((l) => ({
      range: l.range, indent: l.indent, kind: 'node', depth: 0, anchor: null,
    }))
  const tag = (needle: string, children: Tag['children'] = []): Tag => ({
    type: 'Tag', range: at(text, needle), name: { value: needle.split(' ')[0]!, range: at(text, needle.split(' ')[0]!) },
    shorthands: [], attributeBlocks: [], andAttributes: [], selfClose: null, dot: null, expansion: null, children,
  })
  const inlineText = (): Text => ({
    type: 'Text', form: 'inline', range: at(text, 'hi'), content: at(text, 'hi'), parts: [{ type: 'Raw', range: at(text, 'hi') }],
  })
  const makeDoc = (children: PugDocument['children'], lines = lineTable()): PugDocument => ({
    type: 'Document', text, range: [0, text.length], children, errors: [], lines, eol: '\n', indentUnit: '  ',
  })

  it('accepts a well-formed document', () => {
    expect(() => assertInvariants(makeDoc([tag('div', [tag('p hi', [inlineText()])])]))).not.toThrow()
  })

  it('rejects a node outside doc.range', () => {
    const bad = tag('div')
    bad.range = [0, text.length + 1]
    expect(() => assertInvariants(makeDoc([bad]))).toThrow(/Tag/)
  })

  it('rejects overlapping siblings', () => {
    expect(() => assertInvariants(makeDoc([tag('p hi'), tag('div')]))).toThrow(/sibling/)
  })

  it('rejects a child starting before its parent', () => {
    expect(() => assertInvariants(makeDoc([tag('p hi', [tag('div')])]))).toThrow(/parent/)
  })

  it('rejects a child that runs into its parent\'s next sibling', () => {
    const p = tag('p hi')
    const div = tag('div', [inlineText()])
    expect(() => assertInvariants(makeDoc([div, p]))).toThrow(/parent/)
  })

  it('rejects lines that do not tile doc.range', () => {
    const lines = lineTable()
    lines.pop()
    expect(() => assertInvariants(makeDoc([], lines))).toThrow(/lines/)
    const gap = lineTable()
    gap[1]!.range = [gap[1]!.range[0] + 1, gap[1]!.range[1]]
    expect(() => assertInvariants(makeDoc([], gap))).toThrow(/lines/)
  })
})
