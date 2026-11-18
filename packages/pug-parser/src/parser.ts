import type { AttributeBlock, Comment, PugDocument, PugLine, PugNode, PugParseError, Range, Tag } from './ast.ts'
import { isWhitespace, skipExpression } from './expression.ts'
import { parseAttributeBlock } from './parse-attributes.ts'
import { type RawLine, scanLines } from './scanner.ts'

export interface ParseOptions {
  start?: number
  end?: number
}

/** A line on the indent stack. `node` is null for a line that produced no node. */
interface Open {
  indent: string
  node: Tag | Comment | null
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

/** `inner` is nested under `outer`: `outer` is a strict prefix of `inner`. */
const isDeeper = (inner: string, outer: string): boolean => inner.length > outer.length && inner.startsWith(outer)

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
      if (node?.type === 'Tag') return node.children
    }
    return children
  }

  /** The comment on raw[index] and its block (deeper lines); returns the next raw index. */
  function parseComment(index: number, indent: string, depth: number): { node: Comment; next: number } {
    const line = raw[index]!
    const start = line.indent[1]
    const unbuffered = text.slice(start, line.range[1]).startsWith('//-')
    let end = line.range[1]
    let next = index + 1
    let firstRaw: number | null = null
    for (let j = index + 1; j < raw.length; j++) {
      const l = raw[j]!
      if (l.blank) continue
      if (indentOf(l).length <= indent.length) break
      for (let k = next; k < j; k++) pushLine(raw[k]!, 'blank', 0)
      firstRaw ??= lines.length
      pushLine(l, 'raw', depth + 1, lines.length === firstRaw ? null : firstRaw)
      end = l.range[1]
      next = j + 1
    }
    const content: Range = [start + (unbuffered ? 3 : 2), end]
    return { node: { type: 'Comment', buffered: !unbuffered, range: [start, end], content }, next }
  }

  /**
   * The tag head starting at `start` (name, `.class`/`#id`, attribute blocks,
   * `&attributes(…)`, trailing `/`), reading no further than `limit`. `unclosed`
   * is true when a block or `&attributes` paren is not closed before `limit`.
   */
  function parseHead(start: number, limit: number) {
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

  /**
   * The tag on raw[index]; `last` is the raw index of the head's last line (a
   * multi-line attribute block). An unclosed block is re-read within its first
   * line, so it never swallows the lines after it. The rest of the head's last
   * line is reported as unsupported.
   */
  function parseTag(index: number): { node: Tag | null; last: number } {
    const line = raw[index]!
    const start = line.indent[1]
    let head = parseHead(start, docEnd)
    if (head.unclosed) head = parseHead(start, line.range[1])
    errors.push(...head.errs)
    let last = index
    while (last + 1 < raw.length && raw[last + 1]!.range[0] <= head.pos) last++
    const end = raw[last]!.range[1]
    if (head.pos < end) {
      errors.push({
        code: 'unsupported-syntax',
        message: `Unsupported syntax: ${JSON.stringify(src.slice(head.pos, end))}`,
        offset: head.pos,
      })
    }
    if (!head.name && head.shorthands.length === 0) return { node: null, last }
    const { name, shorthands, attributeBlocks, andAttributes, selfClose } = head
    return {
      node: {
        type: 'Tag', range: [start, end], name, shorthands, attributeBlocks, andAttributes,
        selfClose, dot: null, expansion: null, children: [],
      },
      last,
    }
  }

  /** Line kinds for raw[index + 1 .. last], the continuation of a multi-line tag head. */
  function pushHeadLines(tag: Tag | null, index: number, last: number, depth: number): void {
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
    let node: Tag | Comment | null
    if (text.slice(line.indent[1], line.range[1]).startsWith('//')) {
      const comment = parseComment(i, indent, depth)
      node = comment.node
      i = comment.next
    } else {
      const tag = parseTag(i)
      node = tag.node
      pushHeadLines(node, i, tag.last, depth)
      i = tag.last + 1
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
