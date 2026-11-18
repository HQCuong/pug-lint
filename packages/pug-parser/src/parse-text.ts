import type { PugParseError, Range, Tag, Text, TextPart } from './ast.ts'
import { isWhitespace, skipExpression } from './expression.ts'
import { parseTagHead } from './parse-attributes.ts'

const NO_STOPS = { comma: false, whitespace: false }

/** `#{`, `!{` or `#[` starts at `i` (and fits before `end`). */
function opensAt(text: string, i: number, end: number): boolean {
  if (i + 1 >= end) return false
  const c = text[i]
  const d = text[i + 1]
  return (c === '#' && (d === '{' || d === '[')) || (c === '!' && d === '{')
}

const isBlank = (text: string, start: number, end: number): boolean => {
  for (let i = start; i < end; i++) if (!isWhitespace(text[i])) return false
  return true
}

/** A `Text` node of `form` whose content is `content`, with its parts parsed. */
export function makeText(
  text: string, form: Text['form'], range: Range, content: Range,
): { node: Text; errors: PugParseError[] } {
  const { parts, errors } = parseTextParts(text, content[0], content[1])
  return { node: { type: 'Text', form, range, content, parts }, errors }
}

/**
 * Inline text after a tag head, given the index of the separating space; the
 * content starts after that one space. Null when the rest is only whitespace.
 */
export function parseInlineText(
  text: string, space: number, end: number,
): { node: Text | null; errors: PugParseError[] } {
  const start = space + 1
  if (isBlank(text, start, end)) return { node: null, errors: [] }
  return makeText(text, 'inline', [start, end], [start, end])
}

/**
 * The `#[…]` at `start`, reading no further than `end`. Null (with an error)
 * when it is not closed or holds no tag; the caller keeps its text as raw.
 */
function parseTagInterpolation(
  text: string, start: number, end: number, errors: PugParseError[],
): { part: TextPart; next: number } | null {
  const inner = start + 2
  const errs: PugParseError[] = []
  const close = skipExpression(text, inner, end, NO_STOPS, errs)
  if (close >= end || text[close] !== ']') {
    errors.push(...errs)
    if (errs.length === 0) {
      errors.push({ code: 'unterminated-interpolation', message: 'Tag interpolation is not closed with "]"', offset: start })
    }
    return null
  }
  const head = parseTagHead(text, inner, close)
  errors.push(...head.errs)
  if (!head.name && head.shorthands.length === 0) {
    errors.push({ code: 'unsupported-syntax', message: 'Tag interpolation does not start with a tag', offset: inner })
    return null
  }
  const children: Tag['children'] = []
  if (head.pos < close) {
    if (text[head.pos] === ' ') {
      const inline = parseInlineText(text, head.pos, close)
      errors.push(...inline.errors)
      if (inline.node) children.push(inline.node)
    } else {
      errors.push({
        code: 'unsupported-syntax',
        message: `Unsupported syntax: ${JSON.stringify(text.slice(head.pos, close))}`,
        offset: head.pos,
      })
    }
  }
  const { name, shorthands, attributeBlocks, andAttributes, selfClose } = head
  const tag: Tag = {
    type: 'Tag', range: [inner, close], name, shorthands, attributeBlocks, andAttributes,
    selfClose, dot: null, expansion: null, children,
  }
  return { part: { type: 'TagInterpolation', range: [start, close + 1], tag }, next: close + 1 }
}

/**
 * Split the text `text[start, end)` into raw runs, `#{…}`/`!{…}` interpolations
 * and `#[…]` tag interpolations. `\#{`, `\!{` and `\#[` are escapes and stay raw.
 * An unclosed interpolation is reported as `unterminated-interpolation` and the
 * rest of the text is raw. Mustaches are not split: they belong to Vue.
 */
export function parseTextParts(text: string, start: number, end: number): { parts: TextPart[]; errors: PugParseError[] } {
  const parts: TextPart[] = []
  const errors: PugParseError[] = []
  let rawStart = start
  let i = start
  const flush = (to: number): void => {
    if (to > rawStart) parts.push({ type: 'Raw', range: [rawStart, to] })
  }
  while (i < end) {
    if (text[i] === '\\' && opensAt(text, i + 1, end)) {
      i += 3
      continue
    }
    if (!opensAt(text, i, end)) {
      i++
      continue
    }
    if (text[i + 1] === '[') {
      const result = parseTagInterpolation(text, i, end, errors)
      if (!result) break
      flush(i)
      parts.push(result.part)
      i = rawStart = result.next
      continue
    }
    const errs: PugParseError[] = []
    const close = skipExpression(text, i + 2, end, NO_STOPS, errs)
    if (close >= end || text[close] !== '}') {
      errors.push(...errs)
      if (errs.length === 0) {
        errors.push({ code: 'unterminated-interpolation', message: 'Interpolation is not closed with "}"', offset: i })
      }
      break
    }
    let [es, ee] = [i + 2, close]
    while (es < ee && isWhitespace(text[es])) es++
    while (ee > es && isWhitespace(text[ee - 1])) ee--
    flush(i)
    parts.push({ type: 'Interpolation', escaped: text[i] === '#', range: [i, close + 1], expression: [es, ee] })
    i = rawStart = close + 1
  }
  flush(end)
  return { parts, errors }
}
