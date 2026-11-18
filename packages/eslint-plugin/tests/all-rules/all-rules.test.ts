// All-rules harness: the shipped `recommended` config (every registered recommended `vue-pug/*` rule,
// read from the registry at run time) plus eslint-plugin-vue's `flat/recommended`, fixing every corpus
// and format fixture under both ESLint majors. A failure here is an ownership bug in a rule.
import { readdirSync, readFileSync } from 'node:fs'
import { basename } from 'node:path'
import type { Linter, Rule } from 'eslint'
import { walk } from '@pug-lint/parser'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import plugin from '../../src/index.ts'
import type { DropReason } from '../../src/processor/guard.ts'
import { templateFingerprint } from '../../src/shared/templates.ts'
import { createPugRule } from '../../src/utils/create-rule.ts'
import type { EslintVersion } from '../helpers/eslint-versions.ts'
import { eslintVersions } from '../helpers/eslint-versions.ts'
import { lintText } from '../helpers/lint.ts'
import { vue } from '../helpers/vue.ts'
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

// Process warnings ESLint emits while fixing (ESLintCircularFixesWarning). Delivered asynchronously.
const warnings: Error[] = []
const onWarning = (w: Error): void => {
  warnings.push(w)
}
beforeAll(() => {
  process.on('warning', onWarning)
})
afterAll(() => {
  process.off('warning', onWarning)
})
const flushWarnings = async (): Promise<string[]> => {
  await new Promise((resolve) => setImmediate(resolve))
  return warnings.splice(0).map((w) => `${w.name}: ${w.message}`)
}

interface HarnessRun {
  output: string
  /** Output of a second fix pass over `output`. */
  again: string
  /** Fixable `vue-pug/*` messages left after the first fix call. */
  remaining: Linter.LintMessage[]
  /** Fixes the guard dropped for `vue-pug/*` rules, in either call. */
  drops: { ruleId: string | null; line: number; reason: DropReason }[]
  warnings: string[]
}

async function runHarness(
  v: EslintVersion,
  name: string,
  text: string,
  extraRules?: Record<string, Rule.RuleModule>,
): Promise<HarnessRun> {
  const drops: HarnessRun['drops'] = []
  const config = allRulesConfig((m, reason) => {
    if (ours(m.ruleId)) drops.push({ ruleId: m.ruleId, line: m.line, reason })
  }, extraRules)
  const filename = `${name}.vue`
  await flushWarnings()
  const fixed = await lintText(v, text, config, { fix: true, filename })
  const again = await lintText(v, fixed.output, config, { fix: true, filename })
  return {
    output: fixed.output,
    again: again.output,
    remaining: fixed.messages.filter((m) => ours(m.ruleId) && m.fix),
    drops,
    warnings: await flushWarnings(),
  }
}

// Negative controls: rules that exist only here, to prove the checks can fail.
const testRuleMeta = (description: string) => ({
  type: 'layout' as const,
  fixable: 'whitespace' as const,
  docs: { description, recommended: true },
  schema: [],
  messages: { m: 'm' },
})

/** Appends one character to every inline text: structure-safe, never converges. */
const neverConverges = createPugRule<[]>({
  name: 'test-never-converges',
  meta: testRuleMeta('test rule'),
  defaultOptions: [],
  check(ctx) {
    walk(ctx.doc, (node) => {
      if (node.type === 'Text') {
        const end = node.content[1]
        ctx.report({ range: node.content, messageId: 'm', fix: (fixer) => fixer.insertTextAfterRange([end, end], 'x') })
      }
    })
  },
})

/** Deletes the ')' of every attribute block: breaks the Pug parse. */
const breaksPug = createPugRule<[]>({
  name: 'test-breaks-pug',
  meta: testRuleMeta('test rule'),
  defaultOptions: [],
  check(ctx) {
    walk(ctx.doc, (node) => {
      if (node.type !== 'Tag') return
      for (const block of node.attributeBlocks) {
        const close: [number, number] = [block.range[1] - 1, block.range[1]]
        ctx.report({ range: close, messageId: 'm', fix: (fixer) => fixer.removeRange(close) })
      }
    })
  },
})

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

  it('keeps the negative-control rules out of the registry', () => {
    expect(Object.keys(plugin.rules).filter((n) => n.startsWith('test-'))).toEqual([])
  })

  describe.each(eslintVersions)('negative controls ($label)', (v) => {
    it('a non-converging rule fails the convergence and second-pass checks', async () => {
      const run = await runHarness(v, 'NeverConverges', vue('p Hello'), { 'test-never-converges': neverConverges })
      expect(run.remaining.map((m) => m.ruleId)).toEqual(['vue-pug/test-never-converges'])
      expect(run.again).not.toBe(run.output)
      expect(run.drops).toEqual([])
    })

    it('a Pug-breaking rule makes the guard drop a vue-pug fix', async () => {
      const text = vue('a(href="/x") Link')
      const run = await runHarness(v, 'BreaksPug', text, { 'test-breaks-pug': breaksPug })
      expect(run.output).toBe(text)
      // Once per fix call (the run and the second pass).
      const drop = { ruleId: 'vue-pug/test-breaks-pug', line: 2, reason: 'parse-error' }
      expect(run.drops).toEqual([drop, drop])
    })
  })
})

describe.each(eslintVersions)('all rules ($label)', (v) => {
  it.each(fixtures)('$name', async ({ name, text }) => {
    const { output, again, remaining, drops, warnings } = await runHarness(v, name, text)

    // (a) structure kept, no Pug errors.
    const before = templateFingerprint(text)
    expect(before).not.toBeNull()
    expect(templateFingerprint(output)).toBe(before)

    // (b) a second pass is a no-op.
    expect(again).toBe(output)

    // (c) one call converged: no fixable vue-pug message remains.
    expect(remaining).toEqual([])

    // (d) EOL style and BOM preserved.
    if (hasCRLF(text) && !hasBareLF(text)) expect(hasBareLF(output)).toBe(false)
    if (hasBareLF(text) && !hasCRLF(text)) expect(hasCRLF(output)).toBe(false)
    expect(output.startsWith(BOM)).toBe(text.startsWith(BOM))

    // (e) the guard never dropped a fix of ours.
    expect(drops).toEqual([])

    // No fix loop without progress (ESLintCircularFixesWarning) or other process warning.
    expect(warnings).toEqual([])

    // (f) the fixed output, reviewed by hand.
    await expect(output).toMatchFileSnapshot(`__snapshots__/${name}.fixed.vue`)
  })
})
