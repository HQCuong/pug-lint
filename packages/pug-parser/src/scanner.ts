import type { Range } from './ast.ts'

export interface RawLine {
  range: Range                          // without EOL
  indent: Range                         // leading spaces/tabs
  eol: '' | '\n' | '\r\n' | '\r'        // '' only on the last line
  blank: boolean                        // empty or whitespace-only
}

/**
 * Split `text[start, end)` into lines. The lines plus their EOLs tile the range
 * exactly: a trailing EOL yields a final empty line, and an empty range yields
 * one empty line. No range ever leaves `[start, end]`.
 */
export function scanLines(text: string, start: number, end: number): RawLine[] {
  const lines: RawLine[] = []
  let lineStart = start
  for (;;) {
    let i = lineStart
    while (i < end && (text[i] === ' ' || text[i] === '\t')) i++
    const indentEnd = i
    while (i < end && text[i] !== '\n' && text[i] !== '\r') i++
    let eol: RawLine['eol'] = ''
    if (i < end) {
      if (text[i] === '\n') eol = '\n'
      else eol = i + 1 < end && text[i + 1] === '\n' ? '\r\n' : '\r'
    }
    lines.push({ range: [lineStart, i], indent: [lineStart, indentEnd], eol, blank: indentEnd === i })
    if (eol === '') return lines
    lineStart = i + eol.length
  }
}
