import type {
  AttributeBlock, Code, Comment, Control, ControlKeyword, Filter, MixinCall, PugDocument, PugLine, PugNode, PugParseError,
  Range, Tag, Text,
} from './ast.ts'
import { isWhitespace, skipString, skipTemplate } from './expression.ts'
import {
  type MixinHead, parseAttributeBlock, parseMixinHead, parseTagHead, type TagHead, UNCLOSED,
} from './parse-attributes.ts'
import { codeNode, makeText, parseInlineText, rawText, unsupported } from './parse-text.ts'
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
const WORD_KEYWORDS = new Set(['block', 'default', 'include', 'extends', 'extend', 'yield', 'mixin', 'append', 'prepend', 'doctype'])
const KEYWORD = /[a-z]+/y
const ELSE_IF = /^[ \t]+if(?=[ \t(:]|$)/
// Keywords that may be followed directly by ':'. `when`/`default` take a block
// expansion; `include:filter` names a filter; on a conditional Pug rejects it.
const COLON_KEYWORDS = new Set(['when', 'default', 'include', 'if', 'unless', 'else'])
// Keywords whose head is a JS expression (or nothing) where Pug rejects a block expansion.
const NO_EXPANSION = new Set<ControlKeyword>(['if', 'unless', 'else', 'else if', 'while', 'case', 'each', 'for'])
const FILTER_HEAD = /:[\w-]+(?::[\w-]+)*/y

/** A tag or mixin call and the nodes of its block expansion chain, outermost first. */
type Chain = (Tag | MixinCall)[]

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
  // Error-recovery regions [anchor, last]: raw lines anchor+1..last are what the
  // parser did not understand (lines index == raw index, as lines tile the range).
  const regions: [anchor: number, last: number][] = []
  let base: string | null = null          // indent of the first node line: the root level
  let indentUnit: string | null = null

  const indentOf = (l: RawLine): string => text.slice(l.indent[0], l.indent[1])
  const pushLine = (l: RawLine, kind: PugLine['kind'], depth: number, anchor: number | null = null): void => {
    lines.push({ range: l.range, indent: l.indent, kind, depth, anchor })
  }
  const inconsistent = (offset: number, message: string): void => {
    errors.push({ code: 'inconsistent-indentation', message, offset })
  }
  /** Index of the last raw line from raw[from] on that starts at or before `pos`. */
  const lineAt = (pos: number, from: number): number => {
    let k = from
    while (k + 1 < raw.length && raw[k + 1]!.range[0] <= pos) k++
    return k
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

  /**
   * The `-` code line on raw[index]. A `-` alone on its line starts a code
   * block: the deeper lines are `raw` lines and form the expression. Returns
   * the next raw index.
   */
  function parseCodeLine(index: number, indent: string, depth: number): { node: Code; next: number } {
    const line = raw[index]!
    const node = codeNode(src, line.indent[1], line.range[1])
    if (node.expression[0] < node.expression[1]) return { node, next: index + 1 }
    let first: number | null = null
    const next = rawBlock(index + 1, indent, depth, (l) => {
      first ??= l.indent[1]
      node.range = [node.range[0], l.range[1]]
      node.expression = [first, l.range[1]]
    })
    return { node, next }
  }

  /**
   * Index of the first ':' in `[s, e)` outside strings and brackets, or -1.
   * `ternary`: a ':' that closes a top-level `?` (not `?.` / `??`) is skipped.
   */
  function topLevelColon(s: number, e: number, ternary = false): number {
    let depth = 0
    let open = 0    // top-level `?` waiting for their ':'
    for (let i = s; i < e; i++) {
      const c = src[i]
      if (c === '"' || c === "'" || c === '`') {
        const j = c === '`' ? skipTemplate(src, i, e).end : skipString(src, i, e)
        if (j < 0) return -1
        i = j - 1
      } else if (c === '(' || c === '[' || c === '{') {
        depth++
      } else if (c === ')' || c === ']' || c === '}') {
        depth = Math.max(0, depth - 1)
      } else if (ternary && c === '?' && depth === 0) {
        if (src[i + 1] === '?' || (src[i + 1] === '.' && !/[0-9]/.test(src[i + 2] ?? ''))) i++
        else open++
      } else if (c === ':' && depth === 0) {
        if (open === 0) return i
        open--
      }
    }
    return -1
  }

  /**
   * Start of the block expansion child after the ':' at `colon` on raw[index]:
   * Pug's form is ':' and one or more spaces. Otherwise reported as
   * unsupported and -1.
   */
  function expansionStart(colon: number, index: number): number {
    const end = raw[index]!.range[1]
    let s = colon + 1
    while (s < end && (src[s] === ' ' || src[s] === '\t')) s++
    if (src[colon + 1] === ' ' && s < end) return s
    errors.push(unsupported(src, colon, end))
    return -1
  }

  /**
   * The tag or mixin call starting at `start` on raw[index] and its block
   * expansion chain (`li: a: span`), outermost first: each next node is
   * `children[0]` of the one before, whose `expansion` is the ':'. Every node
   * of the chain ends where the chain ends. A loop, not recursion, so a long
   * chain cannot overflow the stack. Empty when no tag starts at `start`.
   * `child`: `start` is itself an expansion child (of a Control).
   */
  function parseChain(start: number, index: number, child = false): { chain: Chain; last: number } {
    const chain: Chain = []
    let last = index
    let s = start
    let colon = -1
    for (;;) {
      const lineEnd = raw[last]!.range[1]
      if ((child || chain.length > 0) && keywordAt(s, lineEnd)) {
        // A control child (`li: if x`) is not modelled; never read it as a tag.
        errors.push(unsupported(src, s, lineEnd))
        break
      }
      const one = parseTag(s, last)
      if (!one.node) break
      const prev = chain[chain.length - 1]
      if (prev?.type === 'Tag') {
        prev.expansion = [colon, colon + 1]
        prev.children.push(one.node)
      }
      chain.push(one.node)
      last = one.last
      colon = one.colon
      if (colon < 0 || (s = expansionStart(colon, last)) < 0) break
    }
    const end = raw[last]!.range[1]
    for (const node of chain) node.range = [node.range[0], end]
    return { chain, last }
  }

  /** The control keyword starting at `start` (in a line ending at `end`), or null when there is none. */
  function keywordAt(start: number, end: number): string | null {
    KEYWORD.lastIndex = start
    const word = KEYWORD.exec(src)?.[0]
    if (!word || !(PAREN_KEYWORDS.has(word) || WORD_KEYWORDS.has(word))) return null
    const c = start + word.length < end ? src[start + word.length] : ''
    const follows = c === '' || c === ' ' || c === '\t' || (c === '(' && PAREN_KEYWORDS.has(word))
      || (c === ':' && COLON_KEYWORDS.has(word))
    return follows ? word : null
  }

  /**
   * The control line on raw[index], or null when its first word is not a
   * keyword. `when`/`default` may end in a block expansion (`when 1: p a`): its
   * chain follows the Control in `chain`, and `last` is the raw index of the
   * line it ends on.
   */
  function parseControl(index: number): { node: Control; chain: Chain; last: number } | null {
    const line = raw[index]!
    const start = line.indent[1]
    const end = line.range[1]
    const word = keywordAt(start, end)
    if (!word) return null
    let after = start + word.length
    // `extend` is Pug's alias of `extends`.
    let keyword = (word === 'extend' ? 'extends' : word) as ControlKeyword
    if (word === 'else') {
      const elseIf = ELSE_IF.exec(src.slice(after, end))
      if (elseIf) {
        keyword = 'else if'
        after += elseIf[0].length
      }
    }
    const node: Control = { type: 'Control', keyword, range: [start, end], head: trimmed(after, end), children: [] }
    if (NO_EXPANSION.has(keyword)) {
      const bad = topLevelColon(after, end, true)
      if (bad >= 0) {
        errors.push({ code: 'unsupported-syntax', message: `Block expansion is not allowed after "${keyword}"`, offset: bad })
      }
    }
    const colon = keyword === 'when' || keyword === 'default' ? topLevelColon(after, end) : -1
    if (colon < 0) return { node, chain: [], last: index }
    node.head = trimmed(after, colon)
    const childStart = expansionStart(colon, index)
    if (childStart < 0) return { node, chain: [], last: index }
    const expansion = parseChain(childStart, index, true)
    node.children.push(...expansion.chain.slice(0, 1))
    node.range = [start, raw[expansion.last]!.range[1]]
    return { node, chain: expansion.chain, last: expansion.last }
  }

  /**
   * The tag or mixin call (`+name…`) starting at `start` on raw[index]; `last`
   * is the raw index of the line it ends on (a multi-line attribute block). An
   * unclosed block is re-read within its first line, so it never swallows the
   * lines after it. The rest of the last line is inline text after a space,
   * `=`/`!=` code, a text-block '.' (tags only), a block expansion ':' (tags
   * without '/' only; `colon` is its offset, else -1), or else unsupported.
   */
  function parseTag(start: number, index: number): { node: Tag | MixinCall | null; last: number; colon: number } {
    const line = raw[index]!
    const read = (limit: number): TagHead | MixinHead =>
      (src[start] === '+' && parseMixinHead(src, start, limit)) || parseTagHead(src, start, limit)
    let head = read(docEnd)
    if (head.unclosed) {
      // Pug reads on to where the first read stopped: an error-recovery region.
      regions.push([index, lineAt(head.pos, index)])
      // A string the first read found unterminated on a later line is the cause: keep that error.
      errors.push(...head.errs.filter((e) => e.code === 'unterminated-string' && e.offset >= line.range[1]))
      head = read(line.range[1])
    }
    errors.push(...head.errs)
    const last = lineAt(head.pos, index)
    const end = raw[last]!.range[1]
    const mixin = 'mixinName' in head
    const isNode = mixin || head.name !== null || head.shorthands.length > 0
    const tailChildren: PugNode[] = []
    let dot: Range | null = null
    let colon = -1
    const pos = head.pos
    if (pos < end) {
      if (isNode && src[pos] === ' ') {
        const inline = parseInlineText(src, pos, end)
        errors.push(...inline.errors)
        if (inline.node) tailChildren.push(inline.node)
      } else if (isNode && (src[pos] === '=' || src.startsWith('!=', pos))) {
        tailChildren.push(codeNode(src, pos, end))
      } else if (isNode && !mixin && src[pos] === '.' && /^[ \t]*$/.test(src.slice(pos + 1, end))) {
        dot = [pos, pos + 1]
      } else if (isNode && !mixin && !head.selfClose && src[pos] === ':') {
        colon = pos
      } else {
        errors.push(unsupported(src, pos, end))
      }
    }
    const { name, shorthands, attributeBlocks, andAttributes, selfClose } = head
    let node: Tag | MixinCall
    if ('mixinName' in head) {
      node = {
        type: 'MixinCall', range: [start, end], name: head.mixinName, args: head.args,
        shorthands, attributeBlocks, andAttributes, children: tailChildren,
      }
    } else if (isNode) {
      node = {
        type: 'Tag', range: [start, end], name, shorthands, attributeBlocks, andAttributes,
        selfClose, dot, expansion: null, children: tailChildren,
      }
    } else {
      return { node: null, last, colon }
    }
    return { node, last, colon }
  }

  /**
   * The filter line on raw[index] (`:name`, nested `:a:b`, attribute blocks,
   * inline text), or null when it does not start with ':' and a name. Its
   * text — inline, or the deeper lines as a raw block — is never interpolated.
   */
  function parseFilter(index: number): { node: Filter; last: number } | null {
    const line = raw[index]!
    const start = line.indent[1]
    FILTER_HEAD.lastIndex = start
    const match = FILTER_HEAD.exec(src)?.[0]
    if (!match) return null
    let pos = start + match.length
    const attributeBlocks: AttributeBlock[] = []
    while (src[pos] === '(') {
      let result = parseAttributeBlock(src, pos, docEnd)
      if (result.errors.some((e) => UNCLOSED.has(e.code))) {
        regions.push([index, lineAt(result.next, index)])
        result = parseAttributeBlock(src, pos, line.range[1])
      }
      attributeBlocks.push(result.block)
      errors.push(...result.errors)
      pos = result.next
    }
    const last = lineAt(pos, index)
    const end = raw[last]!.range[1]
    const children: Text[] = []
    if (pos < end) {
      if (src[pos] === ' ' || src[pos] === '\t') {
        const [s, e] = trimmed(pos, end)
        if (s < e) children.push(rawText('inline', [s, e]))
      } else {
        errors.push(unsupported(src, pos, end))
      }
    }
    const node: Filter = { type: 'Filter', name: match.slice(1), range: [start, end], attributeBlocks, children }
    return { node, last }
  }

  /**
   * Line kinds for raw[index + 1 .. last], the continuation of a multi-line head
   * (`nodes`: those on it). Mixin call arguments are one JS expression: their
   * lines are continuation lines anchored to the line of their '(' (a line
   * starting with their ')' is a paren-close line); a line inside a multi-line
   * attribute is anchored to the line the attribute starts on.
   */
  function pushHeadLines(nodes: readonly (Tag | MixinCall | Filter)[], index: number, last: number, depth: number): void {
    const args: Range[] = nodes.flatMap((n) => (n.type === 'MixinCall' && n.args ? [n.args] : []))
    const spans: Range[] = nodes.flatMap((n) => [
      ...n.attributeBlocks.flatMap((b) => b.attributes.map((a) => a.range)),
      ...('andAttributes' in n ? n.andAttributes.map((a) => a.range) : []),
    ])
    const lineOf = (offset: number, k: number): number => {
      while (k > index && raw[k]!.range[0] > offset) k--
      return k
    }
    for (let k = index + 1; k <= last; k++) {
      const l = raw[k]!
      const lineStart = l.range[0]
      const inside = ([s, e]: Range): boolean => s < lineStart && lineStart < e
      const argList = args.find(inside)
      const span = argList ?? spans.find(inside)
      if (argList && l.indent[1] === argList[1] - 1) {
        pushLine(l, 'paren-close', depth)
      } else if (span) {
        pushLine(l, 'continuation', depth + 1, lineOf(span[0], k))
      } else if (l.blank) {
        pushLine(l, 'blank', 0)
      } else if (src[l.indent[1]] === ')') {
        pushLine(l, 'paren-close', depth)
      } else {
        pushLine(l, 'attribute', depth + 1)
      }
    }
  }

  /**
   * Every line of an error-recovery region becomes a continuation line anchored
   * to the line that started it, so indentation fixes never move what the
   * parser did not understand. Overlapping regions merge into the first.
   */
  function markRegions(): void {
    let anchor = -1
    let last = -1
    for (const [a, l] of regions) {
      if (a > last) anchor = a
      for (let k = Math.max(a, last) + 1; k <= l; k++) {
        lines[k] = { ...lines[k]!, kind: 'continuation', depth: lines[anchor]!.depth + 1, anchor }
      }
      last = Math.max(last, l)
    }
  }

  /**
   * The lines nested under raw[index], which Pug rejects under `what`: one
   * error at the first, then all of them form an error-recovery region.
   * Returns the next raw index.
   */
  function rejectNested(index: number, indent: string, depth: number, what: string): number {
    let reported = false
    const next = rawBlock(index + 1, indent, depth, (l) => {
      if (!reported) errors.push({ code: 'unsupported-syntax', message: `Lines cannot be nested under ${what}`, offset: l.indent[1] })
      reported = true
    })
    if (next > index + 1) regions.push([index, next - 1])
    return next
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
    let chain: Chain = []    // a head's tag/mixin call chain; nested lines join its last node
    const start = line.indent[1]
    const first = src[start]
    let control: ReturnType<typeof parseControl> = null
    let filter: ReturnType<typeof parseFilter> = null
    if (text.slice(start, line.range[1]).startsWith('//')) {
      const comment = parseComment(i, indent, depth)
      node = comment.node
      i = comment.next
    } else if (first === '|' || first === '<') {
      node = parseTextLine(line)
      // Pug rejects lines nested under piped text (under literal HTML they are
      // siblings, which `attach` already does).
      i = first === '|' ? rejectNested(i, indent, depth, 'piped text') : i + 1
    } else if (first === '-') {
      const code = parseCodeLine(i, indent, depth)
      node = code.node
      i = code.next
    } else if (first === '=' || src.startsWith('!=', start)) {
      node = codeNode(src, start, line.range[1])
      i = rejectNested(i, indent, depth, 'buffered code')
    } else if (first === ':' && (filter = parseFilter(i))) {
      const filterNode = filter.node
      node = filterNode
      pushHeadLines([filterNode], i, filter.last, depth)
      i = rawBlock(filter.last + 1, indent, depth, (l) => {
        filterNode.children.push(rawText('block', [l.indent[1], l.range[1]]))
      })
    } else if ((control = parseControl(i))) {
      node = control.node
      chain = control.chain
      pushHeadLines(chain, i, control.last, depth)
      i = control.last + 1
    } else {
      const tag = parseChain(start, i)
      chain = tag.chain
      node = chain[0] ?? null
      pushHeadLines(chain, i, tag.last, depth)
      i = tag.last + 1
    }
    const leaf = chain[chain.length - 1]
    if (leaf?.type === 'Tag' && leaf.dot) {
      i = rawBlock(i, indent, depth, (l) => {
        const content: Range = [l.indent[1], l.range[1]]
        leaf.children.push(textNode('block', content, content))
      })
    }
    if (node) siblings.push(node)
    stack.push({ indent, node: leaf ?? node })
  }

  markRegions()

  const firstEol = raw.find((l) => l.eol !== '')?.eol
  return {
    type: 'Document', text, range: [docStart, docEnd], children, errors, lines,
    eol: firstEol === '\r\n' ? '\r\n' : '\n',
    indentUnit: indentUnit ?? '  ',
  }
}
