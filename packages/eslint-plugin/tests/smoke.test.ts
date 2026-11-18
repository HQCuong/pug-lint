import { describe, expect, it } from 'vitest'
import plugin from '../src/index.ts'

describe('@pug-lint/eslint-plugin smoke', () => {
  it('exports a plugin object with meta name and version', () => {
    expect(typeof plugin).toBe('object')
    expect(plugin.meta.name).toBe('@pug-lint/eslint-plugin')
    expect(typeof plugin.meta.version).toBe('string')
  })
})
