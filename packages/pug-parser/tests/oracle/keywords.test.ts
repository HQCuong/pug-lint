// Oracle cases for keyword-like words: pug-lexer accepts or rejects each source exactly when the
// parser does. pug-lexer reads `case`, `default`, `each`, `for`, `include`, … as keywords before any
// non-word character, and takes `(` right after a keyword only for `if`, `unless` and `else if`.
// Some keywords need a space after them, not a tab; `else` takes no condition. A block expansion ':'
// is followed by spaces only.
import { describe, expect, it } from 'vitest'
import { parsePug } from '../../src/index.ts'
import { officialSkeleton } from './skeleton.ts'

const cases: string[] = [
  'default-slot', 'for-item x', 'each-row', 'while-loading', 'case.x', 'when-x', 'include-me', 'extends-x',
  'extend-x', 'div\n  else-x', 'li: for-x', 'block-x', 'if-ok', 'iffy', 'mixin-x', 'yield-x', 'unless-x',
  'append-x', 'prepend-x', 'doctype-x', 'forms', 'cases', 'defaults', 'my-for',
  'if(x)\n  p', 'unless(x)\n  p', 'if x\n  p\nelse if(y)\n  p', 'if x\n  p\nelse(y)\n  p',
  'case x\n  when(1)\n    p', 'case(x)\n  when 1\n    p', 'while(x)\n  p', 'each(x)\n  p', 'for(x)\n  p',
  // A tab after a keyword; `else` with a condition.
  'mixin\tm\n  p', 'block\tx', 'append\tx', 'prepend\tx', 'yield\t', 'doctype\thtml', 'case x\n  default\t\n    p',
  'if\tx\n  p', 'unless\tx\n  p', 'while\tx\n  p', 'each\tx in y\n  p', 'case\tx\n  when 1\n    p',
  'case x\n  when\t1\n    p', 'if x\n  p\nelse\t\n  p', 'if x\n  p\nelse\tif y\n  p', 'if x\n  p\nelse  if y\n  p',
  'if x\n  p\nelse x\n  p', 'if x\n  p\nelse if\ty\n  p',
  // Block expansion: ':' and spaces only.
  'li: span x', 'li:  span x', 'li: \tspan x', 'li:\tspan x',
]

describe('keyword-like words against pug-lexer', () => {
  it.each(cases)('%j', (src) => {
    expect({ src, ours: parsePug(src).errors.length === 0 }).toEqual({ src, ours: officialSkeleton(src).ok })
  })
})
