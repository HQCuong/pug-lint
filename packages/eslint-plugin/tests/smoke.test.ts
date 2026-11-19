import { describe, expect, it } from 'vitest'
import plugin from '../src/index.ts'

describe('eslint-plugin-pug-lint smoke', () => {
  it('exports a plugin object with meta name and version', () => {
    expect(typeof plugin).toBe('object')
    expect(plugin.meta.name).toBe('eslint-plugin-pug-lint')
    expect(typeof plugin.meta.version).toBe('string')
  })
})
