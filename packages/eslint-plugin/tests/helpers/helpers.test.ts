import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { eslintVersions } from './eslint-versions.ts'
import { lintText } from './lint.ts'

const fixture = (name: string): string =>
  readFileSync(new URL(`../fixtures/corpus/${name}`, import.meta.url), 'utf8')

describe('test helpers', () => {
  // PUG_LINT_ESLINT narrows the list to one version (CI floor job).
  it.skipIf(process.env.PUG_LINT_ESLINT)('provides ESLint 9 and ESLint 10', () => {
    expect(eslintVersions).toHaveLength(2)
    expect(eslintVersions.map((v) => v.label)).toEqual(['eslint9', 'eslint10'])
    expect(eslintVersions[0]!.ESLint.version.startsWith('9.')).toBe(true)
    expect(eslintVersions[1]!.ESLint.version.startsWith('10.')).toBe(true)
  })

  for (const v of eslintVersions) {
    it(`lintText reports one message under ${v.label}`, async () => {
      const { messages, output } = await lintText(v, 'debugger', [{ rules: { 'no-debugger': 'error' } }], {
        filename: 'a.js',
      })
      expect(messages).toHaveLength(1)
      expect(messages[0]!.ruleId).toBe('no-debugger')
      expect(output).toBe('debugger')
    })
  }
})

describe('corpus', () => {
  it('Crlf.vue has CRLF line endings on disk', () => {
    expect(fixture('Crlf.vue')).toContain('\r\n')
  })

  it('Bom.vue starts with a BOM on disk', () => {
    expect(fixture('Bom.vue').startsWith('﻿')).toBe(true)
  })
})
