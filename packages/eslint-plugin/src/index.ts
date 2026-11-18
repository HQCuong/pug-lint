import { fileURLToPath } from 'node:url'
import pkg from '../package.json' with { type: 'json' }

/**
 * Absolute path of the CommonJS tokenizer (`dist/tokenizer.cjs`) for vue-eslint-parser's `templateTokenizer`.
 * Resolved from the package root, so it is the same file from `src/` (tests) and from `dist/` (built).
 */
export const tokenizerPath: string = fileURLToPath(new URL('../dist/tokenizer.cjs', import.meta.url))

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
}

export default plugin
