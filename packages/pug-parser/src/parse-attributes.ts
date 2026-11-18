import type { Attribute, AttributeBlock, AttributeValue, PugParseError, Range } from './ast.ts'
import { isWhitespace, skipExpression, skipString, skipTemplate } from './expression.ts'

// Binary operators that join an unquoted value across whitespace ("b + c").
// ':' only joins after a '?' (ternary), so "a(x=b :y=c)" stays two attributes.
const STARTS_BINARY = new Set(['+', '-', '*', '/', '%', '<', '>', '&', '|', '^', '?', '='])
const ENDS_BINARY = new Set(['+', '-', '*', '/', '%', '<', '>', '&', '|', '^', '?', ':', '=', '!', '~'])
const CLOSERS = new Set([')', ']', '}', ','])

function skipWhitespace(text: string, i: number, end: number): number {
  while (i < end && isWhitespace(text[i])) i++
  return i
}

/** End of the attribute key at `i` (a quoted key, or chars up to whitespace, '=', '!=', ',', parens, quotes). */
function skipKey(text: string, i: number, end: number, errors: PugParseError[]): number {
  const c = text[i]
  if (c === '"' || c === "'") {
    const j = skipString(text, i, end)
    if (j >= 0) return j
    errors.push({ code: 'unterminated-string', message: 'Unterminated string', offset: i })
    return end
  }
  let j = i
  let brackets = 0
  while (j < end) {
    const d = text[j]!
    if (d === '[') brackets++
    else if (d === ']' && brackets > 0) brackets--
    else if (brackets === 0) {
      if (isWhitespace(d) || '=,()]}\'"`'.includes(d) || (d === '!' && text[j + 1] === '=')) break
    }
    j++
  }
  return j
}

/** End of an attribute value starting at `i`: the unquoted-value termination rule. */
function skipValue(text: string, i: number, end: number, errors: PugParseError[]): number {
  let p = i
  let ternary = false
  for (;;) {
    p = skipExpression(text, p, end, { comma: true, whitespace: true }, errors)
    if (p >= end || !isWhitespace(text[p])) return p
    const q = skipWhitespace(text, p, end)
    if (q >= end || CLOSERS.has(text[q]!)) return p
    const next = text[q]!
    const prev = text[p - 1]!
    const startsBinary = STARTS_BINARY.has(next) || (next === '!' && text[q + 1] === '=') || (next === ':' && ternary)
    if (!startsBinary && !ENDS_BINARY.has(prev)) return p
    if (next === '?' || prev === '?') ternary = true
    p = q
  }
}

function makeValue(text: string, start: number, end: number): AttributeValue {
  const raw = text.slice(start, end)
  const c = text[start]
  if ((c === '"' || c === "'") && skipString(text, start, end) === end) {
    return { range: [start, end], raw, kind: 'string', quote: c, inner: [start + 1, end - 1], hasSubstitution: false }
  }
  if (c === '`') {
    // Already scanned once by skipValue, so errors from this re-scan are discarded.
    const t = skipTemplate(text, start, end, [])
    if (t.end === end) {
      return { range: [start, end], raw, kind: 'template', quote: '`', inner: [start + 1, end - 1], hasSubstitution: t.hasSubstitution }
    }
  }
  return { range: [start, end], raw, kind: 'expression', quote: null, inner: null, hasSubstitution: false }
}

/**
 * Parse the attribute block whose '(' is at `open`, reading no further than `end`.
 * `next` is the index after the closing ')' (or `end` when the block is not
 * closed, reported as `unclosed-attributes` unless a string inside it was
 * already reported as `unterminated-string`).
 */
export function parseAttributeBlock(
  text: string, open: number, end: number,
): { block: AttributeBlock; next: number; errors: PugParseError[] } {
  const errors: PugParseError[] = []
  const attributes: Attribute[] = []
  const commas: Range[] = []
  let pos = open + 1
  for (;;) {
    pos = skipWhitespace(text, pos, end)
    if (pos >= end) {
      if (!errors.some((e) => e.code === 'unterminated-string')) {
        errors.push({ code: 'unclosed-attributes', message: 'Attribute block is not closed with ")"', offset: open })
      }
      break
    }
    const c = text[pos]!
    if (c === ')') {
      pos++
      break
    }
    if (c === ',') {
      commas.push([pos, pos + 1])
      pos++
      continue
    }
    const keyEnd = skipKey(text, pos, end, errors)
    if (keyEnd === pos) {
      errors.push({ code: 'unexpected-character', message: `Unexpected ${JSON.stringify(c)} in attributes`, offset: pos })
      pos++
      continue
    }
    const attribute: Attribute = {
      range: [pos, keyEnd], key: { raw: text.slice(pos, keyEnd), range: [pos, keyEnd] }, operator: null, value: null,
    }
    attributes.push(attribute)
    pos = keyEnd
    const opStart = skipWhitespace(text, keyEnd, end)
    const opValue = text[opStart] === '=' ? '=' : text.startsWith('!=', opStart) ? '!=' : null
    if (!opValue) continue
    const opEnd = opStart + opValue.length
    attribute.operator = { value: opValue, range: [opStart, opEnd] }
    attribute.range = [attribute.range[0], opEnd]
    pos = opEnd
    const valueStart = skipWhitespace(text, opEnd, end)
    const valueEnd = skipValue(text, valueStart, end, errors)
    if (valueEnd === valueStart) {
      if (valueStart < end) {
        errors.push({ code: 'missing-attribute-value', message: 'Expected a value after the operator', offset: valueStart })
      }
      continue
    }
    attribute.value = makeValue(text, valueStart, valueEnd)
    attribute.range = [attribute.range[0], valueEnd]
    pos = valueEnd
  }
  return { block: { range: [open, pos], attributes, commas }, next: pos, errors }
}
