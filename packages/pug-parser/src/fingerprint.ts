// Structural fingerprint (plan Design §3 "Fingerprint definition"): what a fix
// may never change. Static class/id count once whatever their form, so
// `class="a b"` ↔ `.a.b` and `id="x"` ↔ `#x` keep it; attribute names, values,
// order, quotes, tag-name casing, text content, `/`, `:` and whitespace do not
// appear in it.

import type { MixinCall, PugDocument, PugNode, Tag, Text } from './ast.ts'

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
      return `M${node.name.value}${headFp(text, node)}[${list(text, node.children)}]`
    case 'Control':
      return `C${node.keyword}[${list(text, node.children)}]`
    case 'Code':
      return `K[${list(text, node.children)}]`
    case 'Filter':
      return `F${node.name}`
    case 'Comment':
      return '#'
  }
}

/** `t` + one `i`/`j` per interpolation part; tags of `#[…]` follow as children. */
function textFp(text: string, group: readonly Text[]): string {
  let marks = ''
  const tags: string[] = []
  for (const node of group) {
    for (const part of node.parts) {
      if (part.type === 'Interpolation') marks += 'i'
      else if (part.type === 'TagInterpolation') {
        marks += 'j'
        tags.push(nodeFp(text, part.tag))
      }
    }
  }
  return tags.length > 0 ? `t${marks}[${tags.join(',')}]` : `t${marks}`
}

/** `.<classes>#<id>(<n>,<s>)` */
function headFp(text: string, node: Tag | MixinCall): string {
  const classes = new Set<string>()
  let id: string | null = null
  let n = node.andAttributes.length
  let s = 0
  for (const sh of node.shorthands) {
    if (sh.kind === 'class') classes.add(sh.value)
    else id ??= sh.value
  }
  const staticIds: string[] = []
  for (const block of node.attributeBlocks) {
    for (const attr of block.attributes) {
      const value = attr.value
      if (value?.hasSubstitution) s++
      const body = value?.kind === 'string' && value.inner ? text.slice(value.inner[0], value.inner[1]) : null
      if (body !== null && attr.key.raw === 'class') {
        for (const token of body.split(/\s+/)) {
          if (token) classes.add(token)
        }
      } else if (body !== null && attr.key.raw === 'id') {
        staticIds.push(body)
      } else {
        n++
      }
    }
  }
  id ??= staticIds[0] ?? ''
  return `.${[...classes].sort().join('.')}#${id}(${n},${s})`
}
