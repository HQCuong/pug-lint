import type { Range } from 'pug-lint-parser'

/** A Vue SFC whose template is `pugBody`, followed by `script`. */
export function vue(pugBody: string, script = ''): string {
  return `<template lang="pug">\n${pugBody}\n</template>\n${script}`
}

/** Convert every EOL (`\r\n`, `\r`, `\n`) to `\r\n`. */
export function toCRLF(s: string): string {
  return s.replace(/\r\n|\r|\n/g, '\r\n')
}

/** Range of the nth (0-based) occurrence of `needle` in `text`. Throws if absent. */
export function at(text: string, needle: string, nth = 0): Range {
  let index = -1
  for (let n = 0; n <= nth; n++) {
    index = text.indexOf(needle, index + 1)
    if (index === -1) throw new Error(`at(): occurrence ${nth} of ${JSON.stringify(needle)} not found`)
  }
  return [index, index + needle.length]
}
