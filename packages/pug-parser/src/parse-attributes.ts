import type { Attribute, AttributeBlock, AttributeValue, MixinCall, PugParseError, Range, Tag } from './ast.ts'
import { isWhitespace, literalSpans, skipExpression, skipString, skipTemplate } from './expression.ts'

// As in pug-lexer (character-parser's isPunctuator): after top-level whitespace
// a value goes on when the next character is one of these, except ':' and '...'.
const PUNCTUATORS = new Set(['.', '(', ')', ';', ',', '{', '}', '[', ']', ':', '?', '~', '%', '&', '*', '+', '-', '/', '<', '>', '^', '|', '!', '='])
// A value ending in one of these (or in a keyword operator) is not a complete expression.
const ENDS_INCOMPLETE = new Set(['.', ',', '?', ':', '~', '%', '&', '*', '+', '-', '/', '<', '>', '^', '|', '!', '='])
const ENDS_KEYWORD = /(?:^|[^\w$.])(?:new|typeof|void|delete|await|in|instanceof)$/
const CLOSERS = new Set([')', ']', '}', ','])

function skipWhitespace(text: string, i: number, end: number): number {
  while (i < end && isWhitespace(text[i])) i++
  return i
}

const OPENER: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

/**
 * End of the attribute key at `i`: a quoted key, or chars up to whitespace, '=', '!', ',', a quote, or
 * a closing paren or bracket that closes nothing. As in pug-lexer, brackets do not protect those
 * stops, but balanced `( [ {` belong to the key (`:[arg]`, `#cell(name)`), with a literal inside
 * them that has no stop character and balanced brackets (`#[`h-${k}`]`). Pug reads the whole
 * attribute block with a JavaScript scanner first, so a key whose brackets are not balanced, or that
 * holds a '/' (a comment or regular expression to that scanner) or a backslash, is an error.
 */
function skipKey(text: string, i: number, end: number, errors: PugParseError[]): number {
  const c = text[i]
  if (c === '"' || c === "'") {
    const j = skipString(text, i, end)
    if (j >= 0) return j
    errors.push({ code: 'unterminated-string', message: 'Unterminated string', offset: i })
    return end
  }
  let j = i
  const open: string[] = []
  for (; j < end; j++) {
    const d = text[j]!
    if (d === '[' || d === '(' || d === '{') {
      open.push(d)
    } else if (d === ']' || d === ')' || d === '}') {
      if (open.length === 0) break
      if (open.pop() !== OPENER[d]) {
        errors.push({ code: 'unbalanced-key', message: `Mismatched ${JSON.stringify(d)} in an attribute key`, offset: j })
        return j
      }
    } else if (d === '/' || d === '\\') {
      errors.push({ code: 'unexpected-character', message: `Unexpected ${JSON.stringify(d)} in an attribute key`, offset: j })
      return j
    } else if (open.length > 0 && (d === '"' || d === "'" || d === '`')) {
      const close = d === '`' ? skipTemplate(text, j, end, []).end : skipString(text, j, end)
      if (close < 0) break
      const literal = text.slice(j + 1, close - 1)
      if (/[\s=,!/\\]/.test(literal) || !balanced(literal)) {
        errors.push({ code: 'unbalanced-key', message: 'Unsupported literal in an attribute key', offset: j })
        return close
      }
      j = close - 1
    } else if (isWhitespace(d) || '=,!\'"`'.includes(d)) {
      break
    }
  }
  if (open.length > 0) {
    errors.push({ code: 'unbalanced-key', message: `Unclosed ${JSON.stringify(open.at(-1))} in an attribute key`, offset: i })
  }
  return j
}

/** True when the `( [ {` of `s` are balanced and properly nested (no literals are skipped). */
function balanced(s: string): boolean {
  const open: string[] = []
  for (const c of s) {
    if (c === '(' || c === '[' || c === '{') open.push(c)
    else if ((c === ')' || c === ']' || c === '}') && open.pop() !== OPENER[c]) return false
  }
  return open.length === 0
}

/**
 * Offset of an escape in the literal `text[s, e)` that JavaScript rejects (`\\u` without 4 hex digits
 * or `{hex}`, `\\x` without 2 hex digits; in a template literal also a legacy octal escape), or -1.
 * Pug compiles the literals of attribute values as JavaScript.
 */
function badEscape(text: string, s: number, e: number): number {
  const template = text[s] === '`'
  for (let i = s; i < e; i++) {
    if (text[i] !== '\\') continue
    const next = text[i + 1] ?? ''
    const rest = text.slice(i + 2, e)
    if (next === 'u' && !/^(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})/.test(rest)) return i
    if (next === 'x' && !/^[0-9a-fA-F]{2}/.test(rest)) return i
    if (template && (/[1-9]/.test(next) || (next === '0' && /^[0-9]/.test(rest)))) return i
    i++
  }
  return -1
}

/**
 * Top-level `?` minus top-level `:` in `text[s, e)` (strings and brackets
 * skipped; `?.` and `??` are not ternaries). `[s, e)` starts at depth 0.
 */
function ternaryDelta(text: string, s: number, e: number): number {
  let delta = 0
  let depth = 0
  for (let i = s; i < e; i++) {
    const c = text[i]
    if (c === '"' || c === "'" || c === '`') {
      const j = c === '`' ? skipTemplate(text, i, e).end : skipString(text, i, e)
      if (j < 0) return delta
      i = j - 1
    } else if (c === '(' || c === '[' || c === '{') {
      depth++
    } else if (c === ')' || c === ']' || c === '}') {
      depth = Math.max(0, depth - 1)
    } else if (depth === 0 && c === '?') {
      if (text[i + 1] === '?' || (text[i + 1] === '.' && !/[0-9]/.test(text[i + 2] ?? ''))) i++
      else delta++
    } else if (depth === 0 && c === ':') {
      delta--
    }
  }
  return delta
}

/**
 * End of an attribute value starting at `i`. As in pug-lexer, top-level
 * whitespace ends it when the next character is not a punctuator (or is ':' or
 * '...') and the value so far is a complete expression: no open ternary, not
 * ending in an operator or a keyword operator (`new`, `typeof`, `in`, …).
 */
function skipValue(text: string, i: number, end: number, errors: PugParseError[]): number {
  let p = i
  let ternaries = 0
  for (;;) {
    const from = p
    p = skipExpression(text, p, end, { comma: true, whitespace: true }, errors)
    ternaries += ternaryDelta(text, from, p)
    if (p >= end || !isWhitespace(text[p])) return p
    const q = skipWhitespace(text, p, end)
    if (q >= end || CLOSERS.has(text[q]!)) return p
    const next = text[q]!
    const complete = ternaries <= 0 && !ENDS_INCOMPLETE.has(text[p - 1]!)
      && !ENDS_KEYWORD.test(text.slice(Math.max(i, p - 11), p))
    if (complete && (!PUNCTUATORS.has(next) || next === ':' || text.startsWith('...', q))) return p
    p = q
  }
}

/** Offset of a `//` in `text[start, end)` outside string and template literals, or -1 (Pug rejects it). */
function lineComment(text: string, start: number, end: number): number {
  let from = start
  for (const [s, e] of [...literalSpans(text, [start, end]), [end, end] as const]) {
    const k = text.slice(from, s).indexOf('//')
    if (k >= 0) return from + k
    from = e
  }
  return -1
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
    // As in pug-lexer: a '!' after a key must start '!=', a quoted key is followed by whitespace,
    // an operator, ',' or the end of the block, and a quote does not follow an unquoted key.
    if (!opValue && text[opStart] === '!') {
      errors.push({ code: 'unexpected-character', message: 'Expected "=" after "!"', offset: opStart + 1 })
      pos = opStart + 1
      continue
    }
    const quoted = c === '"' || c === "'"
    if (!opValue && opStart === keyEnd && keyEnd < end && (quoted ? !',)'.includes(text[keyEnd]!) : '\'"`'.includes(text[keyEnd]!))) {
      errors.push({ code: 'unexpected-character', message: 'Expected "=" or whitespace after an attribute key', offset: keyEnd })
    }
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
    const comment = lineComment(text, valueStart, valueEnd)
    if (comment >= 0) {
      errors.push({ code: 'unexpected-character', message: 'A line comment cannot be in an attribute value', offset: comment })
    }
    for (const [ls, le] of literalSpans(text, [valueStart, valueEnd])) {
      const bad = badEscape(text, ls, le)
      if (bad >= 0) errors.push({ code: 'bad-escape', message: 'Invalid escape sequence in a JavaScript string', offset: bad })
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
const MIXIN_NAME = /[-\w]+/y
// As in pug-lexer: a first paren group that starts like `key=` holds attributes, not arguments.
const LOOKS_LIKE_ATTRIBUTES = /^\s*[-\w]+ *=/
const AND_ATTRIBUTES = '&attributes('
/** Error codes meaning a block was not closed before its limit. */
export const UNCLOSED = new Set(['unclosed-attributes', 'unterminated-string'])

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
 * tag lines and for the tag of a `#[…]` interpolation. `named`: the caller has
 * already read a name (a mixin call's), so no tag name is read and attributes
 * may come first.
 */
export function parseTagHead(src: string, start: number, limit: number, named = false): TagHead {
  const errs: PugParseError[] = []
  let pos = start
  let name: Tag['name'] = null
  const tagName = named ? null : matchAt(TAG_NAME, src, pos)
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
    } else if (!named && !name && shorthands.length === 0) {
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
  errs.push(...duplicates(shorthands, attributeBlocks))
  // A mixin call has no self-closing form: its '/' is left for the caller to report.
  if (!named && (name || shorthands.length > 0) && src[pos] === '/' && pos < limit) {
    selfClose = [pos, pos + 1]
    pos++
  }
  return { name, shorthands, attributeBlocks, andAttributes, selfClose, errs, unclosed, pos }
}

/**
 * As in pug-parser: a tag or mixin call may not repeat an attribute name, other than `class`; an id
 * shorthand counts as `id`. A quoted key's name is its content.
 */
function duplicates(shorthands: Tag['shorthands'], blocks: readonly AttributeBlock[]): PugParseError[] {
  const named = [
    ...shorthands.filter((sh) => sh.kind === 'id').map((sh) => ({ name: 'id', offset: sh.range[0] })),
    ...blocks.flatMap((b) => b.attributes).map(({ key }) => {
      const quoted = key.raw.length >= 2 && (key.raw[0] === '"' || key.raw[0] === "'") && key.raw.at(-1) === key.raw[0]
      return { name: quoted ? key.raw.slice(1, -1) : key.raw, offset: key.range[0] }
    }),
  ].sort((a, b) => a.offset - b.offset)
  const seen = new Set<string>()
  const errors: PugParseError[] = []
  for (const { name, offset } of named) {
    if (name === 'class') continue
    if (seen.has(name)) errors.push({ code: 'duplicate-attribute', message: `Duplicate attribute ${JSON.stringify(name)}`, offset })
    seen.add(name)
  }
  return errors
}

export interface MixinHead extends TagHead {
  mixinName: MixinCall['name']
  args: Range | null   // includes the parens
}

/**
 * The mixin call head starting at the '+' at `start`: `+name` (spaces may
 * follow the '+'), an optional `(args)` group, then shorthands, attribute
 * blocks and `&attributes(…)` as in a tag head. Null when no name follows the '+'.
 */
export function parseMixinHead(src: string, start: number, limit: number): MixinHead | null {
  let at = start + 1
  while (at < limit && (src[at] === ' ' || src[at] === '\t')) at++   // as in pug-lexer: `+ name`
  const value = matchAt(MIXIN_NAME, src, at)
  if (!value) return null
  const mixinName = { value, range: [at, at + value.length] as Range }
  let pos = mixinName.range[1]
  let args: Range | null = null
  const errs: PugParseError[] = []
  let unclosed = false
  if (src[pos] === '(') {
    const close = skipExpression(src, pos + 1, limit, { comma: false, whitespace: false }, errs)
    if (close >= limit || src[close] !== ')') {
      unclosed = true
      if (errs.length === 0) {
        errs.push({ code: 'unclosed-arguments', message: 'Mixin arguments are not closed with ")"', offset: pos })
      }
      args = [pos, close]
      pos = close
    } else if (!LOOKS_LIKE_ATTRIBUTES.test(src.slice(pos + 1, close))) {
      args = [pos, close + 1]
      pos = close + 1
    }
  }
  const head = unclosed ? null : parseTagHead(src, pos, limit, true)
  return {
    name: null, shorthands: [], attributeBlocks: [], andAttributes: [], selfClose: null, pos,
    ...head,
    errs: [...errs, ...(head?.errs ?? [])],
    unclosed: unclosed || (head?.unclosed ?? false),
    mixinName, args,
  }
}
