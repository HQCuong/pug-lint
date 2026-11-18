// The real-Pug oracle: does every Pug template of a file compile with the `pug` compiler? Templates
// are de-indented first, as for the compat harness's HTML twins (`tools/compat/run.ts`).
import { createRequire } from 'node:module'
import { parsePug, walk } from '@pug-lint/parser'
import { findPugTemplateRanges } from '../../src/shared/templates.ts'
import { dedent } from '../../tools/compat/run.ts'

// Dev-only CommonJS package without types.
const pug = createRequire(import.meta.url)('pug') as { compile: (src: string, options?: object) => unknown }

/** An identity filter for every filter name `src` uses: the oracle checks syntax, not installed filters. */
function identityFilters(src: string): Record<string, (text: string) => string> {
  const filters: Record<string, (text: string) => string> = {}
  walk(parsePug(src), (node) => {
    if (node.type === 'Filter') for (const name of node.name.split(':')) filters[name] = (text) => text
  })
  return filters
}

/** Pug's error for the template body `body` (de-indented first), or null when it compiles. */
export function pugError(body: string): string | null {
  try {
    const src = dedent(body)
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
