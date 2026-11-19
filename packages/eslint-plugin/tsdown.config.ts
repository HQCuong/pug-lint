import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsdown'
import type { UserConfig } from 'tsdown'

/**
 * dist/tokenizer.cjs: the file vue-eslint-parser `require`s. Everything is bundled, and
 * `pug-lint-parser` comes from its source so the bundle never holds a missing or stale parser build.
 * It never cleans `dist`: the test global setup rebuilds it alone next to an existing ESM build.
 */
export const tokenizerConfig: UserConfig = {
  entry: { tokenizer: 'src/tokenizer/entry.cts' },
  format: 'cjs',
  platform: 'node',
  fixedExtension: true,
  dts: false,
  clean: false,
  deps: { alwaysBundle: [/.*/] },
  alias: { 'pug-lint-parser': fileURLToPath(new URL('../pug-parser/src/index.ts', import.meta.url)) },
  // CommonJS on purpose: vue-eslint-parser loads the tokenizer with a plain `require`.
  checks: { legacyCjs: false },
}

export default defineConfig([
  // Listed first and the only config that cleans `dist`.
  {
    entry: ['src/index.ts'],
    format: 'esm',
    platform: 'node',
    fixedExtension: false,
    dts: true,
    clean: true,
  },
  tokenizerConfig,
])
