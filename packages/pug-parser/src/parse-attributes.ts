import type { Attribute, AttributeBlock, AttributeValue, PugParseError, Range, Tag } from './ast.ts'
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

// As in pug-lexer: a name ends on a word character, so "li: a" leaves the expansion colon.
const TAG_NAME = /[A-Za-z](?:[\w:-]*\w)?/y
// As in pug-lexer: a class name contains at least one letter or '_'.
const CLASS_NAME = /[_a-zA-Z0-9-]*[_a-zA-Z][_a-zA-Z0-9-]*/y
const ID_NAME = /[\w-]+/y
const AND_ATTRIBUTES = '&attributes('
const UNCLOSED = new Set(['unclosed-attributes', 'unterminated-string'])

/** Match a sticky regex at `pos` of `s`. */
function matchAt(re: RegExp, s: string, pos: number): string | null {
  re.lastIndex = pos
  return re.exec(s)?.[0] ?? null
}

export interface TagHead {
  name: Tag['name']
  shorthands: Tag['shorthands']
  attributeBlocks: AttributeBlock[]
  andAttributes: Tag['andAttributes']
  selfClose: Range | null
  errs: PugParseError[]
  unclosed: boolean   // a block or `&attributes` paren is not closed before `limit`
  pos: number         // index after the head
}

/**
 * The tag head starting at `start` (name, `.class`/`#id`, attribute blocks,
 * `&attributes(…)`, trailing `/`), reading no further than `limit`. Used for
 * tag lines and for the tag of a `#[…]` interpolation.
 */
export function parseTagHead(src: string, start: number, limit: number): TagHead {
  const errs: PugParseError[] = []
  let pos = start
  let name: Tag['name'] = null
  const tagName = matchAt(TAG_NAME, src, pos)
  if (tagName) {
    name = { value: tagName, range: [start, start + tagName.length] }
    pos += tagName.length
  }
  const shorthands: Tag['shorthands'] = []
  const attributeBlocks: AttributeBlock[] = []
  const andAttributes: Tag['andAttributes'] = []
  let unclosed = false
  let selfClose: Range | null = null
  for (;;) {
    const sigil = src[pos]
    if (sigil === '.' || sigil === '#') {
      const value = matchAt(sigil === '.' ? CLASS_NAME : ID_NAME, src, pos + 1)
      if (!value) break
      shorthands.push({ kind: sigil === '.' ? 'class' : 'id', value, range: [pos, pos + 1 + value.length] })
      pos += 1 + value.length
    } else if (!name && shorthands.length === 0) {
      break   // attributes need a tag name or shorthand before them
    } else if (sigil === '(') {
      const result = parseAttributeBlock(src, pos, limit)
      attributeBlocks.push(result.block)
      errs.push(...result.errors)
      if (result.errors.some((e) => UNCLOSED.has(e.code))) unclosed = true
      pos = result.next
    } else if (src.startsWith(AND_ATTRIBUTES, pos)) {
      const open = pos + AND_ATTRIBUTES.length - 1
      const before = errs.length
      const close = skipExpression(src, open + 1, limit, { comma: false, whitespace: false }, errs)
      const closed = close < limit && src[close] === ')'
      if (!closed) {
        unclosed = true
        if (errs.length === before) {
          errs.push({ code: 'unclosed-attributes', message: '&attributes is not closed with ")"', offset: open })
        }
      }
      let [es, ee] = [open + 1, close]
      while (es < ee && isWhitespace(src[es])) es++
      while (ee > es && isWhitespace(src[ee - 1])) ee--
      andAttributes.push({ range: [pos, closed ? close + 1 : close], expression: [es, ee] })
      pos = closed ? close + 1 : close
    } else {
      break
    }
  }
  if ((name || shorthands.length > 0) && src[pos] === '/' && pos < limit) {
    selfClose = [pos, pos + 1]
    pos++
  }
  return { name, shorthands, attributeBlocks, andAttributes, selfClose, errs, unclosed, pos }
}
