// The real-Pug oracle: does every Pug template of a file compile with the `pug` compiler, as Vue
// hands it over? The template content is de-indented exactly as @vue/compiler-sfc does it.
import { createRequire } from 'node:module'
import { parsePug, walk } from 'pug-lint-parser'
import { findPugTemplateRanges } from '../../src/shared/templates.ts'

// Dev-only CommonJS package without types.
const pug = createRequire(import.meta.url)('pug') as { compile: (src: string, options?: object) => unknown }

/**
 * @vue/compiler-sfc's `dedent` (3.5, applied to `lang="pug"` / `"jade"` templates): every line loses
 * as many characters as the least-indented non-blank line has leading whitespace.
 */
export function vueDedent(content: string): string {
  const lines = content.split('\n')
  const indent = Math.min(...lines.filter((l) => l.trim() !== '').map((l) => /^\s*/.exec(l)![0].length))
  return indent === 0 ? content : lines.map((l) => l.slice(indent)).join('\n')
}

/** An identity filter for every filter name `src` uses: the oracle checks syntax, not installed filters. */
function identityFilters(src: string): Record<string, (text: string) => string> {
  const filters: Record<string, (text: string) => string> = {}
  walk(parsePug(src), (node) => {
    if (node.type === 'Filter') for (const name of node.name.split(':')) filters[name] = (text) => text
  })
  return filters
}

/** Pug's error for the template content `content` (de-indented as by Vue), or null when it compiles. */
export function pugError(content: string): string | null {
  const src = vueDedent(content)
  try {
    pug.compile(src, { doctype: 'html', filters: identityFilters(src) })
    return null
  } catch (e) {
    const err = e as { msg?: string; message: string }
    return err.msg ?? err.message.split('\n')[0]!
  }
}

/** Pug's error for the first Pug template of the `.vue` file `text` that does not compile, or null. */
export function pugTemplateError(text: string): string | null {
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  for (const [start, end] of findPugTemplateRanges(body)) {
    const error = pugError(body.slice(start, end))
    if (error !== null) return error
  }
  return null
}
