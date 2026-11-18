// runRule(): one rule's valid/invalid cases under ESLint 9's and ESLint 10's RuleTester, on Vue SFCs
// parsed by vue-eslint-parser with the built Pug tokenizer. No processor: the all-rules harness covers rule + guard.
import type { Rule } from 'eslint'
import vueParser from 'vue-eslint-parser'
import { describe, it } from 'vitest'
import { tokenizerPath } from '../../src/index.ts'
import { eslintVersions } from './eslint-versions.ts'
import { toCRLF, vue } from './vue.ts'

interface CaseFields {
  /** A template body, wrapped with `vue()`. Exactly one of `pug` / `code`. */
  pug?: string
  /** A whole SFC, used unwrapped. */
  code?: string
  options?: unknown[]
  /** Convert the code (and `output`) to CRLF. */
  crlf?: boolean
  name?: string
}

export type Case = string | CaseFields

export type InvalidCase = CaseFields & {
  /** A template body (wrapped like `pug`), or `null` for "no fix". */
  output?: string | null
  errors: { messageId: string; line?: number; column?: number; endLine?: number; endColumn?: number }[]
}

interface TesterCase {
  code: string
  filename: string
  options?: unknown[]
  name?: string
}

const FILENAME = 'Test.vue'

/** The SFC text of a case: `pug` wrapped with `vue()`, or `code` as is; CRLF when asked. */
function source(c: CaseFields, body: string | undefined, label: string): string {
  if ((c.pug === undefined) === (c.code === undefined)) {
    throw new Error(`runRule(): ${label} needs exactly one of \`pug\` / \`code\``)
  }
  const text = c.pug !== undefined ? vue(body!) : body!
  return c.crlf ? toCRLF(text) : text
}

function toTesterCase(c: CaseFields, code: string): TesterCase {
  const out: TesterCase = { code, filename: FILENAME }
  if (c.options !== undefined) out.options = c.options
  if (c.name !== undefined) out.name = c.name
  return out
}

const key = (code: string, options: unknown[] | undefined): string => JSON.stringify([code, options ?? []])

export function runRule(
  name: string,
  rule: Rule.RuleModule,
  cases: { valid: Case[]; invalid: InvalidCase[] },
): void {
  const valid: TesterCase[] = []
  const seen = new Set<string>()
  const addValid = (c: TesterCase): void => {
    const k = key(c.code, c.options)
    if (seen.has(k)) return
    seen.add(k)
    valid.push(c)
  }
  for (const raw of cases.valid) {
    const c = typeof raw === 'string' ? { pug: raw } : raw
    addValid(toTesterCase(c, source(c, c.pug ?? c.code, `valid case ${JSON.stringify(raw)}`)))
  }

  const invalid = cases.invalid.map((c) => {
    const label = `invalid case ${JSON.stringify(c.name ?? c.pug ?? c.code)}`
    const out: TesterCase & { output?: string | null; errors: InvalidCase['errors'] } = {
      ...toTesterCase(c, source(c, c.pug ?? c.code, label)),
      errors: c.errors.map((e) => ({ ...e })),
    }
    if (c.output === null) out.output = null
    else if (c.output !== undefined) out.output = source(c, c.output, label)
    return out
  })
  // Idempotency: every fixed output must itself be valid with the same options.
  for (const c of invalid) {
    if (typeof c.output !== 'string') continue
    const auto: TesterCase = { code: c.output, filename: FILENAME, name: `output of ${c.name ?? 'invalid case'} is valid` }
    if (c.options !== undefined) auto.options = c.options
    addValid(auto)
  }

  for (const v of eslintVersions) {
    describe(`${name} (${v.label})`, () => {
      const { RuleTester } = v
      RuleTester.describe = describe
      RuleTester.it = it
      RuleTester.itOnly = it.only
      // languageOptions live in the constructor so each case stays serializable (duplicate detection works).
      const tester = new RuleTester({
        languageOptions: {
          parser: vueParser,
          parserOptions: { templateTokenizer: { pug: tokenizerPath, jade: tokenizerPath } },
        },
      })
      tester.run(name, rule, { valid, invalid })
    })
  }
}
