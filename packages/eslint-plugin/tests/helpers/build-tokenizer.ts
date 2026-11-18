// Vitest global setup: builds dist/tokenizer.cjs once per run, so tests always exercise the
// CommonJS bundle vue-eslint-parser `require`s, built from the current sources.
// Only the tokenizer config runs, with `clean: false`: dist/index.js and .d.ts are left alone.
import { fileURLToPath } from 'node:url'
import { build } from 'tsdown'
import { tokenizerConfig } from '../../tsdown.config.ts'

export default async function buildTokenizer(): Promise<void> {
  await build({
    ...tokenizerConfig,
    clean: false,
    config: false,
    cwd: fileURLToPath(new URL('../..', import.meta.url)),
    logLevel: 'warn',
  })
}
