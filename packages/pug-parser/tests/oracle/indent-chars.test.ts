// Oracle cases for tab/space mixes: pug-lexer accepts or rejects ("you can use tabs or spaces but
// not both") each source exactly when the parser does. Node lines and raw-block lines (text blocks,
// comments, code blocks, filters) in both directions, with raw lines shallower than the block's first.
import { describe, expect, it } from 'vitest'
import { parsePug } from '../../src/index.ts'
import { officialSkeleton } from './skeleton.ts'

const cases: [name: string, src: string][] = [
  ['tabs then spaces on a node line', 'p\n\t  span'],
  ['spaces then a tab on a node line', 'p\n  \tspan'],
  ['a tab line in a space file', 'p\n  a\n\tb'],
  ['a space line in a tab file', 'p\n\ta\n  b'],
  ['a mixed text-block line past the block column (spaces)', 'p.\n    a\n    \tb\np x'],
  ['a mixed text-block line past the owner (spaces)', 'p.\n    a\n  \tb\np x'],
  ['a mixed text-block line past the owner (tabs)', 'div\n\tp.\n\t\t  a\n\t\t b\n\tp'],
  ['a mixed text-block line at the owner column (tabs)', 'div\n\tp.\n\t\t  a\n\t  b'],
  ['a space text-block line in a tab file', 'p.\n\t\ta\n  b'],
  ['a tab text-block line in a space file', 'p.\n  a\n\tb'],
  ['a shallower comment line, tabs then spaces', 'div\n\t//-\n\t\tspan old\n    p older\n\tp x'],
  ['a shallower comment line, spaces', 'div\n  //-\n      span old\n    p older\n  p x'],
  ['a shallower comment line, tabs', 'div\n\t//-\n\t\t\tspan old\n\t\tp older\n\tp x'],
  ['a shallower code-block line, mixed', 'div\n\t-\n\t\t\tvar a = 1\n    var b = 2\n\tp x'],
  ['a shallower filter line, mixed', 'div\n  :cdata\n      a\n\t\tb\n  p x'],
  ['a mixed line with a tab-indented base', 'div\n\tp\n\t\tspan\n\t  b'],
]

describe('tab/space mixes against pug-lexer', () => {
  it.each(cases)('%s', (_name, src) => {
    const official = officialSkeleton(src).ok
    const ours = parsePug(src).errors.filter((e) => e.code === 'inconsistent-indentation').length === 0
    expect({ src, ours }).toEqual({ src, ours: official })
  })

  it('covers both verdicts', () => {
    const verdicts = new Set(cases.map(([, src]) => officialSkeleton(src).ok))
    expect([...verdicts].sort()).toEqual([false, true])
  })
})
