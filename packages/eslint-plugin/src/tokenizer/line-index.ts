// Offset <-> line/column on the raw file text. Lines are split on `\n` only, which is how
// vue-eslint-parser counts lines on CRLF text (a `\r` is the last column of its line).

export interface Position {
  /** 1-based. */
  line: number
  /** 0-based, in UTF-16 code units. */
  column: number
}

export interface LineIndex {
  offsetOf(line: number, column: number): number
  locOf(offset: number): Position
}

export function createLineIndex(text: string): LineIndex {
  const starts = [0]
  for (let i = text.indexOf('\n'); i !== -1; i = text.indexOf('\n', i + 1)) starts.push(i + 1)
  return {
    offsetOf(line, column) {
      const start = starts[line - 1]
      if (start === undefined) throw new RangeError(`line ${line} is out of range`)
      return start + column
    },
    locOf(offset) {
      let lo = 0
      let hi = starts.length - 1
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1
        if (starts[mid]! <= offset) lo = mid
        else hi = mid - 1
      }
      return { line: lo + 1, column: offset - starts[lo]! }
    },
  }
}
