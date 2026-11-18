import { fileURLToPath } from 'node:url'
import type { Linter } from 'eslint'
import pkg from '../package.json' with { type: 'json' }
import { buildConfigs } from './configs/index.ts'
import type { ConfigOptions, ConfigPlugin, Configs } from './configs/index.ts'
import { createProcessor } from './processor/index.ts'
import { rules } from './rules/index.ts'

/**
 * Absolute path of the CommonJS tokenizer (`dist/tokenizer.cjs`) for vue-eslint-parser's `templateTokenizer`.
 * Resolved from the package root, so it is the same file from `src/` (tests) and from `dist/` (built).
 */
export const tokenizerPath: string = fileURLToPath(new URL('../dist/tokenizer.cjs', import.meta.url))

export type Plugin = ConfigPlugin & {
  meta: { name: string; version: string }
  processors: { vue: Linter.Processor }
  configs: Configs
  configure: (options?: ConfigOptions) => Configs
  createProcessor: typeof createProcessor
}

const plugin = {
  meta: { name: pkg.name, version: pkg.version },
  rules,
  processors: { vue: createProcessor() },
  createProcessor,
  tokenizerPath,
} as Plugin

plugin.configure = (options) => buildConfigs(plugin, options)
plugin.configs = plugin.configure()

export default plugin
