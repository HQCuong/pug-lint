import type { Code, PugParseError, Range, Tag, Text, TextPart } from './ast.ts'
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

/** An `unsupported-syntax` error for `text[start, end)`. */
export function unsupported(text: string, start: number, end: number): PugParseError {
  return { code: 'unsupported-syntax', message: `Unsupported syntax: ${JSON.stringify(text.slice(start, end))}`, offset: start }
}

/** A `Text` node of `form` over `range` that is never interpolated (filter text): one `Raw` part. */
export function rawText(form: Text['form'], range: Range): Text {
  return { type: 'Text', form, range, content: range, parts: [{ type: 'Raw', range }] }
}

/** The `- x`, `= x` or `!= x` code whose operator starts at `start`, through `end`. */
export function codeNode(text: string, start: number, end: number): Code {
  const op = text[start] === '-' ? '-' : text[start] === '=' ? '=' : '!='
  let s = start + op.length
  let e = end
  while (s < e && (text[s] === ' ' || text[s] === '\t')) s++
  while (e > s && isWhitespace(text[e - 1])) e--
  return { type: 'Code', buffered: op !== '-', escaped: op === '=', range: [start, end], expression: [s, e], children: [] }
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
 * The `]` closing the `#[…]` whose tag starts at `inner`, before `end`; -1 if none. As in pug-lexer,
 * only the tag heads (attributes) and `=`/`!=` code are read as JS: inline text ends at its first
 * `]`, quotes and brackets in it are plain text, and a `#[…]`/`#{…}`/`!{…}` in it is skipped whole.
 * Without a tag at `inner`, the whole content is read as JS (the caller reports it).
 */
function interpolationClose(text: string, inner: number, end: number, errs: PugParseError[]): number {
  let s = inner
  for (;;) {
    const head = parseTagHead(text, s, end)
    if (!head.name && head.shorthands.length === 0) break
    const pos = head.pos
    if (text[pos] === ']') return pos
    if (text[pos] === ' ') return textClose(text, pos + 1, end, errs)
    if (text[pos] === ':' && text[pos + 1] === ' ') {
      s = pos + 1
      while (s < end && (text[s] === ' ' || text[s] === '\t')) s++
      continue
    }
    if (head.errs.length > 0) {
      errs.push(...head.errs)
      return -1
    }
    s = pos
    break
  }
  const close = skipExpression(text, s, end, NO_STOPS, errs)
  return close < end && text[close] === ']' ? close : -1
}

/** The first `]` in the inline text at `i` of a `#[…]` (see `interpolationClose`); -1 if none before `end`. */
function textClose(text: string, i: number, end: number, errs: PugParseError[]): number {
  while (i < end) {
    if (text[i] === ']') return i
    if (text[i] === '\\' && opensAt(text, i + 1, end)) {
      i += 3
    } else if (opensAt(text, i, end)) {
      const nested = text[i + 1] === '['
      const close = nested ? interpolationClose(text, i + 2, end, errs) : skipExpression(text, i + 2, end, NO_STOPS, errs)
      if (close < 0 || close >= end || text[close] !== (nested ? ']' : '}')) return -1
      i = close + 1
    } else {
      i++
    }
  }
  return -1
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
  const close = interpolationClose(text, inner, end, errs)
  if (close < 0) {
    errors.push(...errs)
    if (errs.length === 0) {
      errors.push({ code: 'unterminated-interpolation', message: 'Tag interpolation is not closed with "]"', offset: start })
    }
    return null
  }
  const tag = inlineTag(text, inner, close, errors)
  if (!tag) {
    errors.push({ code: 'unsupported-syntax', message: 'Tag interpolation does not start with a tag', offset: inner })
    return null
  }
  return { part: { type: 'TagInterpolation', range: [start, close + 1], tag }, next: close + 1 }
}

/**
 * The tag in `text[start, end)` of a `#[…]`: its head, then inline text after a
 * space, `=`/`!=` code, or a block expansion `: child` (a loop over the chain,
 * so a long one cannot overflow the stack). Null when no tag starts at `start`.
 */
function inlineTag(text: string, start: number, end: number, errors: PugParseError[]): Tag | null {
  let root: Tag | null = null
  let prev: Tag | null = null
  let s = start
  let colon = -1
  for (;;) {
    const head = parseTagHead(text, s, end)
    errors.push(...head.errs)
    if (!head.name && head.shorthands.length === 0) {
      if (prev) errors.push(unsupported(text, s, end))
      return root
    }
    const { name, shorthands, attributeBlocks, andAttributes, selfClose } = head
    const tag: Tag = {
      type: 'Tag', range: [s, end], name, shorthands, attributeBlocks, andAttributes,
      selfClose, dot: null, expansion: null, children: [],
    }
    if (prev) {
      prev.expansion = [colon, colon + 1]
      prev.children.push(tag)
    }
    root ??= tag
    prev = tag
    const pos = head.pos
    if (pos >= end) return root
    if (text[pos] === ' ') {
      const inline = parseInlineText(text, pos, end)
      errors.push(...inline.errors)
      if (inline.node) tag.children.push(inline.node)
      return root
    }
    if (text[pos] === '=' || text.startsWith('!=', pos)) {
      tag.children.push(codeNode(text, pos, end))
      return root
    }
    s = pos + 1
    while (s < end && (text[s] === ' ' || text[s] === '\t')) s++
    if (text[pos] !== ':' || text[pos + 1] !== ' ' || selfClose || s >= end) {
      errors.push(unsupported(text, pos, end))
      return root
    }
    colon = pos
  }
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
