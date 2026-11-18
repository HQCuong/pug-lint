// The generated vue-rule compatibility table: classification of single rules, the generated lists,
// fixture validity (each HTML twin has the same element skeleton as its Pug template), and drift.
import { readFileSync } from 'node:fs'
import type { Rule } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'
import { vueCrashing, vueSuppressed } from '../../src/configs/generated/vue-compat.ts'
import { classifyRule, compatFixtures, generate, htmlTwin, twinProblems } from '../../tools/compat/run.ts'
import type { CompatFixture, Generated } from '../../tools/compat/run.ts'
import { scaled } from '../helpers/time-scale.ts'
import { vue } from '../helpers/vue.ts'

// Rules the spike found must not run inside Pug templates (spec brief). `mustache-interpolation-spacing`
// is left to the harness.
const mustBeOff = [
  'vue/max-attributes-per-line',
  'vue/first-attribute-linebreak',
  'vue/singleline-html-element-content-newline',
  'vue/multiline-html-element-content-newline',
  'vue/no-multi-spaces',
  'vue/html-indent',
  'vue/html-self-closing',
  'vue/html-end-tags',
  'vue/html-closing-bracket-newline',
  'vue/html-closing-bracket-spacing',
]

describe('classifyRule', () => {
  it('vue/html-indent crashes on Pug (zero-width end tags)', () => {
    expect(classifyRule('vue/html-indent', [[]]).status).toBe('crash')
  })

  it.each([
    'vue/require-v-for-key',
    'vue/attribute-hyphenation',
    'vue/attributes-order',
    'vue/no-use-v-if-with-v-for',
    'vue/no-unused-vars',
  ])('%s is ok', (rule) => {
    const verdict = classifyRule(rule, [[]])
    expect(verdict, verdict.reason).toMatchObject({ rule, status: 'ok' })
  })

  it('a rule that throws on any VElement is a crash', () => {
    const throws: Rule.RuleModule = {
      meta: { type: 'problem', schema: [] },
      create: (context) => (context.sourceCode.parserServices as {
        defineTemplateBodyVisitor: (v: Record<string, () => void>) => Rule.RuleListener
      }).defineTemplateBodyVisitor({
        VElement() {
          throw new Error('boom')
        },
      }),
    }
    const verdict = classifyRule('vue/test-throws', [[]], { rules: { 'test-throws': throws } })
    expect(verdict).toMatchObject({ rule: 'vue/test-throws', status: 'crash' })
    expect(verdict.reason).toBe('throws on AttrOrder.vue')
  })

  // One fixture: `a(title="t") x`, and a fake rule reporting `"t"` once on each side.
  const fixture = (): CompatFixture => {
    const text = vue('div\n  a(title="t") x', '<script>\nexport default {}\n</script>\n')
    return { name: 'T.vue', text, twin: htmlTwin(text) }
  }
  const reportsT = (fixOrSuggest: (range: [number, number]) => Partial<Rule.ReportDescriptor>): Rule.RuleModule => ({
    meta: { type: 'problem', schema: [], fixable: 'code', hasSuggestions: true },
    create: (context) => ({
      Program() {
        const i = context.sourceCode.text.indexOf('"t"')
        if (i < 0) return
        const range: [number, number] = [i, i + 3]
        const loc = { start: context.sourceCode.getLocFromIndex(i), end: context.sourceCode.getLocFromIndex(i + 3) }
        context.report({ loc, message: 'm', ...fixOrSuggest(range) } as Rule.ReportDescriptor)
      },
    }),
  })

  it('a fix that our parser accepts but pug cannot compile is fix-unsafe', () => {
    // `title=1 +` is an expression value to our parser (same structure), a JS syntax error to pug.
    const rule = reportsT((range) => ({ fix: (fixer: Rule.RuleFixer) => fixer.replaceTextRange(range, '1 +') }))
    const verdict = classifyRule('vue/test-pug-compile', [[]], { rules: { 'test-pug-compile': rule }, fixtures: [fixture()] })
    expect(verdict).toMatchObject({ status: 'fix-unsafe', reason: 'T.vue: the fixed template does not compile with pug' })
  })

  it('a dropped suggestion (no fix) is fix-unsafe', () => {
    // `a(title=` → `a.x(title=`: a new class changes the template structure, so the guard drops it.
    const afterTagName = (range: [number, number]): [number, number] => [range[0] - 'a(title='.length + 1, range[0] - 'a(title='.length + 1]
    const rule = reportsT((range) => ({
      suggest: [{ desc: 's', fix: (fixer: Rule.RuleFixer) => fixer.insertTextAfterRange(afterTagName(range), '.x') }],
    }))
    const verdict = classifyRule('vue/test-suggest', [[]], { rules: { 'test-suggest': rule }, fixtures: [fixture()] })
    expect(verdict).toMatchObject({ status: 'fix-unsafe', reason: 'T.vue: the guard dropped 1 fix(es) or suggestion(s)' })
  })

  it('vue/no-spaces-around-equal-signs-in-attribute is suppressed, in favour of vue-pug/attribute-equals-spacing', () => {
    expect(vueSuppressed['vue/no-spaces-around-equal-signs-in-attribute']).toBeDefined()
  })
})

describe('compat fixtures', () => {
  it('there are at least 12', () => {
    expect(compatFixtures().length).toBeGreaterThanOrEqual(12)
  })

  it.each(compatFixtures().map((f) => [f.name, f] as const))('%s: the HTML twin has the same elements and class sets', (_name, f) => {
    expect(twinProblems(f)).toEqual([])
  })
})

describe('generated table', () => {
  it('every must-be-OFF rule is suppressed or crashing; vue/html-quotes is suppressed', () => {
    for (const rule of mustBeOff) expect(rule in vueSuppressed || rule in vueCrashing, rule).toBe(true)
    expect(vueSuppressed['vue/html-quotes']).toBeDefined()
  })

  describe('regenerated in memory', () => {
    let generated: Generated
    beforeAll(() => {
      generated = generate()
    }, scaled(600_000))

    it.skipIf(process.env.PUG_LINT_SKIP_COMPAT_DRIFT === '1')('equals the committed files (run `pnpm compat`)', () => {
      expect(generated.source).toBe(readFileSync(new URL('../../src/configs/generated/vue-compat.ts', import.meta.url), 'utf8'))
      expect(generated.markdown).toBe(readFileSync(new URL('../../docs/vue-compatibility.md', import.meta.url), 'utf8'))
    })

    it('untested rules are at most 40% of the non-deprecated rules', () => {
      const untested = generated.verdicts.filter((v) => v.status === 'untested').map((v) => v.rule)
      console.log(`untested (${untested.length}/${generated.verdicts.length}):\n  ${untested.join('\n  ')}`)
      expect(untested.length).toBeLessThanOrEqual(generated.verdicts.length * 0.4)
    })
  })
})
