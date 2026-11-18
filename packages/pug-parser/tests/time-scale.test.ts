import { describe, expect, it } from 'vitest'
import { timeScale } from './time-scale.ts'

describe('timeScale', () => {
  it('defaults to 1', () => {
    expect(timeScale(undefined)).toBe(1)
    expect(timeScale('')).toBe(1)
  })
  it('reads a positive number', () => {
    expect(timeScale('3')).toBe(3)
    expect(timeScale('1.5')).toBe(1.5)
  })
  it.each(['0', '-2', 'abc', 'Infinity'])('rejects %s', (raw) => {
    expect(() => timeScale(raw)).toThrow('PUG_LINT_TIME_SCALE')
  })
})
