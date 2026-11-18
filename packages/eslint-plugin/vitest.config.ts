import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { scaled } from './tests/helpers/time-scale.ts'

export default defineConfig({
  resolve: {
    alias: {
      '@pug-lint/parser': fileURLToPath(new URL('../pug-parser/src/index.ts', import.meta.url)),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    // Vitest's defaults, multiplied by PUG_LINT_TIME_SCALE so scaled wall-clock budgets fit inside them.
    testTimeout: scaled(5000),
    hookTimeout: scaled(10_000),
    globalSetup: ['tests/helpers/build-tokenizer.ts'],
  },
})
