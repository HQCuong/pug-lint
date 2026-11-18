// CST -> vue-eslint-parser intermediate tokens (StartTag/EndTag/Text/Mustache) plus the
// low-level tokens and comments that end up in `templateBody.tokens` / `.comments`.
// Mapping table: plan Design §3. Imports nothing from ESLint or Vue (bundled into the CJS tokenizer).
import type { Attribute, AttributeValue, Comment, Filter, PugNode, Range, Tag, Text } from '@pug-lint/parser'
import type { LineIndex, Position } from './line-index.ts'

export interface SourceLocation {
  start: Position
  end: Position
}

interface Located {
  range: Range
  loc: SourceLocation
}

/** A low-level token (`templateBody.tokens`) or comment (`templateBody.comments`). */
export interface Token extends Located {
  type: string
  value: string
}

export interface VIdentifier extends Located {
  type: 'VIdentifier'
  parent: VAttribute | null
  name: string
  rawName: string
}

export interface VLiteral extends Located {
  type: 'VLiteral'
  parent: VAttribute | null
  value: string
}

export interface VAttribute extends Located {
  type: 'VAttribute'
  /** Replaced by vue-eslint-parser with the element's start tag. */
  parent: object
  directive: false
  key: VIdentifier
  value: VLiteral | null
}

export interface StartTagToken extends Located {
  type: 'StartTag'
  name: string
  rawName: string
  selfClosing: boolean
  attributes: VAttribute[]
}

export interface EndTagToken extends Located {
  type: 'EndTag'
  name: string
}

export interface TextToken extends Located {
  type: 'Text'
  value: string
}

export interface MustacheToken extends Located {
  type: 'Mustache'
  /** The expression text, with `\r\n` folded to `\n` like the text vue-eslint-parser's own tokenizer sees. */
  value: string
  startToken: Token
  endToken: Token
}

export type IntermediateToken = StartTagToken | EndTagToken | TextToken | MustacheToken

export interface EmitContext {
  /** The full SFC text; all ranges are offsets into it. */
  text: string
  lines: LineIndex
  tokens: Token[]
  comments: Token[]
  /** Read when text is emitted: vue-eslint-parser turns expressions off inside `v-pre`. */
  expressionEnabled(): boolean
  /** Reports a problem at `offset` as a `Pug: ` parse error. */
  error(message: string, offset: number): void
}

// vue-eslint-parser's HTML_VOID_ELEMENT_TAGS: elements it never pushes on its stack.
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
])
// vue-eslint-parser's HTML_CAN_BE_LEFT_OPEN_TAGS, HTML_NON_FHRASING_TAGS and DT_DD: a start tag
// closes the open element early (`closeCurrentElementIfNecessary`), as in HTML.
const CAN_BE_LEFT_OPEN = new Set(['colgroup', 'li', 'options', 'p', 'td', 'tfoot', 'th', 'thead', 'tr', 'source'])
const NON_PHRASING = new Set([
  'address', 'article', 'aside', 'base', 'blockquote', 'body', 'caption', 'col', 'colgroup', 'dd', 'details',
  'dialog', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5',
  'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'legend', 'li', 'menuitem', 'meta', 'optgroup', 'option',
  'param', 'rp', 'rt', 'source', 'style', 'summary', 'tbody', 'td', 'tfoot', 'th', 'thead', 'title', 'tr', 'track',
])
const DT_DD = /^d[dt]$/u
// Elements whose text is not scanned for mustaches (Vue does interpolate inside `textarea`).
const RAW_TEXT_ELEMENTS = new Set(['script', 'style'])
const QUOTES = new Set(['"', "'"])
const PLACEHOLDER_PARENT = Object.freeze({})
const MUSTACHE = /\{\{([\s\S]*?)\}\}/g

const foldCrlf = (s: string): string => s.replace(/\r\n/g, '\n')

/** Offset of the quote closing the string that opens at `open`, before `end`; -1 if none. */
function closingQuote(text: string, open: number, end: number): number {
  for (let i = open + 1; i < end; i++) {
    if (text[i] === '\\') i++
    else if (text[i] === text[open]) return i
  }
  return -1
}

/** End offset of `node` and everything nested in it. */
function lastEnd(node: PugNode): number {
  let end = node.range[1]
  const children = (node as { children?: PugNode[] }).children ?? []
  for (const child of children) end = Math.max(end, lastEnd(child))
  return end
}

/** An element we opened and vue-eslint-parser still has open. */
interface OpenElement {
  /** Tag names are compared by raw name, as vue-eslint-parser does in a `.vue` file. */
  rawName: string
}

export class Emitter {
  /**
   * Mirror of vue-eslint-parser's element stack below the root `<template>`. Empty = text would
   * land in the root template, where a `Text` token makes vue-eslint-parser run the tokenizer again.
   */
  private readonly open: OpenElement[] = []

  constructor(private readonly ctx: EmitContext) {}

  private loc(start: number, end: number): Located {
    return { range: [start, end], loc: { start: this.ctx.lines.locOf(start), end: this.ctx.lines.locOf(end) } }
  }

  private token(type: string, [start, end]: Range): Token {
    const token = { type, value: this.ctx.text.slice(start, end), ...this.loc(start, end) }
    this.ctx.tokens.push(token)
    return token
  }

  /** Raw text of `range` as one `Text`, with no mustache scan; at the template root only a token. */
  private *plainText(range: Range): Generator<IntermediateToken> {
    if (range[0] >= range[1]) return
    const token = this.token('HTMLText', range)
    if (this.open.length > 0) yield { type: 'Text', value: token.value, ...this.loc(...range) }
  }

  /** What vue-eslint-parser's `closeCurrentElementIfNecessary` does before it opens `rawName`. */
  private closeEarly(rawName: string): void {
    const current = this.open.at(-1)
    if (!current) return
    const close = (): void => void this.open.pop()
    if (current.rawName === 'p' && NON_PHRASING.has(rawName)) close()
    if (current.rawName === rawName && CAN_BE_LEFT_OPEN.has(rawName)) close()
    if (DT_DD.test(current.rawName) && DT_DD.test(rawName)) close()
  }

  *nodes(nodes: readonly PugNode[], raw: boolean): Generator<IntermediateToken> {
    for (const node of nodes) yield* this.node(node, raw)
  }

  private *node(node: PugNode, raw: boolean): Generator<IntermediateToken> {
    switch (node.type) {
      case 'Tag':
        yield* this.tag(node)
        return
      case 'Text':
        yield* this.text(node, raw)
        return
      case 'Comment':
        this.comment(node)
        return
      case 'Control':
        this.token('PugControl', node.range)
        yield* this.nodes(node.children, raw)
        return
      case 'Code':
        this.token('PugCode', node.range)
        yield* this.nodes(node.children, raw)
        return
      case 'MixinCall':
        this.token('PugMixinCall', node.range)
        yield* this.nodes(node.children, raw)
        return
      case 'Filter':
        yield* this.filter(node)
        return
      default: {
        // A node type added to the parser later: no head token, children flattened.
        const children = (node as { children?: PugNode[] }).children
        if (Array.isArray(children)) yield* this.nodes(children, raw)
      }
    }
  }

  private *tag(tag: Tag): Generator<IntermediateToken> {
    const rawName = tag.name?.value ?? 'div'
    const name = rawName.toLowerCase()
    const head: Range[] = []
    if (tag.name) head.push(this.token('HTMLTagOpen', tag.name.range).range)
    for (const s of tag.shorthands) head.push(this.token(s.kind === 'class' ? 'PugClassShorthand' : 'PugIdShorthand', s.range).range)
    const attributes: VAttribute[] = []
    for (const block of tag.attributeBlocks) {
      head.push(block.range)
      for (const attribute of block.attributes) attributes.push(this.attribute(attribute))
    }
    for (const and of tag.andAttributes) head.push(this.token('PugAndAttributes', and.range).range)
    if (tag.selfClose) head.push(this.token('HTMLSelfClosingTagClose', tag.selfClose).range)
    const start = head.length > 0 ? Math.min(...head.map((r) => r[0])) : tag.range[0]
    const end = head.length > 0 ? Math.max(...head.map((r) => r[1])) : tag.range[0]
    const selfClosing = tag.selfClose !== null || VOID_ELEMENTS.has(rawName)
    this.closeEarly(rawName)
    yield { type: 'StartTag', name, rawName, selfClosing, attributes, ...this.loc(start, end) }
    const element: OpenElement = { rawName }
    if (!selfClosing) this.open.push(element)
    yield* this.nodes(tag.children, RAW_TEXT_ELEMENTS.has(name))
    // An element vue-eslint-parser already closed gets no end tag (it would be `x-invalid-end-tag`).
    if (this.open.at(-1) === element) {
      this.open.pop()
      const close = lastEnd(tag)
      yield { type: 'EndTag', name, ...this.loc(close, close) }
    }
  }

  private attribute(attribute: Attribute): VAttribute {
    const { key: rawKey, operator, value: rawValue } = attribute
    this.token('HTMLIdentifier', rawKey.range)
    if (operator) this.token('HTMLAssociation', operator.range)
    const key: VIdentifier = {
      type: 'VIdentifier', parent: null, name: rawKey.raw.toLowerCase(), rawName: rawKey.raw, ...this.loc(...rawKey.range),
    }
    const value = rawValue ? this.literal(rawValue, rawKey.raw) : null
    const node: VAttribute = {
      type: 'VAttribute', parent: PLACEHOLDER_PARENT, directive: false, key, value, ...this.loc(...attribute.range),
    }
    key.parent = node
    if (value) value.parent = node
    return node
  }

  /**
   * vue-eslint-parser treats a value whose first character is `"` or `'` as quoted: it parses
   * `value` one character after the range start. So:
   * - string → full range incl. quotes, value = inner text;
   * - template without substitution → range = inner (backticks excluded), value = inner text, so a
   *   directive's expression is parsed at exact positions; when the inner text itself starts with a
   *   quote, the full range incl. backticks instead (parsed as a template literal, still exact);
   * - expression starting with a quote (`"a" + b`) → a `Pug:` error, and an empty VLiteral over the
   *   leading string only (`"a"`): vue-eslint-parser then builds an empty expression with its quote
   *   tokens in place, where any other value would be parsed at wrong positions. Unterminated (the
   *   parser already reported it) → no value;
   * - anything else → full range, value = raw text (best effort: a Pug compile-time expression).
   */
  private literal(v: AttributeValue, keyRaw: string): VLiteral | null {
    const { text } = this.ctx
    let range = v.range
    let value = v.raw
    if (v.kind === 'string' && v.inner) value = text.slice(...v.inner)
    else if (v.kind === 'template' && !v.hasSubstitution && v.inner && !QUOTES.has(text[v.inner[0]]!)) {
      range = v.inner
      value = text.slice(...v.inner)
    } else if (v.kind === 'expression' && QUOTES.has(text[v.range[0]]!)) {
      const close = closingQuote(text, v.range[0], v.range[1])
      if (close === -1) return null
      this.ctx.error(`the value of attribute "${keyRaw}" starts with a quote but is not a single string; it is not linted`, v.range[0])
      range = [v.range[0], close + 1]
      value = ''
    }
    this.token('HTMLLiteral', range)
    return { type: 'VLiteral', parent: null, value: foldCrlf(value), ...this.loc(...range) }
  }

  private *text(node: Text, raw: boolean): Generator<IntermediateToken> {
    for (const part of node.parts) {
      if (part.type === 'Raw') yield* raw ? this.plainText(part.range) : this.mustacheText(part.range)
      else if (part.type === 'Interpolation') this.token('PugInterpolation', part.range)
      else yield* this.tag(part.tag)
    }
  }

  /** Text with `{{ … }}` split out as mustaches (unless expressions are off, as inside `v-pre`). */
  private *mustacheText([start, end]: Range): Generator<IntermediateToken> {
    if (!this.ctx.expressionEnabled()) {
      yield* this.plainText([start, end])
      return
    }
    const source = this.ctx.text.slice(start, end)
    let last = start
    for (const match of source.matchAll(MUSTACHE)) {
      const open = start + match.index
      const close = open + match[0].length
      yield* this.plainText([last, open])
      const startToken = this.token('VExpressionStart', [open, open + 2])
      const endToken = this.token('VExpressionEnd', [close - 2, close])
      yield { type: 'Mustache', value: foldCrlf(match[1]!), startToken, endToken, ...this.loc(open, close) }
      last = close
    }
    yield* this.plainText([last, end])
  }

  private comment(node: Comment): void {
    this.ctx.comments.push({
      type: 'HTMLComment', value: this.ctx.text.slice(...node.content), ...this.loc(...node.range),
    })
  }

  private *filter(node: Filter): Generator<IntermediateToken> {
    // Head: ':' + name, then any attribute blocks.
    const headEnd = Math.max(node.range[0] + 1 + node.name.length, ...node.attributeBlocks.map((b) => b.range[1]))
    this.token('PugFilter', [node.range[0], Math.min(headEnd, node.range[1])])
    for (const child of node.children) yield* this.text(child, true)
  }
}
