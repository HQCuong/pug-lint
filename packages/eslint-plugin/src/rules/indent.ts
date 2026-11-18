// vue-pug/indent: the leading whitespace of every Pug template line. Node, attribute and
// closing-paren lines get `unit × (depth + baseIndent)`; anchored lines (raw-block lines after the
// first, continuation lines) keep their offset relative to their anchor line. Lines starting inside
// a string or template literal are left alone: their whitespace is part of the value.
// All reports share one fix, so a single surviving report re-indents the whole span.
import type { Attribute, PugDocument, PugLine, Range } from '@pug-lint/parser'
import { literalSpans, walk } from '@pug-lint/parser'
import { createPugRule } from '../utils/create-rule.ts'

type Options = [indent: number | 'tab', { baseIndent: number }]

/** The single whitespace character `ws` is made of, '' when empty, null when mixed. */
function charOf(ws: string): string | null {
  if (ws === '') return ''
  return [...ws].every((c) => c === ws[0]) ? ws[0]! : null
}

/** `ws` in words, e.g. '4 spaces', '1 tab', '4 spaces and 1 tab'. */
function describe(ws: string, unit: string): string {
  const count = (c: string): number => [...ws].filter((x) => x === c).length
  const plural = (n: number, word: string): string => `${n} ${word}${n === 1 ? '' : 's'}`
  const spaces = count(' ')
  const tabs = count('\t')
  if (spaces === 0 && tabs === 0) return plural(0, unit === '\t' ? 'tab' : 'space')
  return [spaces > 0 ? plural(spaces, 'space') : '', tabs > 0 ? plural(tabs, 'tab') : ''].filter(Boolean).join(' and ')
}

/**
 * The new indentation of an anchored line whose anchor goes from `anchorOld` to `anchorNew`, or null
 * to leave it alone. Indentation past the anchor's is kept character for character; otherwise the
 * line is shifted by the anchor's column delta, which needs one whitespace character throughout.
 */
function shifted(line: PugLine, ws: string, anchorOld: string, anchorNew: string): string | null {
  if (ws.startsWith(anchorOld)) return anchorNew + ws.slice(anchorOld.length)
  const chars = [charOf(ws), charOf(anchorOld), charOf(anchorNew)].filter((c) => c !== '')
  const char = chars[0]
  if (char === undefined || char === null || chars.some((c) => c !== char)) return null
  const floor = line.kind === 'raw' ? anchorNew.length : 0
  return char.repeat(Math.max(floor, ws.length + anchorNew.length - anchorOld.length))
}

// Vue parses these attribute values as JavaScript; any other value is the string itself.
const isBound = (key: string): boolean => /^(?::|@|#|\.|v-)/.test(key)

/** String and template literal spans of attribute values, mixin arguments and `&attributes(…)`, by start. Also used by the convergence gate's mutation. */
export function stringSpans(doc: PugDocument, text: string): Range[] {
  const spans: Range[] = []
  const ofAttribute = ({ key, value }: Attribute): void => {
    if (value === null) return
    // A bound value written as one Pug string: the literals are those of the JavaScript inside it.
    if (isBound(key.raw) && value.kind === 'string' && value.inner) spans.push(...literalSpans(text, value.inner))
    else spans.push(...literalSpans(text, value.range))
  }
  walk(doc, (node) => {
    if (node.type !== 'Tag' && node.type !== 'MixinCall' && node.type !== 'Filter') return
    for (const block of node.attributeBlocks) block.attributes.forEach(ofAttribute)
    if (node.type === 'Filter') return
    for (const and of node.andAttributes) spans.push(...literalSpans(text, and.expression))
    if (node.type === 'MixinCall' && node.args) spans.push(...literalSpans(text, node.args))
  })
  return spans.sort((a, b) => a[0] - b[0])
}

export default createPugRule<Options>({
  name: 'indent',
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: { description: 'enforce consistent indentation in Pug templates', recommended: true },
    schema: [
      { anyOf: [{ type: 'integer', minimum: 1 }, { enum: ['tab'] }] },
      {
        type: 'object',
        properties: { baseIndent: { type: 'integer', minimum: 0 } },
        additionalProperties: false,
      },
    ],
    messages: { unexpected: 'Expected indentation of {{expected}} but found {{actual}}.' },
  },
  defaultOptions: [2, { baseIndent: 0 }],
  check(ctx) {
    const [indent, { baseIndent }] = ctx.options
    const unit = indent === 'tab' ? '\t' : ' '.repeat(indent)
    const { lines } = ctx.doc
    const { text } = ctx
    // The indentation each line has after this rule's fixes, by line index.
    const after: string[] = []
    const changes: { line: PugLine; ws: string; target: string }[] = []
    // Literal spans do not overlap, and line starts only grow: one forward pass over both.
    const spans = stringSpans(ctx.doc, text)
    let s = 0
    const inString = (offset: number): boolean => {
      while (s < spans.length && spans[s]![1] <= offset) s++
      return s < spans.length && spans[s]![0] < offset
    }
    lines.forEach((line, k) => {
      const ws = text.slice(...line.indent)
      after[k] = ws
      if (line.kind === 'blank' || line.indent[1] === line.range[1]) return
      // Content on the `<template>` line has no leading whitespace of its own.
      if (line.indent[0] > 0 && text[line.indent[0] - 1] !== '\n' && text[line.indent[0] - 1] !== '\r') return
      if (ctx.inErrorRegion(line.range) || inString(line.range[0])) return
      const target = line.anchor === null
        ? unit.repeat(line.depth + baseIndent)
        : shifted(line, ws, text.slice(...lines[line.anchor]!.indent), after[line.anchor]!)
      if (target === null || target === ws) return
      after[k] = target
      changes.push({ line, ws, target })
    })
    if (changes.length === 0) return
    // Pug indentation is structure: moving one line without its siblings and children changes the
    // tree, and the guard checks every fix alone. So every report carries the same fix, which
    // rewrites all the template's indentation at once (characters between the indents are kept).
    const start = changes[0]!.line.indent[0]
    const end = changes.at(-1)!.line.indent[1]
    let fixed = ''
    let at = start
    for (const { line, target } of changes) {
      fixed += text.slice(at, line.indent[0]) + target
      at = line.indent[1]
    }
    for (const { line, ws, target } of changes) {
      ctx.report({
        range: line.indent,
        messageId: 'unexpected',
        data: { expected: describe(target, unit), actual: describe(ws, unit) },
        fix: (fixer) => fixer.replaceTextRange([start, end], fixed),
      })
    }
  },
})
