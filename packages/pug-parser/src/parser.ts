import type {
  Code, Comment, Control, ControlKeyword, MixinCall, PugDocument, PugLine, PugNode, PugParseError, Range, Tag, Text,
} from './ast.ts'
import { isWhitespace } from './expression.ts'
import { type MixinHead, parseMixinHead, parseTagHead, type TagHead } from './parse-attributes.ts'
import { makeText, parseInlineText } from './parse-text.ts'
import { type RawLine, scanLines } from './scanner.ts'

export interface ParseOptions {
  start?: number
  end?: number
}

/** A line on the indent stack. `node` is null for a line that produced no node. */
interface Open {
  indent: string
  node: PugNode | null
}

/** `inner` is nested under `outer`: `outer` is a strict prefix of `inner`. */
const isDeeper = (inner: string, outer: string): boolean => inner.length > outer.length && inner.startsWith(outer)

// Control keywords: those in PAREN_KEYWORDS may be followed by whitespace, '(' or
// the end of the line; the others only by whitespace or the end of the line.
// Anything else ("if-ok", "block.x", "default-slot") makes the word a tag name.
const PAREN_KEYWORDS = new Set(['if', 'unless', 'while', 'each', 'for', 'case', 'when', 'else'])
const WORD_KEYWORDS = new Set(['block', 'default', 'include', 'extends', 'yield', 'mixin', 'append', 'prepend', 'doctype'])
const KEYWORD = /[a-z]+/y
const ELSE_IF = /^[ \t]+if(?=[ \t(]|$)/

/** A node whose `children` take the lines nested under it. */
const isParent = (node: PugNode | null): node is Tag | MixinCall | Control | Code =>
  node?.type === 'Tag' || node?.type === 'MixinCall' || node?.type === 'Control' || node?.type === 'Code'

/**
 * Parse the Pug source `text[start, end)` into a concrete syntax tree. All ranges
 * are offsets into `text`. Never throws: input it cannot parse becomes an entry
 * in `errors`.
 */
export function parsePug(text: string, options: ParseOptions = {}): PugDocument {
  const docStart = Math.min(Math.max(options.start ?? 0, 0), text.length)
  const docEnd = Math.min(Math.max(options.end ?? text.length, docStart), text.length)
  const raw = scanLines(text, docStart, docEnd)
  // Scanning `src` instead of `text` keeps every lookahead (regex, startsWith) inside the range.
  const src = docEnd === text.length ? text : text.slice(0, docEnd)
  const children: PugNode[] = []
  const errors: PugParseError[] = []
  const lines: PugLine[] = []
  const stack: Open[] = []
  let base: string | null = null          // indent of the first node line: the root level
  let indentUnit: string | null = null

  const indentOf = (l: RawLine): string => text.slice(l.indent[0], l.indent[1])
  const pushLine = (l: RawLine, kind: PugLine['kind'], depth: number, anchor: number | null = null): void => {
    lines.push({ range: l.range, indent: l.indent, kind, depth, anchor })
  }
  const inconsistent = (offset: number, message: string): void => {
    errors.push({ code: 'inconsistent-indentation', message, offset })
  }

  /** Pop the stack down to this line's parent level and return the node list it joins. */
  function attach(indent: string, offset: number): PugNode[] {
    base ??= indent
    if (!indent.startsWith(base)) {
      inconsistent(offset, 'Line is dedented below the template\'s base indentation')
      stack.length = 0
    } else {
      let popped: Open | null = null
      while (stack.length > 0 && !isDeeper(indent, stack[stack.length - 1]!.indent)) popped = stack.pop()!
      if (popped && popped.indent !== indent) {
        inconsistent(offset, 'Line does not match the indentation of any enclosing block')
      }
    }
    const top = stack[stack.length - 1]
    if (top && indentUnit === null) indentUnit = indent.slice(top.indent.length)
    for (let k = stack.length - 1; k >= 0; k--) {
      const node = stack[k]!.node
      if (isParent(node)) return node.children
    }
    return children
  }

  /**
   * The raw block from raw[from] on: the lines indented deeper than `indent`
   * (blank lines between them included). Each non-blank line is pushed as a
   * `raw` line anchored to the block's first line and handed to `onLine`.
   * Returns the next raw index.
   */
  function rawBlock(from: number, indent: string, depth: number, onLine: (l: RawLine) => void): number {
    let next = from
    let firstRaw: number | null = null
    for (let j = from; j < raw.length; j++) {
      const l = raw[j]!
      if (l.blank) continue
      if (indentOf(l).length <= indent.length) break
      for (let k = next; k < j; k++) pushLine(raw[k]!, 'blank', 0)
      firstRaw ??= lines.length
      pushLine(l, 'raw', depth + 1, lines.length === firstRaw ? null : firstRaw)
      onLine(l)
      next = j + 1
    }
    return next
  }

  /** The comment on raw[index] and its block (deeper lines); returns the next raw index. */
  function parseComment(index: number, indent: string, depth: number): { node: Comment; next: number } {
    const line = raw[index]!
    const start = line.indent[1]
    const unbuffered = text.slice(start, line.range[1]).startsWith('//-')
    let end = line.range[1]
    const next = rawBlock(index + 1, indent, depth, (l) => {
      end = l.range[1]
    })
    const content: Range = [start + (unbuffered ? 3 : 2), end]
    return { node: { type: 'Comment', buffered: !unbuffered, range: [start, end], content }, next }
  }

  /** A Text node of `form` for the content `content`; its errors join the document's. */
  function textNode(form: Text['form'], range: Range, content: Range): Text {
    const result = makeText(src, form, range, content)
    errors.push(...result.errors)
    return result.node
  }

  /** The pipe line (`| text`) or literal HTML line (`<…`) on `line`. */
  function parseTextLine(line: RawLine): Text {
    const start = line.indent[1]
    const end = line.range[1]
    if (src[start] === '<') return textNode('html', [start, end], [start, end])
    const contentStart = Math.min(start + (src[start + 1] === ' ' ? 2 : 1), end)
    return textNode('pipe', [start, end], [contentStart, end])
  }

  /** Spaces/tabs skipped forward from `s` and whitespace trimmed back from `e`. */
  function trimmed(s: number, e: number): Range {
    while (s < e && (src[s] === ' ' || src[s] === '\t')) s++
    while (e > s && isWhitespace(src[e - 1])) e--
    return [s, e]
  }

  /** The `- x`, `= x` or `!= x` code whose operator starts at `start`, through `end`. */
  function codeNode(start: number, end: number): Code {
    const op = src[start] === '-' ? '-' : src[start] === '=' ? '=' : '!='
    return {
      type: 'Code', buffered: op !== '-', escaped: op === '=', range: [start, end],
      expression: trimmed(start + op.length, end), children: [],
    }
  }

  /**
   * The `-` code line on raw[index]. A `-` alone on its line starts a code
   * block: the deeper lines are `raw` lines and form the expression. Returns
   * the next raw index.
   */
  function parseCodeLine(index: number, indent: string, depth: number): { node: Code; next: number } {
    const line = raw[index]!
    const node = codeNode(line.indent[1], line.range[1])
    if (node.expression[0] < node.expression[1]) return { node, next: index + 1 }
    let first: number | null = null
    const next = rawBlock(index + 1, indent, depth, (l) => {
      first ??= l.indent[1]
      node.range = [node.range[0], l.range[1]]
      node.expression = [first, l.range[1]]
    })
    return { node, next }
  }

  /** The control line starting at `start` (ending at `end`), or null when its first word is not a keyword. */
  function parseControl(start: number, end: number): Control | null {
    KEYWORD.lastIndex = start
    const word = KEYWORD.exec(src)?.[0]
    if (!word || !(PAREN_KEYWORDS.has(word) || WORD_KEYWORDS.has(word))) return null
    let after = start + word.length
    const c = after < end ? src[after] : ''
    if (!(c === '' || c === ' ' || c === '\t' || (c === '(' && PAREN_KEYWORDS.has(word)))) return null
    let keyword = word as ControlKeyword
    if (word === 'else') {
      const elseIf = ELSE_IF.exec(src.slice(after, end))
      if (elseIf) {
        keyword = 'else if'
        after += elseIf[0].length
      }
    }
    return { type: 'Control', keyword, range: [start, end], head: trimmed(after, end), children: [] }
  }

  /**
   * The tag or mixin call (`+name…`) on raw[index]; `last` is the raw index of
   * the head's last line (a multi-line attribute block). An unclosed block is
   * re-read within its first line, so it never swallows the lines after it. The
   * rest of the head's last line is inline text after a space, `=`/`!=` code, a
   * text-block '.' (tags only), or else unsupported.
   */
  function parseTag(index: number): { node: Tag | MixinCall | null; last: number } {
    const line = raw[index]!
    const start = line.indent[1]
    const read = (limit: number): TagHead | MixinHead =>
      (src[start] === '+' && parseMixinHead(src, start, limit)) || parseTagHead(src, start, limit)
    let head = read(docEnd)
    if (head.unclosed) head = read(line.range[1])
    errors.push(...head.errs)
    let last = index
    while (last + 1 < raw.length && raw[last + 1]!.range[0] <= head.pos) last++
    const end = raw[last]!.range[1]
    const mixin = 'mixinName' in head
    const isNode = mixin || head.name !== null || head.shorthands.length > 0
    const tailChildren: PugNode[] = []
    let dot: Range | null = null
    const pos = head.pos
    if (pos < end) {
      if (isNode && src[pos] === ' ') {
        const inline = parseInlineText(src, pos, end)
        errors.push(...inline.errors)
        if (inline.node) tailChildren.push(inline.node)
      } else if (isNode && (src[pos] === '=' || src.startsWith('!=', pos))) {
        tailChildren.push(codeNode(pos, end))
      } else if (isNode && !mixin && src[pos] === '.' && /^[ \t]*$/.test(src.slice(pos + 1, end))) {
        dot = [pos, pos + 1]
      } else {
        errors.push({
          code: 'unsupported-syntax',
          message: `Unsupported syntax: ${JSON.stringify(src.slice(pos, end))}`,
          offset: pos,
        })
      }
    }
    const { name, shorthands, attributeBlocks, andAttributes, selfClose } = head
    if ('mixinName' in head) {
      return {
        node: {
          type: 'MixinCall', range: [start, end], name: head.mixinName, args: head.args,
          shorthands, attributeBlocks, andAttributes, children: tailChildren,
        },
        last,
      }
    }
    if (!isNode) return { node: null, last }
    return {
      node: {
        type: 'Tag', range: [start, end], name, shorthands, attributeBlocks, andAttributes,
        selfClose, dot, expansion: null, children: tailChildren,
      },
      last,
    }
  }

  /** Line kinds for raw[index + 1 .. last], the continuation of a multi-line tag head. */
  function pushHeadLines(tag: Tag | MixinCall | null, index: number, last: number, depth: number): void {
    const spans: Range[] = tag
      ? [...tag.attributeBlocks.flatMap((b) => b.attributes.map((a) => a.range)), ...tag.andAttributes.map((a) => a.range)]
      : []
    for (let k = index + 1; k <= last; k++) {
      const l = raw[k]!
      const lineStart = l.range[0]
      const span = spans.find(([s, e]) => s < lineStart && lineStart < e)
      if (span) {
        let anchor = k
        while (anchor > index && raw[anchor]!.range[0] > span[0]) anchor--
        pushLine(l, 'continuation', depth + 1, anchor)
      } else if (l.blank) {
        pushLine(l, 'blank', 0)
      } else if (src[l.indent[1]] === ')') {
        pushLine(l, 'paren-close', depth)
      } else {
        pushLine(l, 'attribute', depth + 1)
      }
    }
  }

  let i = 0
  while (i < raw.length) {
    const line = raw[i]!
    if (line.blank) {
      pushLine(line, 'blank', 0)
      i++
      continue
    }
    const indent = indentOf(line)
    const siblings = attach(indent, line.indent[1])
    const depth = stack.length
    pushLine(line, 'node', depth)
    let node: PugNode | null
    const start = line.indent[1]
    const first = src[start]
    let control: Control | null = null
    if (text.slice(start, line.range[1]).startsWith('//')) {
      const comment = parseComment(i, indent, depth)
      node = comment.node
      i = comment.next
    } else if (first === '|' || first === '<') {
      node = parseTextLine(line)
      i++
    } else if (first === '-') {
      const code = parseCodeLine(i, indent, depth)
      node = code.node
      i = code.next
    } else if (first === '=' || src.startsWith('!=', start)) {
      node = codeNode(start, line.range[1])
      i++
    } else if ((control = parseControl(start, line.range[1]))) {
      node = control
      i++
    } else {
      const tag = parseTag(i)
      const tagNode = tag.node
      node = tagNode
      pushHeadLines(tagNode, i, tag.last, depth)
      i = tag.last + 1
      if (tagNode?.type === 'Tag' && tagNode.dot) {
        i = rawBlock(i, indent, depth, (l) => {
          const content: Range = [l.indent[1], l.range[1]]
          tagNode.children.push(textNode('block', content, content))
        })
      }
    }
    if (node) siblings.push(node)
    stack.push({ indent, node })
  }

  const firstEol = raw.find((l) => l.eol !== '')?.eol
  return {
    type: 'Document', text, range: [docStart, docEnd], children, errors, lines,
    eol: firstEol === '\r\n' ? '\r\n' : '\n',
    indentUnit: indentUnit ?? '  ',
  }
}
