import type { PugDocument, PugNode, Range, Tag } from '../src/ast.ts'

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

function label(doc: PugDocument, node: Container): string {
  const [s, e] = node.range
  return `${node.type} [${s}, ${e}] ${JSON.stringify(doc.text.slice(s, Math.min(e, s + 30)))}`
}

/**
 * Throws with a message naming the offending node when the CST breaks a
 * structural invariant:
 * - every node range lies inside `doc.range` and has start <= end;
 * - a child starts at or after its previous sibling's end;
 * - a child lies inside its parent's extent: from the parent's start to the
 *   start of the parent's next sibling (or the end of the grandparent's extent);
 * - `doc.lines` tile `doc.range`: first starts at `doc.range[0]`, each next one
 *   starts right after the previous one's EOL, the last ends at `doc.range[1]`,
 *   and each `indent` is a whitespace prefix of its line.
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
  if (docStart > docEnd) fail(doc, 'range start is after its end')
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
    if (i === lines.length - 1) {
      if (e !== docEnd) fail(doc, `lines do not tile doc.range: last line ends at ${e}, not ${docEnd}`)
      return
    }
    const eol = text.startsWith('\r\n', e) && e + 2 <= docEnd ? 2 : text[e] === '\n' || text[e] === '\r' ? 1 : 0
    if (eol === 0 || e + eol > docEnd) fail(doc, `lines do not tile doc.range: ${where} is not followed by an EOL`)
    expected = e + eol
  })
}
