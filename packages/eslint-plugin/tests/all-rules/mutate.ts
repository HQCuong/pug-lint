// Whitespace mutation for the convergence gate: structure-preserving noise, driven by the CST, that
// the recommended `vue-pug/*` rules must undo exactly. Every site is mutated or not by a seeded PRNG,
// so a failing seed reproduces.
import type { Attribute, AttributeBlock, PugDocument, PugLine, PugNode, Range, Tag } from '@pug-lint/parser'
import { literalSpans, walk } from '@pug-lint/parser'
import { getPugTemplates, templateFingerprint } from '../../src/shared/templates.ts'

interface Edit {
  range: Range
  text: string
}

/** mulberry32: a small deterministic PRNG returning floats in [0, 1). */
function prng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const isBound = (key: string): boolean => /^(?::|@|#|\.|v-)/.test(key)

/** String and template literal spans of attribute values, `&attributes(…)` and mixin arguments (as `vue-pug/indent` sees them). */
function stringSpans(doc: PugDocument, text: string): Range[] {
  const spans: Range[] = []
  const ofAttribute = ({ key, value }: Attribute): void => {
    if (value === null) return
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
  return spans
}

/** Indexes of the lines of error-recovery regions: lines holding an error, and continuation lines anchored at or before one. */
function errorLines(doc: PugDocument): Set<number> {
  const { lines, errors } = doc
  const holding = new Set<number>()
  for (const { offset } of errors) {
    let k = -1
    for (let i = 0; i < lines.length && lines[i]!.range[0] <= offset; i++) k = i
    if (k >= 0) holding.add(k)
  }
  const out = new Set(holding)
  lines.forEach((line, k) => {
    if (line.kind !== 'continuation' || line.anchor === null) return
    for (let j = line.anchor; j < k; j++) if (holding.has(j)) out.add(k)
  })
  return out
}

/**
 * The indent model, inverted: every `node`/`attribute`/`paren-close` line and every unanchored `raw`
 * line gets `unit × depth`; an anchored line (raw after the first, continuation) moves by exactly the
 * column delta its anchor received. Blank lines, lines in error-recovery regions, lines that start
 * inside a string or template literal, and content on the `<template>` line are left alone.
 */
function reindent(doc: PugDocument, text: string, unit: string, edits: Edit[]): void {
  const { lines } = doc
  const spans = stringSpans(doc, text)
  const inString = (offset: number): boolean => spans.some(([s, e]) => s < offset && offset < e)
  const skipped = errorLines(doc)
  const delta: number[] = []
  const char = unit[0]!
  lines.forEach((line: PugLine, k) => {
    delta[k] = 0
    const ws = text.slice(...line.indent)
    if (line.kind === 'blank' || line.indent[1] === line.range[1] || skipped.has(k)) return
    if (line.indent[0] > 0 && text[line.indent[0] - 1] !== '\n' && text[line.indent[0] - 1] !== '\r') return
    if (inString(line.range[0])) return
    let target: string
    if (line.anchor === null) {
      target = unit.repeat(line.depth)
    } else {
      const d = delta[line.anchor]!
      if (d < 0) throw new Error('mutateWhitespace(): an anchor line moved left')
      target = char.repeat(d) + ws
    }
    delta[k] = target.length - ws.length
    if (target !== ws) edits.push({ range: line.indent, text: target })
  })
}

/** Commas, spaces between attributes, spaces inside the parens and around `=`, quote swaps. */
function mutateBlock(block: AttributeBlock, text: string, rand: () => number, edits: Edit[]): void {
  const { attributes, commas } = block
  if (attributes.length === 0) return
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)]!
  // Inside the parens: only where the attribute text is on the paren's line.
  const open = block.range[0] + 1
  const close = block.range[1] - 1
  if (!/\s/.test(text[open]!) && rand() < 0.5) edits.push({ range: [open, open], text: pick([' ', '  ']) })
  if (!/\s/.test(text[close - 1]!) && rand() < 0.5) edits.push({ range: [close, close], text: pick([' ', '  ']) })
  for (let i = 0; i + 1 < attributes.length; i++) {
    const gap: Range = [attributes[i]!.range[1], attributes[i + 1]!.range[0]]
    const between = text.slice(...gap)
    const hasComma = commas.some(([s]) => gap[0] <= s && s < gap[1])
    if (/[\r\n]/.test(between)) {
      // A line break between them: add a comma at the end of the attribute, or drop an existing one.
      if (!hasComma && rand() < 0.5) edits.push({ range: [gap[0], gap[0]], text: ',' })
      else if (hasComma && between.trim() === ',' && rand() < 0.5) {
        const at = gap[0] + between.indexOf(',')
        edits.push({ range: [at, at + 1], text: '' })
      }
    } else if (/^[ ,]*$/.test(between) && rand() < 0.7) {
      edits.push({ range: gap, text: pick([' ', '  ', '   ', ',', ', ', ',  ', ' , ']) })
    }
  }
  for (const { operator, value } of attributes) {
    if (operator?.value === '=') {
      if (rand() < 0.3) edits.push({ range: [operator.range[0], operator.range[0]], text: ' ' })
      if (rand() < 0.3) edits.push({ range: [operator.range[1], operator.range[1]], text: ' ' })
    }
    if (value?.kind === 'string' && value.inner && rand() < 0.5) {
      const body = text.slice(...value.inner)
      if (/['"\\\r\n]/.test(body)) continue
      const q = value.quote === '"' ? "'" : '"'
      edits.push({ range: value.range, text: q + body + q })
    }
  }
}

/** `div.x` ↔ `.x`, outside `#[…]` interpolations. */
function toggleDiv(tag: Tag, rand: () => number, edits: Edit[]): void {
  const first = tag.shorthands[0]
  if (!first || rand() >= 0.5) return
  if (tag.name === null) edits.push({ range: [first.range[0], first.range[0]], text: 'div' })
  else if (tag.name.value === 'div' && first.range[0] === tag.name.range[1]) edits.push({ range: tag.name.range, text: '' })
}

function mutateTemplate(doc: PugDocument, text: string, rand: () => number, edits: Edit[]): void {
  const interpolated = new Set<PugNode>()
  walk(doc, (node, parent) => {
    if (node.type !== 'Tag' && node.type !== 'MixinCall') return
    const inside = parent.type === 'Text' || interpolated.has(parent as PugNode)
    if (inside) interpolated.add(node)
    for (const block of node.attributeBlocks) mutateBlock(block, text, rand, edits)
    if (node.type === 'Tag' && !inside) toggleDiv(node, rand, edits)
  })
  if (rand() < 0.75) {
    const char = doc.indentUnit[0] === '\t' ? '\t' : ' '
    reindent(doc, text, char.repeat(rand() < 0.5 ? 3 : 4), edits)
  }
}

/** Applies non-overlapping edits; an insertion at the end of a replaced range lands after the replacement. */
function apply(code: string, edits: Edit[]): string {
  const sorted = [...edits].sort((a, b) => b.range[0] - a.range[0] || b.range[1] - a.range[1])
  let out = code
  let limit = Infinity
  for (const { range, text } of sorted) {
    if (range[1] > limit) throw new Error(`mutateWhitespace(): overlapping edits at ${range[0]}`)
    out = out.slice(0, range[0]) + text + out.slice(range[1])
    limit = range[0]
  }
  return out
}

/**
 * Structure-preserving whitespace noise over every Pug template of `code`: add or remove commas between
 * attributes, change the spaces between attributes on a line, add spaces inside the parens and around
 * `=`, swap the quotes of a string value whose body has no quote, backslash or line break, toggle
 * `div.x` ↔ `.x`, and re-indent with a random unit (3 or 4 of the file's whitespace character) under
 * the indent model. Throws when the result's `templateFingerprint` differs from `code`'s.
 */
export function mutateWhitespace(code: string, seed: number): string {
  const rand = prng(seed)
  const edits: Edit[] = []
  for (const { doc } of getPugTemplates(code)) mutateTemplate(doc, code, rand, edits)
  const out = apply(code, edits)
  const before = templateFingerprint(code)
  const after = templateFingerprint(out)
  if (after !== before) {
    throw new Error(`mutateWhitespace(): seed ${seed} changed the fingerprint\n--- before\n${code}\n--- after\n${out}`)
  }
  return out
}
