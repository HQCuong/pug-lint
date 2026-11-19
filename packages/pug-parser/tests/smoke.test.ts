import { describe, expect, it } from 'vitest'
import { parsePug } from '../src/index.ts'

describe('pug-lint-parser smoke', () => {
  it('exports parsePug as a function', () => {
    expect(typeof parsePug).toBe('function')
  })
})
