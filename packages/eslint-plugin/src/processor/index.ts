// The `vue-pug/vue` processor: eslint-plugin-vue's `vue` processor (comment directives), then
// suppression of incompatible vue rules inside Pug templates, then the fix guard.
import type { Linter } from 'eslint'
import pluginVue from 'eslint-plugin-vue'
import pkg from '../../package.json' with { type: 'json' }
import { vueSuppressed } from '../configs/generated/vue-compat.ts'
import { guardMessages } from './guard.ts'
import type { DropReason } from './guard.ts'
import { suppressMessages } from './suppress.ts'

export interface ProcessorOptions {
  /** The wrapped processor; default eslint-plugin-vue's `vue` processor. */
  inner?: Linter.Processor
  /** Rule ids removed from the suppression set. */
  keepVueRules?: readonly string[]
  /** Rule ids suppressed inside Pug templates; default the generated `vueSuppressed`. */
  suppress?: ReadonlySet<string>
  /** Called once per dropped fix or suggestion. */
  onDrop?: (m: Linter.LintMessage, reason: DropReason) => void
}

const stripBom = (text: string): string => (text.charCodeAt(0) === 0xfeff ? text.slice(1) : text)

/** A copy of `m` without `fix` and `suggestions`. */
function withoutFixes(m: Linter.LintMessage): Linter.LintMessage {
  if (!('fix' in m) && !('suggestions' in m)) return m
  const { fix: _fix, suggestions: _suggestions, ...rest } = m
  return rest
}

export function createProcessor(options: ProcessorOptions = {}): Linter.Processor {
  const inner = options.inner ?? (pluginVue.processors.vue as Linter.Processor)
  const keep = [...(options.keepVueRules ?? [])].sort()
  const suppressSet = new Set(options.suppress ?? Object.keys(vueSuppressed))
  for (const id of keep) suppressSet.delete(id)
  const onDrop = options.onDrop
  // BOM-stripped source by filename, from preprocess to postprocess.
  const texts = new Map<string, string>()

  return {
    meta: {
      // ESLint's cache keys on processor meta, so the name encodes keepVueRules.
      name: keep.length === 0 ? 'vue-pug/vue' : `vue-pug/vue+${keep.join(',')}`,
      version: pkg.version,
    },
    supportsAutofix: true,
    preprocess(text, filename) {
      texts.set(filename, stripBom(text))
      return inner.preprocess!(text, filename)
    },
    postprocess(messages, filename) {
      const result = inner.postprocess!(messages, filename)
      const text = texts.get(filename)
      // No stored text: nothing to verify fixes against, and the guard never fails open.
      if (text === undefined) return result.map(withoutFixes)
      texts.delete(filename)
      return guardMessages(text, suppressMessages(text, result, suppressSet), onDrop)
    },
  }
}
