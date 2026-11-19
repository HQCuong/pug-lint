import { readFileSync } from 'node:fs'
import type { AST } from 'vue-eslint-parser'
import vueEslintParser from 'vue-eslint-parser'
import { describe, expect, it } from 'vitest'
import type { Range, Tag } from 'pug-lint-parser'
import { findPugTemplateRanges, getPugTemplates, templateFingerprint } from '../../src/shared/templates.ts'
import { vue } from '../helpers/vue.ts'

const KEY = Symbol.for('pug-lint.templates')

const fixture = (name: string): string =>
  readFileSync(new URL(`../fixtures/corpus/${name}`, import.meta.url), 'utf8')

/** Content ranges of the root `<template>` elements as stock vue-eslint-parser sees them. */
function vueTemplateRanges(code: string): Range[] {
  const result = vueEslintParser.parseForESLint(code, { filePath: 'Test.vue', ecmaVersion: 'latest', sourceType: 'module' })
  const fragment = result.services!.getDocumentFragment!() as AST.VDocumentFragment
  return fragment.children
    .filter((c): c is AST.VElement => c.type === 'VElement' && c.name === 'template')
    .map((t) => [t.startTag.range[1], t.endTag!.range[0]])
}

describe('findPugTemplateRanges', () => {
  it('finds the template of vue()', () => {
    const text = vue('div')
    const ranges = findPugTemplateRanges(text)
    expect(ranges).toHaveLength(1)
    expect(text.slice(...ranges[0]!)).toBe('\ndiv\n')
  })

  it.each([
    `<template lang='pug'>\ndiv\n</template>\n`,
    `<template functional lang="pug">\ndiv\n</template>\n`,
    `<template  lang = "pug" >\ndiv\n</template>\n`,
    `<template lang="jade">\ndiv\n</template>\n`,
  ])('finds attribute variant %j', (text) => {
    const ranges = findPugTemplateRanges(text)
    expect(ranges).toHaveLength(1)
    expect(text.slice(...ranges[0]!)).toBe('\ndiv\n')
  })

  it.each([
    ['plain <template>', `<template>\n  <div/>\n</template>\n`],
    ['lang="html"', `<template lang="html">\n  <div/>\n</template>\n`],
    ['no template', `<script>\nconst a = 1\n</script>\n`],
    ['inside <script>', `<script>\nconst s = '<template lang="pug">\\ndiv\\n</template>'\n</script>\n`],
    ['inside <style>', `<style>\n/* <template lang="pug">\ndiv\n</template> */\n</style>\n`],
    ['inside a comment', `<!-- <template lang="pug">\ndiv\n</template> -->\n`],
  ])('finds nothing: %s', (_name, text) => {
    expect(findPugTemplateRanges(text)).toEqual([])
  })

  it('covers a whole body that contains template tags and closing-tag text', () => {
    const text = vue('MyList\n  template(#default)\n    | </div>\n    span x')
    const ranges = findPugTemplateRanges(text)
    expect(ranges).toHaveLength(1)
    expect(text.slice(...ranges[0]!)).toBe('\nMyList\n  template(#default)\n    | </div>\n    span x\n')
  })

  describe('ends where vue-eslint-parser ends the template', () => {
    const samples: [string, string][] = [
      ['vue()', vue('div')],
      ['closing tag in a Pug string', vue(`div(title='</template>')\n  span x`)],
      ['closing tag in Pug text', vue('p\n  | </template>')],
      ['uppercase closing tag', `<template lang="pug">\ndiv\n</TEMPLATE>\n`],
      ['closing tag with whitespace', `<template lang="pug">\ndiv\n</template >\n`],
      ['near-miss closing tag', vue('p\n  | </templates> </template-x>')],
      ['after a comment and a script', `<!-- <template lang="pug">x</template> -->\n<script>\nconst a = '</template>'\n</script>\n${vue('div')}`],
      ['after an HTML-less root block', `<i18n>\n{"a": "<template lang=\\"pug\\">"}\n</i18n>\n${vue('div')}`],
      ['jade', `<template lang="jade">\ndiv\n</template>\n`],
      ['corpus Basic.vue', fixture('Basic.vue')],
      ['corpus Crlf.vue', fixture('Crlf.vue')],
      ['corpus Tabs.vue', fixture('Tabs.vue')],
      ['corpus Jade.vue', fixture('Jade.vue')],
    ]
    it.each(samples)('%s', (_name, text) => {
      const expected = vueTemplateRanges(text)
      expect(expected).toHaveLength(1)
      expect(findPugTemplateRanges(text)).toEqual(expected)
    })
  })

  it('returns an empty range for an empty template (EmptyPug.vue)', () => {
    const text = fixture('EmptyPug.vue')
    const ranges = findPugTemplateRanges(text)
    expect(ranges).toHaveLength(1)
    expect(ranges[0]![0]).toBe(ranges[0]![1])
    const templates = getPugTemplates(text)
    expect(templates).toHaveLength(1)
    expect(templates[0]!.doc.children).toEqual([])
    expect(templates[0]!.doc.errors).toEqual([])
  })
})

describe('getPugTemplates', () => {
  it('returns the cached array on a second call', () => {
    const text = vue('div.cache-hit')
    expect(getPugTemplates(text)).toBe(getPugTemplates(text))
  })

  it('re-parses after eviction without throwing', () => {
    const text = vue('div.evicted')
    const first = getPugTemplates(text)
    for (let i = 0; i < 17; i++) getPugTemplates(vue(`span.other-${i}`))
    const again = getPugTemplates(text)
    expect(again).not.toBe(first)
    expect(again).toEqual(first)
  })

  it('keeps its cache on globalThis and survives the cache being deleted', () => {
    getPugTemplates(vue('div.shared'))
    expect((globalThis as Record<symbol, unknown>)[KEY]).toBeDefined()
    delete (globalThis as Record<symbol, unknown>)[KEY]
    const text = vue('div')
    const templates = getPugTemplates(text)
    expect(templates).toHaveLength(1)
    expect(templates[0]!.range).toEqual(findPugTemplateRanges(text)[0])
    expect(text.slice(...(templates[0]!.doc.children[0] as Tag).name!.range)).toBe('div')
    expect((globalThis as Record<symbol, unknown>)[KEY]).toBeDefined()
  })

  it('returns documents with absolute ranges', () => {
    const text = `<script>\nconst a = 1\n</script>\n${vue('div')}`
    const [template] = getPugTemplates(text)
    const tag = template!.doc.children[0] as Tag
    expect(text.slice(...tag.name!.range)).toBe('div')
    expect(template!.doc.range).toEqual(template!.range)
  })

  it('returns [] when there is no Pug template', () => {
    expect(getPugTemplates(fixture('NoTemplate.vue'))).toEqual([])
    expect(getPugTemplates(fixture('Html.vue'))).toEqual([])
  })
})

describe('templateFingerprint', () => {
  it('is a string for a valid template', () => {
    expect(typeof templateFingerprint(vue('a(x)'))).toBe('string')
  })

  it('is null when a template has errors', () => {
    expect(templateFingerprint(vue('a(href="x'))).toBeNull()
  })

  it("is '' without a Pug template", () => {
    expect(templateFingerprint(fixture('NoTemplate.vue'))).toBe('')
  })
})
