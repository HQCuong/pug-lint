import { readdirSync, readFileSync } from 'node:fs'
import type { AST } from 'vue-eslint-parser'
import { describe, expect, it } from 'vitest'
import type { Range } from '@pug-lint/parser'
import { findPugTemplateRanges } from '../../src/shared/templates.ts'
import { parseVue } from '../helpers/parse-vue.ts'
import { toCRLF, vue } from '../helpers/vue.ts'

const corpusDir = new URL('../fixtures/corpus/', import.meta.url)
const corpus: [string, string][] = readdirSync(corpusDir)
  .filter((f) => f.endsWith('.vue'))
  .sort()
  .flatMap((name) => {
    const text = readFileSync(new URL(name, corpusDir), 'utf8').replace(/^﻿/, '')
    return [[name, text], [`${name} (CRLF)`, toCRLF(text)]] as [string, string][]
  })

// Task 9's adversarial samples, plus several root templates.
const adversarial: [string, string][] = [
  ['closing tag in a Pug string', vue(`div(title='</template>')\n  span x`)],
  ['closing tag in Pug text', vue('p\n  | </template>')],
  ['uppercase closing tag', `<template lang="pug">\ndiv\n</TEMPLATE>\n`],
  ['closing tag with whitespace', `<template lang="pug">\ndiv\n</template >\n`],
  ['near-miss closing tag', vue('p\n  | </templates> </template-x>')],
  ['after a comment and a script', `<!-- <template lang="pug">x</template> -->\n<script>\nconst a = '</template>'\n</script>\n${vue('div')}`],
  ['after an HTML-less root block', `<i18n>\n{"a": "<template lang=\\"pug\\">"}\n</i18n>\n${vue('div')}`],
  ['attribute variants', `<template functional  lang = 'pug' >\ndiv\n</template>\n`],
  ['HTML template first, Pug second', `<template>\n  <div></div>\n</template>\n<template lang="pug">\ndiv\n</template>\n`],
  ['two Pug templates', `${vue('a')}\n${vue('b')}`],
  ['self-closing template first', `<template />\n${vue('div')}`],
  ['Pug template first, HTML second', `${vue('a')}\n<template>\n  <div></div>\n</template>\n`],
]

/** Content range of the first root `<template>` when it is Pug, as vue-eslint-parser built it. */
function parsedPugRanges(result: ReturnType<typeof parseVue>): Range[] {
  const fragment = result.services!.getDocumentFragment!() as AST.VDocumentFragment
  const tpl = fragment.children.find((c): c is AST.VElement => c.type === 'VElement' && c.name === 'template')
  if (!tpl) return []
  const lang = tpl.startTag.attributes.find((a): a is AST.VAttribute => !a.directive && a.key.name === 'lang')?.value?.value
  if (lang !== 'pug' && lang !== 'jade') return []
  return [[tpl.startTag.range[1], tpl.endTag!.range[0]]]
}

describe.each([...corpus, ...adversarial])('locator equals templateBody: %s', (_name, code) => {
  it('finds the range vue-eslint-parser hands to the tokenizer, without a mismatch', () => {
    const result = parseVue(code)
    expect(findPugTemplateRanges(code)).toEqual(parsedPugRanges(result))
    const errors = result.ast.templateBody?.errors ?? []
    expect(errors.filter((e) => e.message.includes('x-pug-source-mismatch'))).toEqual([])
  })
})

describe('several root templates', () => {
  it('ignores a Pug template after an HTML one', () => {
    const code = adversarial.find(([n]) => n === 'HTML template first, Pug second')![1]
    expect(findPugTemplateRanges(code)).toEqual([])
    const body = parseVue(code).ast.templateBody!
    expect(body.errors).toEqual([])
    expect(body.tokens.some((t) => t.type.startsWith('Pug') || t.type === 'HTMLText' && t.value === 'div')).toBe(false)
  })

  it('takes only the first of two Pug templates', () => {
    const code = adversarial.find(([n]) => n === 'two Pug templates')![1]
    const ranges = findPugTemplateRanges(code)
    expect(ranges).toHaveLength(1)
    expect(code.slice(...ranges[0]!)).toBe('\na\n')
    const body = parseVue(code).ast.templateBody!
    expect(body.errors).toEqual([])
    expect(body.children.filter((c) => c.type === 'VElement').map((c) => (c as AST.VElement).name)).toEqual(['a'])
  })
})
