// vue-pug/prefer-shorthand: a static `class`/`id` attribute and the shorthand it becomes. Per kind,
// `always` turns a static attribute (a plain '…'/"…" string whose tokens are all identifiers, the
// same "static" as the structural fingerprint) into `.a.b` / `#x`; `never` turns the shorthands into
// one attribute. Both keep the fingerprint, which merges the two forms.
// All conversions of one tag go into ONE fix carried by the tag's first report: they insert at the
// same point, so separate fixes would overlap and a single pass would not reach the final form.
// A tag with an id shorthand and an `id` attribute is a Pug error the user resolves: its id is left alone.
import type { Attribute, Range, Tag } from '@pug-lint/parser'
import { walk } from '@pug-lint/parser'
import type { Rule } from 'eslint'
import { createPugRule } from '../utils/create-rule.ts'

type Mode = 'always' | 'never' | 'ignore'
type Kind = 'class' | 'id'
type Options = [{ class: Mode; id: Mode }]

const IDENT = /^-?[_a-zA-Z][\w-]*$/

interface Edit {
  range: Range
  text: string
}

interface Report {
  range: Range
  messageId: 'useShorthand' | 'useAttribute'
  data: { shorthand: string; name: Kind }
}

/** The static body of a plain string value, or null. */
function staticBody(text: string, attribute: Attribute): string | null {
  const { value } = attribute
  return value?.kind === 'string' && value.inner ? text.slice(...value.inner) : null
}

/** The end of the tag head's name and shorthands. */
function shorthandEnd(tag: Tag): number {
  return Math.max(tag.name?.range[1] ?? 0, ...tag.shorthands.map((s) => s.range[1]))
}

export default createPugRule<Options>({
  name: 'prefer-shorthand',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: { description: 'enforce or forbid `.class` / `#id` shorthands for static class and id attributes', recommended: true },
    schema: [
      {
        type: 'object',
        properties: { class: { enum: ['always', 'never', 'ignore'] }, id: { enum: ['always', 'never', 'ignore'] } },
        additionalProperties: false,
      },
    ],
    messages: {
      useShorthand: "Use the '{{shorthand}}' shorthand instead of the {{name}} attribute.",
      useAttribute: "Use the {{name}} attribute instead of the '{{shorthand}}' shorthand.",
    },
  },
  defaultOptions: [{ class: 'always', id: 'always' }],
  check(ctx) {
    const { text } = ctx
    const [modes] = ctx.options

    const checkTag = (tag: Tag): void => {
      if (ctx.inErrorRegion(tag.range) || tag.attributeBlocks.some((b) => ctx.inErrorRegion(b.range))) return
      const attributes = tag.attributeBlocks.flatMap((b) => b.attributes)
      const idAttributes = attributes.filter((a) => a.key.raw === 'id')
      const idShorthands = tag.shorthands.filter((s) => s.kind === 'id')
      // `#a(id="b")` (or two ids) is a Pug error: leave the id to the user.
      const idUsable = idAttributes.length + idShorthands.length <= 1

      const reports: Report[] = []
      const removedAttributes = new Set<Attribute>()
      const removedShorthands = new Set<Tag['shorthands'][number]>()
      let newId = ''
      let newClasses = ''
      let attrId: string | null = null
      const attrClasses: string[] = []

      // always: static attribute → shorthand.
      for (const attribute of attributes) {
        const kind = attribute.key.raw
        if ((kind !== 'class' && kind !== 'id') || modes[kind] !== 'always') continue
        if (kind === 'id' && !idUsable) continue
        const body = staticBody(text, attribute)
        if (body === null) continue
        const tokens = body.split(/\s+/).filter(Boolean)
        if (tokens.length === 0 || !tokens.every((t) => IDENT.test(t)) || (kind === 'id' && tokens.length !== 1)) continue
        const shorthand = kind === 'id' ? `#${tokens[0]}` : `.${tokens.join('.')}`
        if (kind === 'id') newId += shorthand
        else newClasses += shorthand
        removedAttributes.add(attribute)
        reports.push({ range: attribute.range, messageId: 'useShorthand', data: { shorthand, name: kind } })
      }

      // never: shorthand → attribute.
      for (const shorthand of tag.shorthands) {
        const kind = shorthand.kind
        if (modes[kind] !== 'never' || (kind === 'id' && !idUsable)) continue
        if (kind === 'id') attrId = shorthand.value
        else attrClasses.push(shorthand.value)
        removedShorthands.add(shorthand)
        reports.push({ range: shorthand.range, messageId: 'useAttribute', data: { shorthand: text.slice(...shorthand.range), name: kind } })
      }
      if (reports.length === 0) return
      reports.sort((a, b) => a.range[0] - b.range[0])

      const edits: Edit[] = []
      const newShorthands = newId + newClasses
      const keptShorthands = tag.shorthands.filter((s) => !removedShorthands.has(s))
      // Shorthands go after the last kept shorthand, else after the name, else (an implicit div that
      // keeps no shorthand) where the head starts.
      const insertAt = keptShorthands.at(-1)?.range[1] ?? tag.name?.range[1] ?? tag.shorthands[0]!.range[0]
      const needsDiv = tag.name === null && keptShorthands.length === 0 && newShorthands === ''
      if (needsDiv || newShorthands) edits.push({ range: [insertAt, insertAt], text: (needsDiv ? 'div' : '') + newShorthands })
      for (const shorthand of removedShorthands) edits.push({ range: shorthand.range, text: '' })

      // New attributes: classes join an existing static class attribute that stays; the rest are
      // inserted as the first attributes of the first block (or a new block).
      const firstBlock = tag.attributeBlocks[0]
      const quote = firstBlock?.attributes.map((a) => a.value).find((v) => v?.kind === 'string')?.quote ?? '"'
      const newAttributes: string[] = []
      if (attrId !== null) newAttributes.push(`id=${quote}${attrId}${quote}`)
      if (attrClasses.length > 0) {
        const target = attributes.find((a) => a.key.raw === 'class' && !removedAttributes.has(a) && staticBody(text, a) !== null)
        if (target) {
          const end = target.value!.inner![1]
          edits.push({ range: [end, end], text: (/\S/.test(staticBody(text, target)!) ? ' ' : '') + attrClasses.join(' ') })
        } else {
          newAttributes.push(`class=${quote}${attrClasses.join(' ')}${quote}`)
        }
      }
      const added = newAttributes.join(' ')

      tag.attributeBlocks.forEach((block, b) => {
        const list = block.attributes
        const target = b === 0 && added !== ''
        if (list.length > 0 && list.every((a) => removedAttributes.has(a))) {
          // The block empties: drop it, or keep it for the new attributes.
          edits.push(target ? { range: [list[0]!.range[0], list.at(-1)!.range[1]], text: added } : { range: block.range, text: '' })
          return
        }
        if (target) {
          const at = list[0]?.range[0] ?? block.range[0] + 1
          edits.push({ range: [at, at], text: list.length > 0 ? `${added} ` : added })
        }
        // Each run of removed attributes goes with the separator after it, or before it at the end.
        for (let i = 0; i < list.length; i++) {
          if (!removedAttributes.has(list[i]!)) continue
          let j = i
          while (j + 1 < list.length && removedAttributes.has(list[j + 1]!)) j++
          edits.push({ range: j + 1 < list.length ? [list[i]!.range[0], list[j + 1]!.range[0]] : [list[i - 1]!.range[1], list[j]!.range[1]], text: '' })
          i = j
        }
      })
      if (added !== '' && !firstBlock) {
        const end = shorthandEnd(tag)
        edits.push({ range: [end, end], text: `(${added})` })
      }

      const fix: Rule.ReportFixer = (fixer) => {
        // Stable sort: an insertion stays before a removal that starts at the same offset.
        const sorted = edits.map((e, i) => ({ ...e, i })).sort((a, b) => a.range[0] - b.range[0] || a.range[1] - b.range[1] || a.i - b.i)
        const start = sorted[0]!.range[0]
        const end = Math.max(...sorted.map((e) => e.range[1]))
        let out = ''
        let at = start
        for (const e of sorted) {
          out += text.slice(at, e.range[0]) + e.text
          at = e.range[1]
        }
        return fixer.replaceTextRange([start, end], out + text.slice(at, end))
      }
      reports.forEach((r, i) => ctx.report({ ...r, ...(i === 0 && { fix }) }))
    }

    walk(ctx.doc, (node) => {
      if (node.type === 'Tag') checkTag(node)
    })
  },
})
