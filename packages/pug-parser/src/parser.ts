import type { Comment, PugDocument, PugLine, PugNode, PugParseError, Range, Tag, Text } from './ast.ts'
import { parseTagHead } from './parse-attributes.ts'
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

  /**
   * The tag on raw[index]; `last` is the raw index of the head's last line (a
   * multi-line attribute block). An unclosed block is re-read within its first
   * line, so it never swallows the lines after it. The rest of the head's last
   * line is inline text after a space, a text-block '.', or else unsupported.
   */
  function parseTag(index: number): { node: Tag | null; last: number } {
    const line = raw[index]!
    const start = line.indent[1]
    let head = parseTagHead(src, start, docEnd)
    if (head.unclosed) head = parseTagHead(src, start, line.range[1])
    errors.push(...head.errs)
    let last = index
    while (last + 1 < raw.length && raw[last + 1]!.range[0] <= head.pos) last++
    const end = raw[last]!.range[1]
    const isTag = head.name !== null || head.shorthands.length > 0
    const tailChildren: PugNode[] = []
    let dot: Range | null = null
    const pos = head.pos
    if (pos < end) {
      if (isTag && src[pos] === ' ') {
        const inline = parseInlineText(src, pos, end)
        errors.push(...inline.errors)
        if (inline.node) tailChildren.push(inline.node)
      } else if (isTag && src[pos] === '.' && /^[ \t]*$/.test(src.slice(pos + 1, end))) {
        dot = [pos, pos + 1]
      } else {
        errors.push({
          code: 'unsupported-syntax',
          message: `Unsupported syntax: ${JSON.stringify(src.slice(pos, end))}`,
          offset: pos,
        })
      }
    }
    if (!isTag) return { node: null, last }
    const { name, shorthands, attributeBlocks, andAttributes, selfClose } = head
    return {
      node: {
        type: 'Tag', range: [start, end], name, shorthands, attributeBlocks, andAttributes,
        selfClose, dot, expansion: null, children: tailChildren,
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
    let node: PugNode | null
    const first = src[line.indent[1]]
    if (text.slice(line.indent[1], line.range[1]).startsWith('//')) {
      const comment = parseComment(i, indent, depth)
      node = comment.node
      i = comment.next
    } else if (first === '|' || first === '<') {
      node = parseTextLine(line)
      i++
    } else {
      const tag = parseTag(i)
      const tagNode = tag.node
      node = tagNode
      pushHeadLines(tagNode, i, tag.last, depth)
      i = tag.last + 1
      if (tagNode?.dot) {
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
