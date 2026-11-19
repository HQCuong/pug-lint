// vue-eslint-parser `templateTokenizer` for `<template lang="pug">` (contract: vue-eslint-parser
// src/html/custom-tokenizer.ts). Built to dist/tokenizer.cjs, which vue-eslint-parser `require`s.
import type { PugDocument, Range } from 'pug-lint-parser'
import { findLaterRootTemplateRanges, getPugTemplates } from '../shared/templates.ts'
import { Emitter } from './emit.ts'
import type { IntermediateToken, Token } from './emit.ts'
import { createLineIndex } from './line-index.ts'
import type { LineIndex } from './line-index.ts'

export type { IntermediateToken, Token } from './emit.ts'

/** A parse error in vue-eslint-parser's shape, deliberately without a `code` so `vue/no-parsing-error` reports it. */
export interface PugSyntaxError extends SyntaxError {
  index: number
  lineNumber: number
  column: number
}

const MISMATCH_MESSAGE = 'template source could not be located reliably (x-pug-source-mismatch)'

type Located =
  | { kind: 'pug'; doc: PugDocument }
  /** A root `<template>` after the first one: not vue-eslint-parser's `templateBody`. */
  | { kind: 'ignored' }
  | { kind: 'mismatch'; offset: number }

/** Where `templateText` (CRLF folded to LF by vue-eslint-parser) sits in the raw `text`. */
function locate(templateText: string, text: string, lines: LineIndex, startingLine: number, startingColumn: number): Located {
  let start: number
  try {
    start = lines.offsetOf(startingLine, startingColumn)
  } catch {
    return { kind: 'mismatch', offset: 0 }
  }
  let end = start
  for (let n = 0; n < templateText.length; n++) {
    if (templateText[n] === '\n' && text[end] === '\r' && text[end + 1] === '\n') end++
    end++
  }
  if (text.slice(start, end).replace(/\r\n/g, '\n') !== templateText) return { kind: 'mismatch', offset: start }
  const same = (r: Range): boolean => r[0] === start && r[1] === end
  const template = getPugTemplates(text).find((t) => same(t.range))
  if (template) return { kind: 'pug', doc: template.doc }
  if (findLaterRootTemplateRanges(text).some(same)) return { kind: 'ignored' }
  return { kind: 'mismatch', offset: start }
}

export class PugTokenizer {
  readonly text: string
  readonly tokens: Token[] = []
  readonly comments: Token[] = []
  readonly errors: PugSyntaxError[] = []
  // Written by vue-eslint-parser while it consumes our tokens.
  state = 'DATA'
  namespace = 'http://www.w3.org/1999/xhtml'
  expressionEnabled = true
  private readonly lines: LineIndex
  private readonly queue: Iterator<IntermediateToken>

  constructor(templateText: string, text: string, option: { startingLine: number; startingColumn: number }) {
    this.text = text
    this.lines = createLineIndex(text)
    const emitter = new Emitter({
      text,
      lines: this.lines,
      tokens: this.tokens,
      comments: this.comments,
      expressionEnabled: () => this.expressionEnabled,
      error: (message, offset) => this.pushError(message, offset),
    })
    const located = locate(templateText, text, this.lines, option.startingLine, option.startingColumn)
    if (located.kind === 'pug') {
      for (const error of located.doc.errors) this.pushError(error.message, error.offset)
      this.queue = emitter.nodes(located.doc.children, false)
    } else {
      // An ignored template yields nothing: a `Text` token would make vue-eslint-parser call us again.
      if (located.kind === 'mismatch') this.pushError(MISMATCH_MESSAGE, located.offset)
      this.queue = [][Symbol.iterator]()
    }
  }

  /** Tokens are produced lazily, so text emission sees `expressionEnabled` as the parser left it. */
  nextToken(): IntermediateToken | null {
    const next = this.queue.next()
    if (!next.done) return next.value
    this.tokens.sort((a, b) => a.range[0] - b.range[0])
    return null
  }

  private pushError(message: string, offset: number): void {
    const { line, column } = this.lines.locOf(offset)
    this.errors.push(Object.assign(new SyntaxError(`Pug: ${message}`), { index: offset, lineNumber: line, column }))
  }
}
