import type { PugParseError } from './ast.ts'

export interface ExpressionStops {
  comma: boolean       // stop at a top-level ','
  whitespace: boolean  // stop at top-level whitespace (incl. EOLs)
}

export const isWhitespace = (c: string | undefined): boolean => c === ' ' || c === '\t' || c === '\n' || c === '\r'

const unterminated = (errors: PugParseError[] | undefined, offset: number, what: string): void => {
  errors?.push({ code: 'unterminated-string', message: `Unterminated ${what}`, offset })
}

/**
 * End (index after the closing quote) of the '…' or "…" literal at `i`, or -1 if
 * it is not closed before `end`. Backslash escapes are skipped; EOLs are allowed
 * (Pug attribute values may span lines).
 */
export function skipString(text: string, i: number, end: number): number {
  const quote = text[i]
  for (let j = i + 1; j < end; j++) {
    const c = text[j]
    if (c === '\\') j++
    else if (c === quote) return j + 1
  }
  return -1
}

/**
 * End (index after the closing backtick) of the template literal at `i`, or -1
 * if it is not closed before `end`; `hasSubstitution` is true when it contains `${`.
 */
export function skipTemplate(
  text: string, i: number, end: number, errors?: PugParseError[],
): { end: number; hasSubstitution: boolean } {
  let hasSubstitution = false
  for (let j = i + 1; j < end; j++) {
    const c = text[j]
    if (c === '\\') {
      j++
    } else if (c === '`') {
      return { end: j + 1, hasSubstitution }
    } else if (c === '$' && text[j + 1] === '{') {
      hasSubstitution = true
      const before = errors?.length ?? 0
      const k = skipExpression(text, j + 2, end, { comma: false, whitespace: false }, errors)
      if (k >= end) {
        // A nested literal that is not closed has reported itself already.
        if ((errors?.length ?? 0) === before) unterminated(errors, i, 'template literal')
        return { end: -1, hasSubstitution }
      }
      j = k   // the '}' (or a stray closer) ends the substitution
    }
  }
  unterminated(errors, i, 'template literal')
  return { end: -1, hasSubstitution }
}

/**
 * Skip a JavaScript-ish expression starting at `i`: strings (with escapes),
 * template literals (with nested `${}`), and balanced `()[]{}`. Returns the
 * index of the first top-level stop (per `stops`) or unmatched closing bracket,
 * or `end`. An unclosed string or template literal is pushed to `errors` (when
 * given) as `unterminated-string`, and `end` is returned.
 */
export function skipExpression(
  text: string, i: number, end: number, stops: ExpressionStops, errors?: PugParseError[],
): number {
  let depth = 0
  while (i < end) {
    const c = text[i]!
    if (c === '"' || c === "'") {
      const j = skipString(text, i, end)
      if (j < 0) {
        unterminated(errors, i, 'string')
        return end
      }
      i = j
      continue
    }
    if (c === '`') {
      const j = skipTemplate(text, i, end, errors).end
      if (j < 0) return end
      i = j
      continue
    }
    if (c === '(' || c === '[' || c === '{') {
      depth++
    } else if (c === ')' || c === ']' || c === '}') {
      if (depth === 0) return i
      depth--
    } else if (depth === 0 && ((stops.comma && c === ',') || (stops.whitespace && isWhitespace(c)))) {
      return i
    }
    i++
  }
  return end
}
