// All-rules harness: the shipped `recommended` config (every registered recommended `vue-pug/*` rule,
// read from the registry at run time) plus eslint-plugin-vue's `flat/recommended`, fixing every corpus
// and format fixture under both ESLint majors. A failure here is an ownership bug in a rule.
import { readdirSync, readFileSync } from 'node:fs'
import { basename } from 'node:path'
import type { Linter } from 'eslint'
import { describe, expect, it, vi } from 'vitest'
import plugin from '../../src/index.ts'
import type { DropReason } from '../../src/processor/guard.ts'
import { templateFingerprint } from '../../src/shared/templates.ts'
import { eslintVersions } from '../helpers/eslint-versions.ts'
import { lintText } from '../helpers/lint.ts'
import { allRulesConfig } from './config.ts'

const dirs = ['corpus', 'format'].map((d) => new URL(`../fixtures/${d}/`, import.meta.url))
const fixtures = dirs.flatMap((dir) =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.vue') && f !== 'Broken.vue')
    .sort()
    .map((f) => ({ name: basename(f, '.vue'), text: readFileSync(new URL(f, dir), 'utf8') })),
)

const BOM = '﻿'
const ours = (ruleId: string | null): boolean => ruleId?.startsWith('vue-pug/') ?? false
const hasCRLF = (s: string): boolean => s.includes('\r\n')
const hasBareLF = (s: string): boolean => /(^|[^\r])\n/.test(s)

describe('all-rules harness setup', () => {
  it('has unique fixture names', () => {
    const names = fixtures.map((f) => f.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('enables every recommended rule of the registry', () => {
    const config = allRulesConfig(() => {})
    const enabled = new Set(config.flatMap((c) => Object.keys(c.rules ?? {})))
    for (const [name, rule] of Object.entries(plugin.rules)) {
      if (rule.meta?.docs?.recommended === true) expect(enabled).toContain(`vue-pug/${name}`)
    }
  })
})

describe.each(eslintVersions)('all rules ($label)', (v) => {
  it.each(fixtures)('$name', async ({ name, text }) => {
    const spy = vi.fn<(m: Linter.LintMessage, reason: DropReason) => void>()
    const config = allRulesConfig(spy)
    const filename = `${name}.vue`

    const fixed = await lintText(v, text, config, { fix: true, filename })
    const output = fixed.output

    // (a) structure kept, no Pug errors.
    const before = templateFingerprint(text)
    expect(before).not.toBeNull()
    expect(templateFingerprint(output)).toBe(before)

    // (b) a second pass is a no-op.
    const again = await lintText(v, output, config, { fix: true, filename })
    expect(again.output).toBe(output)

    // (c) one call converged: no fixable vue-pug message remains.
    expect(fixed.messages.filter((m) => ours(m.ruleId) && m.fix)).toEqual([])

    // (d) EOL style and BOM preserved.
    if (hasCRLF(text) && !hasBareLF(text)) expect(hasBareLF(output)).toBe(false)
    if (hasBareLF(text) && !hasCRLF(text)) expect(hasCRLF(output)).toBe(false)
    expect(output.startsWith(BOM)).toBe(text.startsWith(BOM))

    // (e) the guard never dropped a fix of ours.
    expect(spy.mock.calls.filter(([m]) => ours(m.ruleId)).map(([m, reason]) => ({ ruleId: m.ruleId, line: m.line, reason })))
      .toEqual([])

    // (f) the fixed output, reviewed by hand.
    await expect(output).toMatchFileSnapshot(`__snapshots__/${name}.fixed.vue`)
  })
})
