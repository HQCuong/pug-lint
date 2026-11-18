import { ESLint, RuleTester } from 'eslint'
import { ESLint as ESLint9, RuleTester as RuleTester9 } from 'eslint9'

export interface EslintVersion {
  label: 'eslint9' | 'eslint10'
  ESLint: typeof ESLint
  RuleTester: typeof RuleTester
}

const all: EslintVersion[] = [
  // ESLint 9's classes are typed by its own package; the public surface the tests use is the same.
  { label: 'eslint9', ESLint: ESLint9 as unknown as typeof ESLint, RuleTester: RuleTester9 as unknown as typeof RuleTester },
  { label: 'eslint10', ESLint, RuleTester },
]

/** ESLint versions every plugin test runs under. `PUG_LINT_ESLINT=9|10` keeps only that one. */
export const eslintVersions: EslintVersion[] = selectVersions(process.env.PUG_LINT_ESLINT)

function selectVersions(only: string | undefined): EslintVersion[] {
  if (only === undefined || only === '') return all
  const picked = all.filter((v) => v.label === `eslint${only}`)
  if (picked.length === 0) throw new Error(`PUG_LINT_ESLINT must be 9 or 10, got ${JSON.stringify(only)}`)
  return picked
}
