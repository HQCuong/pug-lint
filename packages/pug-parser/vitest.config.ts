import { defineConfig } from 'vitest/config'
import { scaled } from './tests/time-scale.ts'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Vitest's defaults, multiplied by PUG_LINT_TIME_SCALE so scaled wall-clock budgets fit inside them.
    testTimeout: scaled(5000),
    hookTimeout: scaled(10_000),
  },
})
