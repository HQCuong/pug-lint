import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Linter } from 'eslint'
import type { EslintVersion } from './eslint-versions.ts'

export interface LintTextOptions {
  fix?: boolean
  filename?: string
  cache?: boolean
  cacheLocation?: string
}

export interface LintTextResult {
  messages: Linter.LintMessage[]
  output: string
}

/** Lint `code` with `config` only (no config file lookup) under ESLint version `v`. */
export async function lintText(
  v: EslintVersion,
  code: string,
  config: Linter.Config[],
  opts: LintTextOptions = {},
): Promise<LintTextResult> {
  const eslint = new v.ESLint({
    overrideConfigFile: true,
    overrideConfig: config,
    fix: opts.fix ?? false,
    cache: opts.cache ?? false,
    cacheLocation: opts.cacheLocation ?? mkdtempSync(join(tmpdir(), 'pug-lint-cache-')),
  })
  const [result] = await eslint.lintText(code, { filePath: opts.filename ?? 'Test.vue' })
  if (!result) throw new Error('lintText(): ESLint returned no result')
  return { messages: result.messages, output: result.output ?? code }
}
