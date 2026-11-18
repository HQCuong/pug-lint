// Structural fingerprint (plan Design §3 "Fingerprint definition"): what a fix
// may never change. Static class/id count whatever their form, so
// `class="a b"` ↔ `.a.b` and `id="x"` ↔ `#x` keep it; every id source counts,
// so dropping one of `#a(id="b")` changes it. Each other attribute value counts
// by its class (none or string-like, expression, template with `${}`). Pug-side
// JavaScript counts by its text up to indentation, as no fix may rewrite it: an
// expression or `${}` template value, `&attributes(…)`, mixin arguments, code,
// control heads and `#{…}` interpolations. Attribute names, order, quotes, string
// values, tag-name casing, text content, `/`, `:` and other whitespace do not appear in it.

import type { AttributeValue, MixinCall, PugDocument, PugNode, Range, Tag, Text } from './ast.ts'

export function fingerprint(doc: PugDocument): string {
  return list(doc.text, doc.children)
}

function list(text: string, nodes: readonly PugNode[]): string {
  const out: string[] = []
  let group: Text[] = []
  const flush = (): void => {
    if (group.length > 0) out.push(textFp(text, group))
    group = []
  }
  for (const node of nodes) {
    if (node.type === 'Text' && (node.form === 'pipe' || node.form === 'block')) {
      group.push(node)
      continue
    }
    flush()
    out.push(node.type === 'Text' ? textFp(text, [node]) : nodeFp(text, node))
  }
  flush()
  return out.join(',')
}

function nodeFp(text: string, node: Exclude<PugNode, Text>): string {
  switch (node.type) {
    case 'Tag': {
      const name = (node.name?.value ?? 'div').toLowerCase().replace(/[-_]/g, '')
      return `T${name}${headFp(text, node)}[${list(text, node.children)}]`
    }
    case 'MixinCall':
      return `M${node.name.value}${JSON.stringify(node.args ? js(slice(text, node.args)) : '')}${headFp(text, node)}[${list(text, node.children)}]`
    case 'Control':
      return `C${node.keyword}${JSON.stringify(js(slice(text, node.head)))}[${list(text, node.children)}]`
    case 'Code':
      return `K${JSON.stringify(js(slice(text, node.expression)))}[${list(text, node.children)}]`
    case 'Filter':
      return `F${node.name}`
    case 'Comment':
      return '#'
  }
}

/** `t` + one `i<expression>`/`j` per interpolation part; tags of `#[…]` follow as children. */
function textFp(text: string, group: readonly Text[]): string {
  let marks = ''
  const tags: string[] = []
  for (const node of group) {
    for (const part of node.parts) {
      if (part.type === 'Interpolation') marks += `i${JSON.stringify(js(slice(text, part.expression)))}`
      else if (part.type === 'TagInterpolation') {
        marks += 'j'
        tags.push(nodeFp(text, part.tag))
      }
    }
  }
  return tags.length > 0 ? `t${marks}[${tags.join(',')}]` : `t${marks}`
}

const slice = (text: string, [start, end]: Range): string => text.slice(start, end)

/** JavaScript source up to indentation: the whitespace around each line break counts as one `\n`. */
const js = (source: string): string => source.replace(/[ \t]*\r?\n[ \t]*/g, '\n')

/**
 * An attribute value that is not a static class/id: `s` none or string-like (`:a="true"` → `a` is a
 * fix), `e…`/`t…` an expression or a `${}` template, which Pug compiles as JavaScript.
 */
function valueFp(value: AttributeValue | null): string {
  if (value === null || value.kind === 'string' || (value.kind === 'template' && !value.hasSubstitution)) return 's'
  return (value.kind === 'template' ? 't' : 'e') + js(value.raw)
}

/**
 * `.<classes>#<ids><values>`: every id (shorthand or static attribute) counts, sorted and joined with
 * `#`; `<values>` is the sorted multiset (JSON) of the other attribute values and `&attributes` expressions.
 */
function headFp(text: string, node: Tag | MixinCall): string {
  const classes = new Set<string>()
  const ids: string[] = []
  const values = node.andAttributes.map((a) => `a${js(slice(text, a.expression))}`)
  for (const sh of node.shorthands) {
    if (sh.kind === 'class') classes.add(sh.value)
    else ids.push(sh.value)
  }
  for (const block of node.attributeBlocks) {
    for (const attr of block.attributes) {
      const value = attr.value
      // Only a plain '…'/"…" string is static; a template literal (with `${}` or not) is another value.
      const body = value?.kind === 'string' && value.inner ? text.slice(value.inner[0], value.inner[1]) : null
      if (body !== null && attr.key.raw === 'class') {
        for (const token of body.split(/\s+/)) {
          if (token) classes.add(token)
        }
      } else if (body !== null && attr.key.raw === 'id') {
        ids.push(body)
      } else {
        values.push(valueFp(value))
      }
    }
  }
  return `.${[...classes].sort().join('.')}#${ids.sort().join('#')}${JSON.stringify(values.sort())}`
}
