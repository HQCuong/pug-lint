import type { AttributeBlock, MixinCall, PugDocument, PugNode, Range, Tag } from '../src/ast.ts'

/** Range of the nth (0-based) occurrence of `needle` in `text`. Throws if absent. */
export function at(text: string, needle: string, nth = 0): Range {
  let index = -1
  for (let n = 0; n <= nth; n++) {
    index = text.indexOf(needle, index + 1)
    if (index === -1) throw new Error(`at(): occurrence ${nth} of ${JSON.stringify(needle)} not found`)
  }
  return [index, index + needle.length]
}

/** Convert every EOL (`\r\n`, `\r`, `\n`) to `\r\n`. */
export function toCRLF(s: string): string {
  return s.replace(/\r\n|\r|\n/g, '\r\n')
}

type Container = PugNode | PugDocument | Tag

function children(node: Container): readonly (PugNode | Tag)[] {
  if (node.type === 'Text') {
    return node.parts.flatMap((p) => (p.type === 'TagInterpolation' ? [p.tag] : []))
  }
  return 'children' in node ? node.children : []
}

/** A node's own sub-ranges (not its children): [field, range, must lie inside the node's range]. */
function subRanges(node: PugNode | Tag): [string, Range, boolean][] {
  const out: [string, Range, boolean][] = []
  const blocks = (list: readonly AttributeBlock[]): void => {
    list.forEach((b, i) => {
      out.push([`attributeBlocks[${i}].range`, b.range, false])
      b.commas.forEach((c, j) => out.push([`attributeBlocks[${i}].commas[${j}]`, c, false]))
      b.attributes.forEach((a, j) => {
        const f = `attributeBlocks[${i}].attributes[${j}]`
        out.push([`${f}.range`, a.range, false], [`${f}.key.range`, a.key.range, false])
        if (a.operator) out.push([`${f}.operator.range`, a.operator.range, false])
        if (a.value) {
          out.push([`${f}.value.range`, a.value.range, false])
          if (a.value.inner) out.push([`${f}.value.inner`, a.value.inner, false])
        }
      })
    })
  }
  const heads = (n: Tag | MixinCall): void => {
    if (n.name) out.push(['name.range', n.name.range, false])
    n.shorthands.forEach((s, i) => out.push([`shorthands[${i}].range`, s.range, false]))
    n.andAttributes.forEach((a, i) => {
      out.push([`andAttributes[${i}].range`, a.range, false], [`andAttributes[${i}].expression`, a.expression, false])
    })
    blocks(n.attributeBlocks)
  }
  switch (node.type) {
    case 'Tag':
      heads(node)
      for (const f of ['selfClose', 'dot', 'expansion'] as const) {
        const r = node[f]
        if (r) out.push([f, r, false])
      }
      break
    case 'MixinCall':
      heads(node)
      if (node.args) out.push(['args', node.args, false])
      break
    case 'Text':
      out.push(['content', node.content, true])
      node.parts.forEach((p, i) => {
        out.push([`parts[${i}].range`, p.range, true])
        if (p.type === 'Interpolation') out.push([`parts[${i}].expression`, p.expression, true])
      })
      break
    case 'Comment':
      out.push(['content', node.content, true])
      break
    case 'Code':
      out.push(['expression', node.expression, false])
      break
    case 'Control':
      out.push(['head', node.head, true])
      break
    case 'Filter':
      blocks(node.attributeBlocks)
      break
  }
  return out
}

function label(doc: PugDocument, node: Container): string {
  const [s, e] = node.range
  return `${node.type} [${s}, ${e}] ${JSON.stringify(doc.text.slice(s, Math.min(e, s + 30)))}`
}

/**
 * Throws with a message naming the offending node when the CST breaks a
 * structural invariant:
 * - `doc.range` lies within [0, text.length]; every error offset lies in `doc.range`;
 * - every node range, and every sub-range of a node (name, shorthands, attribute
 *   blocks/attributes/keys/operators/values/commas, `&attributes`, selfClose, dot,
 *   expansion, args, Text content/parts, Comment content, Code expression,
 *   Control head), lies inside `doc.range` and has start <= end; Text content and
 *   parts, Comment content and Control head also lie inside their node's range;
 * - a child starts at or after its previous sibling's end;
 * - a child lies inside its parent's extent: from the parent's start to the
 *   start of the parent's next sibling (or the end of the grandparent's extent);
 * - `doc.lines` tile `doc.range`: first starts at `doc.range[0]`, each next one
 *   starts right after the previous one's EOL, the last ends at `doc.range[1]`,
 *   and each `indent` is a whitespace prefix of its line;
 * - every non-null `anchor` is the index of an earlier line.
 * A `TagInterpolation`'s tag is checked as a child of its `Text`.
 */
export function assertInvariants(doc: PugDocument): void {
  const [docStart, docEnd] = doc.range
  const fail = (node: Container, why: string): never => {
    throw new Error(`CST invariant violated by ${label(doc, node)}: ${why}`)
  }

  const visit = (parent: Container, extentEnd: number): void => {
    const kids = children(parent)
    let prevEnd = parent.range[0]
    let prev: Container | null = null
    kids.forEach((child, i) => {
      const [s, e] = child.range
      if (s > e) fail(child, 'range start is after its end')
      if (s < docStart || e > docEnd) fail(child, `range is outside doc.range [${docStart}, ${docEnd}]`)
      for (const [field, [fs, fe], inside] of subRanges(child)) {
        if (fs > fe || fs < docStart || fe > docEnd) {
          fail(child, `${field} [${fs}, ${fe}] is outside doc.range [${docStart}, ${docEnd}]`)
        }
        if (inside && (fs < s || fe > e)) fail(child, `${field} [${fs}, ${fe}] is outside the node's own range`)
      }
      if (s < parent.range[0] || e > extentEnd) {
        fail(child, `outside its parent's extent [${parent.range[0]}, ${extentEnd}] (parent ${label(doc, parent)})`)
      }
      if (prev && s < prevEnd) fail(child, `starts before its previous sibling ends (sibling ${label(doc, prev)})`)
      const next = kids[i + 1]
      visit(child, next ? Math.max(next.range[0], e) : extentEnd)
      prevEnd = e
      prev = child
    })
  }
  if (docStart < 0 || docStart > docEnd || docEnd > doc.text.length) {
    fail(doc, `doc.range is not within [0, text.length = ${doc.text.length}]`)
  }
  doc.errors.forEach((err, i) => {
    if (err.offset < docStart || err.offset > docEnd) {
      fail(doc, `errors[${i}] (${err.code}) offset ${err.offset} is outside doc.range [${docStart}, ${docEnd}]`)
    }
  })
  visit(doc, docEnd)

  const { lines, text } = doc
  if (lines.length === 0) fail(doc, 'lines are empty, so they do not tile doc.range')
  let expected = docStart
  lines.forEach((line, i) => {
    const [s, e] = line.range
    const where = `lines[${i}] [${s}, ${e}]`
    if (s !== expected) fail(doc, `lines do not tile doc.range: ${where} should start at ${expected}`)
    if (e < s || e > docEnd) fail(doc, `lines do not tile doc.range: ${where} ends outside it`)
    const [is, ie] = line.indent
    if (is !== s || ie < is || ie > e || !/^[ \t]*$/.test(text.slice(is, ie))) {
      fail(doc, `lines: ${where} has indent [${is}, ${ie}] that is not a whitespace prefix`)
    }
    const { anchor } = line
    if (anchor !== null && !(Number.isInteger(anchor) && anchor >= 0 && anchor < i)) {
      fail(doc, `lines: ${where} has anchor ${anchor}, which is not an earlier line`)
    }
    if (i === lines.length - 1) {
      if (e !== docEnd) fail(doc, `lines do not tile doc.range: last line ends at ${e}, not ${docEnd}`)
      return
    }
    const eol = text.startsWith('\r\n', e) && e + 2 <= docEnd ? 2 : text[e] === '\n' || text[e] === '\r' ? 1 : 0
    if (eol === 0 || e + eol > docEnd) fail(doc, `lines do not tile doc.range: ${where} is not followed by an EOL`)
    expected = e + eol
  })
}
