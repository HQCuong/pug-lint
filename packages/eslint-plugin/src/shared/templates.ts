// Locates `<template lang="pug">` blocks in a Vue SFC and caches their parsed CSTs.
// Imports nothing from ESLint or Vue: this file is also bundled into the CJS tokenizer,
// which is a second module instance, so the cache lives on `globalThis`.
import { fingerprint, parsePug } from 'pug-lint-parser'
import type { PugDocument, Range } from 'pug-lint-parser'

export interface PugTemplate {
  /** Content between `<template …>` and `</template>`. */
  range: Range
  doc: PugDocument
}

const PUG_LANGS = new Set(['pug', 'jade'])
// Element contents vue-eslint-parser tokenizes as raw text inside an HTML template.
const RAW_TEXT_TAGS = new Set(['title', 'textarea', 'style', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript', 'script'])
const WHITESPACE = new Set(['\t', '\n', '\f', '\r', ' '])
const isLetter = (c: string | undefined): boolean => c !== undefined && /[A-Za-z]/.test(c)

interface StartTag {
  name: string
  /** Attribute values by lowercased name; the first occurrence wins; `null` = no value. */
  attributes: Map<string, string | null>
  selfClosing: boolean
  /** Offset just after the closing `>`, or `text.length` when the tag is unterminated. */
  end: number
  terminated: boolean
}

/** Reads the start tag at `lt` (`text[lt] === '<'` followed by a letter), following the HTML tokenizer states. */
function readStartTag(text: string, lt: number): StartTag {
  let i = lt + 1
  while (i < text.length && !WHITESPACE.has(text[i]!) && text[i] !== '/' && text[i] !== '>') i++
  const name = text.slice(lt + 1, i).toLowerCase()
  const attributes = new Map<string, string | null>()
  const skipWhitespace = (): void => {
    while (i < text.length && WHITESPACE.has(text[i]!)) i++
  }
  while (i < text.length) {
    skipWhitespace()
    const c = text[i]
    if (c === undefined) break
    if (c === '>') return { name, attributes, selfClosing: false, end: i + 1, terminated: true }
    if (c === '/') {
      if (text[i + 1] === '>') return { name, attributes, selfClosing: true, end: i + 2, terminated: true }
      i++
      continue
    }
    const keyStart = i
    i++ // the first character may be '='
    while (i < text.length && !WHITESPACE.has(text[i]!) && !'/>='.includes(text[i]!)) i++
    const key = text.slice(keyStart, i).toLowerCase()
    skipWhitespace()
    let value: string | null = null
    if (text[i] === '=') {
      i++
      skipWhitespace()
      const q = text[i]
      if (q === '"' || q === "'") {
        const close = text.indexOf(q, i + 1)
        const valueEnd = close === -1 ? text.length : close
        value = text.slice(i + 1, valueEnd)
        i = valueEnd + 1
      } else if (q !== '>') {
        const valueStart = i
        while (i < text.length && !WHITESPACE.has(text[i]!) && text[i] !== '>') i++
        value = text.slice(valueStart, i)
      }
    }
    if (!attributes.has(key)) attributes.set(key, value)
  }
  return { name, attributes, selfClosing: false, end: text.length, terminated: false }
}

/** True when an end tag `</name` starts at `lt` and is followed by whitespace, `/` or `>`. */
function isEndTag(text: string, lt: number, name: string): boolean {
  if (text[lt + 1] !== '/') return false
  const after = lt + 2 + name.length
  return text.slice(lt + 2, after).toLowerCase() === name && after < text.length
    && (WHITESPACE.has(text[after]!) || text[after] === '/' || text[after] === '>')
}

/** Offset after the next `>` from `from`, or `text.length`. */
function skipPastGt(text: string, from: number): number {
  const gt = text.indexOf('>', from)
  return gt === -1 ? text.length : gt + 1
}

/** Offset after a comment starting at `lt`. */
function skipComment(text: string, lt: number): number {
  const close = text.indexOf('-->', lt + 4)
  return close === -1 ? text.length : close + 3
}

interface Content {
  /** Start of the end tag (`text.length` when there is none). */
  end: number
  /** Where scanning resumes. */
  next: number
}

/** Raw text content: it ends at the first matching end tag. */
function rawContent(text: string, from: number, name: string): Content {
  for (let lt = text.indexOf('</', from); lt !== -1; lt = text.indexOf('</', lt + 1)) {
    if (isEndTag(text, lt, name)) return { end: lt, next: skipPastGt(text, lt) }
  }
  return { end: text.length, next: text.length }
}

/** HTML content: it ends at the end tag that balances same-name start tags. */
function htmlContent(text: string, from: number, name: string): Content {
  let depth = 1
  let i = from
  for (let lt = text.indexOf('<', i); lt !== -1; lt = text.indexOf('<', i)) {
    if (text.startsWith('<!--', lt)) {
      i = skipComment(text, lt)
    } else if (isEndTag(text, lt, name)) {
      i = skipPastGt(text, lt)
      if (--depth === 0) return { end: lt, next: i }
    } else if (isLetter(text[lt + 1])) {
      const tag = readStartTag(text, lt)
      i = tag.end
      if (tag.selfClosing) continue
      if (tag.name === name) depth++
      else if (RAW_TEXT_TAGS.has(tag.name)) i = rawContent(text, i, tag.name).next
    } else {
      i = lt + 1
    }
  }
  return { end: text.length, next: text.length }
}

/** A root-level `<template>` block. */
interface RootTemplate {
  lang: string | null
  /** Content between the start and end tag; `null` for a self-closing `<template/>`. */
  range: Range | null
}

/**
 * Root-level `<template>` blocks, in document order.
 * Mirrors vue-eslint-parser's SFC tokenization: a root `<template>` with a non-HTML `lang`
 * and every other root block without `lang="html"` are raw text up to their first end tag.
 */
function findRootTemplates(text: string): RootTemplate[] {
  const templates: RootTemplate[] = []
  let i = 0
  for (let lt = text.indexOf('<', i); lt !== -1; lt = text.indexOf('<', i)) {
    const next = text[lt + 1]
    if (text.startsWith('<!--', lt)) {
      i = skipComment(text, lt)
      continue
    }
    if (next === '!' || next === '?' || next === '/') {
      i = skipPastGt(text, lt + 1)
      continue
    }
    if (!isLetter(next)) {
      i = lt + 1
      continue
    }
    const tag = readStartTag(text, lt)
    i = tag.end
    if (!tag.terminated) continue
    const lang = tag.attributes.get('lang') ?? null
    if (tag.selfClosing) {
      if (tag.name === 'template') templates.push({ lang, range: null })
      continue
    }
    const html = tag.name === 'template' ? !lang || lang === 'html' : lang === 'html'
    const content = html ? htmlContent(text, tag.end, tag.name) : rawContent(text, tag.end, tag.name)
    if (tag.name === 'template') templates.push({ lang, range: [tag.end, content.end] })
    i = content.next
  }
  return templates
}

/**
 * Content ranges of the root-level `<template>` blocks after the first, whatever their `lang`.
 * vue-eslint-parser runs the tokenizer on them too, but only the first is its `templateBody`.
 */
export function findLaterRootTemplateRanges(text: string): Range[] {
  return findRootTemplates(text).slice(1).flatMap((t) => (t.range ? [t.range] : []))
}

/**
 * The content range of the first root-level `<template>` when its `lang` is `pug` or `jade`, else `[]`.
 * vue-eslint-parser's `templateBody` is only ever the first root `<template>`.
 */
export function findPugTemplateRanges(text: string): Range[] {
  const [first] = findRootTemplates(text)
  return first?.range && first.lang !== null && PUG_LANGS.has(first.lang) ? [first.range] : []
}

const CACHE_KEY = Symbol.for('pug-lint.templates')
const CACHE_SIZE = 16

/** Shared LRU, keyed by full text. An optimisation only: a miss parses again. */
function cache(): Map<string, PugTemplate[]> {
  const store = globalThis as Record<symbol, unknown>
  let map = store[CACHE_KEY]
  if (!(map instanceof Map)) {
    map = new Map<string, PugTemplate[]>()
    store[CACHE_KEY] = map
  }
  return map as Map<string, PugTemplate[]>
}

/** The Pug templates of `text`, each parsed with absolute offsets. */
export function getPugTemplates(text: string): PugTemplate[] {
  const map = cache()
  const hit = map.get(text)
  if (hit) {
    map.delete(text)
    map.set(text, hit)
    return hit
  }
  const templates = findPugTemplateRanges(text).map(
    (range): PugTemplate => ({ range, doc: parsePug(text, { start: range[0], end: range[1] }) }),
  )
  map.set(text, templates)
  while (map.size > CACHE_SIZE) map.delete(map.keys().next().value!)
  return templates
}

/** The templates' fingerprints joined by `|` (`''` without templates); `null` if any template has errors. */
export function templateFingerprint(text: string): string | null {
  const templates = getPugTemplates(text)
  if (templates.some((t) => t.doc.errors.length > 0)) return null
  return templates.map((t) => fingerprint(t.doc)).join('|')
}
