import type { Comment, PugDocument, PugLine, PugNode, PugParseError, Range, Tag } from './ast.ts'
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

  /** A tag head (name, `.class`, `#id`); the rest of the line is reported as unsupported. */
  function parseTag(line: RawLine): Tag | null {
    const [start, end] = [line.indent[1], line.range[1]]
    const s = text.slice(start, end)
    let pos = 0
    let name: Tag['name'] = null
    const tagName = matchAt(TAG_NAME, s, pos)
    if (tagName) {
      name = { value: tagName, range: [start, start + tagName.length] }
      pos = tagName.length
    }
    const shorthands: Tag['shorthands'] = []
    for (;;) {
      const sigil = s[pos]
      if (sigil !== '.' && sigil !== '#') break
      const value = matchAt(sigil === '.' ? CLASS_NAME : ID_NAME, s, pos + 1)
      if (!value) break
      const kind = sigil === '.' ? 'class' : 'id'
      shorthands.push({ kind, value, range: [start + pos, start + pos + 1 + value.length] })
      pos += 1 + value.length
    }
    if (pos < s.length) {
      errors.push({
        code: 'unsupported-syntax', message: `Unsupported syntax: ${JSON.stringify(s.slice(pos))}`, offset: start + pos,
      })
    }
    if (!name && shorthands.length === 0) return null
    return {
      type: 'Tag', range: [start, end], name, shorthands, attributeBlocks: [], andAttributes: [],
      selfClose: null, dot: null, expansion: null, children: [],
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
      node = parseTag(line)
      i++
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
