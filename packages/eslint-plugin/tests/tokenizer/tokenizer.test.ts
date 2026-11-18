import { existsSync, readFileSync } from 'node:fs'
import pluginVue from 'eslint-plugin-vue'
import type { AST } from 'vue-eslint-parser'
import vueParser from 'vue-eslint-parser'
import { describe, expect, it } from 'vitest'
import { tokenizerPath } from '../../src/index.ts'
import { createLineIndex } from '../../src/tokenizer/line-index.ts'
import { PugTokenizer } from '../../src/tokenizer/tokenizer.ts'
import { eslintVersions } from '../helpers/eslint-versions.ts'
import { lintText } from '../helpers/lint.ts'
import { allNodes, dump, parseVue, parseVueStock, templateBody } from '../helpers/parse-vue.ts'
import type { AnyNode } from '../helpers/parse-vue.ts'
import { at, toCRLF, vue } from '../helpers/vue.ts'

const fixture = (name: string): string =>
  readFileSync(new URL(`../fixtures/corpus/${name}`, import.meta.url), 'utf8').replace(/^﻿/, '')

const slice = (code: string, node: { range: [number, number] }): string => code.slice(...node.range)

const kids = (el: AST.VElement): AST.VElement['children'] => el.children

const elements = (el: AST.VElement): AST.VElement[] =>
  el.children.filter((c): c is AST.VElement => c.type === 'VElement')

const isDirective = (a: AST.VAttribute | AST.VDirective): a is AST.VDirective => a.directive

describe('PugTokenizer', () => {
  it('maps tags, attributes and directives', () => {
    const code = vue('.card\n  MyButton(@click="go" :foo="x" title=\'hi\') Save')
    const body = templateBody(parseVue(code))
    const [card] = elements(body)
    expect(card!.name).toBe('div')
    expect(card!.startTag.attributes).toHaveLength(0)
    const [button] = elements(card!)
    expect(button!.name).toBe('mybutton')
    expect(button!.rawName).toBe('MyButton')

    const [click, foo, title] = button!.startTag.attributes
    expect(click!.directive).toBe(true)
    expect(isDirective(click!) && click.key.name.name).toBe('on')
    expect(isDirective(click!) && (click.key.argument as AST.VIdentifier).name).toBe('click')

    expect(isDirective(foo!) && foo.key.name.name).toBe('bind')
    expect(isDirective(foo!) && (foo.key.argument as AST.VIdentifier).name).toBe('foo')
    const fooExpr = isDirective(foo!) ? foo.value!.expression! : null
    expect(fooExpr!.type).toBe('Identifier')
    const quoted = at(code, '"x"')
    expect(fooExpr!.range).toEqual([quoted[0] + 1, quoted[1] - 1])

    expect(title!.directive).toBe(false)
    const titleValue = (title as AST.VAttribute).value!
    expect(titleValue.value).toBe('hi')
    expect(slice(code, titleValue)).toBe("'hi'")
    expect(titleValue.range).toEqual(at(code, "'hi'"))

    const texts = kids(button!).filter((c) => c.type === 'VText')
    expect(texts.map((t) => (t as AST.VText).value)).toEqual(['Save'])
  })

  it('splits mustaches out of inline text', () => {
    const code = vue('p Hello {{ name }}!')
    const [p] = elements(templateBody(parseVue(code)))
    const children = kids(p!)
    expect(children.map((c) => c.type)).toEqual(['VText', 'VExpressionContainer', 'VText'])
    expect((children[0] as AST.VText).value).toBe('Hello ')
    expect(slice(code, (children[1] as AST.VExpressionContainer).expression!)).toBe('name')
    expect((children[2] as AST.VText).value).toBe('!')
  })

  it('splits mustaches out of dot blocks and pipe text', () => {
    const code = vue('p.\n  a {{ x }} b\nspan\n  | c {{ y }}')
    const [p, span] = elements(templateBody(parseVue(code)))
    for (const [el, name] of [[p!, 'x'], [span!, 'y']] as const) {
      const container = kids(el).find((c): c is AST.VExpressionContainer => c.type === 'VExpressionContainer')
      expect(slice(code, container!.expression!)).toBe(name)
      expect(kids(el).filter((c) => c.type === 'VText').length).toBeGreaterThan(0)
    }
  })

  it('does not scan script dot blocks for mustaches', () => {
    const code = vue('script.\n  const a = {{b}}')
    const [script] = elements(templateBody(parseVue(code)))
    expect(kids(script!).map((c) => c.type)).toEqual(['VText'])
    expect((kids(script!)[0] as AST.VText).value).toBe('const a = {{b}}')
  })

  it('does not scan text inside v-pre for mustaches', () => {
    const code = vue('div(v-pre) {{ x }}\np {{ y }}')
    const [div, p] = elements(templateBody(parseVue(code)))
    expect(kids(div!).map((c) => c.type)).toEqual(['VText'])
    expect(kids(p!).map((c) => c.type)).toEqual(['VExpressionContainer'])
  })

  it('keeps text at the template root as a token only (a root Text would re-enter the tokenizer)', () => {
    const code = vue('| hello {{ x }}\ndiv')
    const body = templateBody(parseVue(code))
    expect(body.errors).toEqual([])
    expect(body.children.map((c) => c.type)).toEqual(['VExpressionContainer', 'VElement'])
    expect(body.tokens.find((t) => t.type === 'HTMLText')!.range).toEqual(at(code, 'hello '))
  })

  it('drops text left at the template root by an early close to a token', () => {
    const code = vue('p\n  div\n  | after')
    const body = templateBody(parseVue(code))
    expect(body.errors).toEqual([])
    expect(body.children.map((c) => c.type)).toEqual(['VElement', 'VElement'])
    expect(allNodes(body as unknown as AnyNode).some((n) => n.type === 'VText')).toBe(false)
    expect(body.tokens.find((t) => t.type === 'HTMLText')!.range).toEqual(at(code, 'after'))
  })

  it.each([
    ['p\n  div\n  | after', ['p', 'div']],
    ['li\n  li x\n  | after', ['li', 'li']],
    ['dt\n  dd x', ['dt', 'dd']],
  ])('follows vue-eslint-parser closing %j early, without errors', (src, names) => {
    const body = templateBody(parseVue(vue(src)))
    expect(body.errors).toEqual([])
    expect(elements(body).map((e) => e.name)).toEqual(names)
  })

  it('parses a backtick value without substitution at exact positions', () => {
    const code = vue('a(:class=`{\n  on: ok\n}`)')
    const [a] = elements(templateBody(parseVue(code)))
    const attr = a!.startTag.attributes[0]!
    expect(isDirective(attr) && attr.key.name.name).toBe('bind')
    const expr = (attr as AST.VDirective).value!.expression as unknown as AnyNode & { properties: AnyNode[] }
    expect(expr.type).toBe('ObjectExpression')
    const key = expr.properties[0]!['key'] as AnyNode
    expect(slice(code, key)).toBe('on')
    expect(key.range).toEqual(at(code, 'on'))
    const container = (attr as AST.VDirective).value!
    expect(slice(code, container).startsWith('{')).toBe(true)
  })

  it('scans textarea text for mustaches, like stock <textarea>', () => {
    const [textarea] = elements(templateBody(parseVue(vue('textarea {{ x }}'))))
    const [stock] = elements(templateBody(parseVueStock('<template><textarea>{{ x }}</textarea></template>')))
    expect(kids(stock!).map((c) => c.type)).toEqual(['VExpressionContainer'])
    expect(kids(textarea!).map((c) => c.type)).toEqual(['VExpressionContainer'])
  })

  it('parses a backtick value whose text starts with a quote as a template literal, at exact positions', () => {
    const code = vue("a(:a=`'x'` d=`\"e\"`)")
    const body = templateBody(parseVue(code))
    expect(body.errors).toEqual([])
    const [a] = elements(body)
    const [dirA, plainD] = a!.startTag.attributes
    const expr = (dirA as AST.VDirective).value!.expression!
    expect(expr.type).toBe('TemplateLiteral')
    expect(expr.range).toEqual(at(code, "`'x'`"))
    const literal = (plainD as AST.VAttribute).value!
    expect(literal.range).toEqual(at(code, '`"e"`'))
  })

  it('reports an expression value starting with a quote instead of mislocating it', () => {
    const src = vue('a(:c="p" + q title="t")')
    const parsed = templateBody(parseVue(src))
    expect(parsed.errors).toHaveLength(1)
    const error = parsed.errors[0]!
    expect(error.message).toMatch(/^Pug: .*":c"/)
    expect(error.index).toBe(at(src, '"p" + q')[0])
    expect('code' in error).toBe(false)
    const [c, title] = elements(parsed)[0]!.startTag.attributes
    // An empty value over the leading string: no expression, nothing at a wrong position.
    expect(c!.value!.range).toEqual(at(src, '"p"'))
    expect((c as AST.VDirective).value!.expression).toBeNull()
    expect((title as AST.VAttribute).value!.value).toBe('t')
    for (const token of parsed.tokens.filter((t) => t.range[0] >= at(src, 'a(')[0] && t.range[1] <= at(src, '</template>')[0])) {
      expect(token.value, token.type).toBe(src.slice(...token.range))
    }
  })

  it('keeps the VLiteral of a plain backtick attribute inside the backticks', () => {
    const code = vue('a(title=`hi`)')
    const [a] = elements(templateBody(parseVue(code)))
    const value = (a!.startTag.attributes[0] as AST.VAttribute).value!
    expect(value.value).toBe('hi')
    expect(value.range).toEqual(at(code, 'hi'))
  })

  it('survives a backtick value with substitution and an unquoted value', () => {
    const code = vue('a(:t=`x${y}`)\na(:x=b)')
    const [t, x] = elements(templateBody(parseVue(code)))
    expect(t!.startTag.attributes).toHaveLength(1)
    const attr = x!.startTag.attributes[0] as AST.VDirective
    expect(attr.directive).toBe(true)
    expect(attr.value!.expression!.type).toBe('Identifier')
    expect(slice(code, attr.value!.expression!)).toBe('b')
  })

  it('keeps attributes of several blocks in order', () => {
    const code = vue('a(x)(y)')
    const [a] = elements(templateBody(parseVue(code)))
    expect(a!.startTag.attributes.map((attr) => (attr as AST.VAttribute).key.name)).toEqual(['x', 'y'])
  })

  it('does not expose shorthands as attributes', () => {
    const code = vue('a.x#y(z)')
    const [a] = elements(templateBody(parseVue(code)))
    expect(a!.startTag.attributes.map((attr) => (attr as AST.VAttribute).key.name)).toEqual(['z'])
    const types = templateBody(parseVue(code)).tokens.map((t) => t.type)
    expect(types).toContain('PugClassShorthand')
    expect(types).toContain('PugIdShorthand')
  })

  it.each(['input(type="text")', 'Foo/'])('marks %s self-closing without an end tag', (src) => {
    const [el] = elements(templateBody(parseVue(vue(src))))
    expect(el!.startTag.selfClosing).toBe(true)
    expect(el!.endTag).toBeNull()
  })

  it('reports Pug comments as HTMLComment without the marker', () => {
    const body = templateBody(parseVue(vue('//- eslint-disable-next-line vue/x\ndiv')))
    expect(body.comments[0]!.type).toBe('HTMLComment')
    expect(body.comments[0]!.value.trim()).toBe('eslint-disable-next-line vue/x')
  })

  it('gives CRLF text the same node slices as LF text', () => {
    const lf = fixture('Basic.vue')
    const crlf = toCRLF(lf)
    const lfNodes = allNodes(templateBody(parseVue(lf)) as unknown as AnyNode)
    const crlfNodes = allNodes(templateBody(parseVue(crlf)) as unknown as AnyNode)
    expect(crlfNodes.map((n) => n.type)).toEqual(lfNodes.map((n) => n.type))
    expect(lfNodes.filter((n) => n.type === 'VAttribute').length).toBeGreaterThan(5)
    lfNodes.forEach((lfNode, i) => {
      const crlfNode = crlfNodes[i]!
      expect(crlf.slice(...crlfNode.range).replace(/\r\n/g, '\n'), `${lfNode.type} #${i}`).toBe(lf.slice(...lfNode.range))
    })
  })

  it('locates an identifier after an astral character (Bom.vue)', () => {
    const code = fixture('Bom.vue')
    const ids = allNodes(templateBody(parseVue(code)) as unknown as AnyNode)
      .filter((n) => n.type === 'Identifier' && n['name'] === 'name')
    const afterEmoji = code.indexOf('🎉')
    const id = ids.find((n) => n.range[0] > afterEmoji)
    expect(id).toBeDefined()
    expect(slice(code, id!)).toBe('name')
    expect(id!.range[0]).toBe(code.indexOf('name', afterEmoji))
  })

  it('reports a Pug syntax error without a code', () => {
    const code = vue('a(href="x')
    expect(() => parseVue(code)).not.toThrow()
    const { errors } = templateBody(parseVue(code))
    expect(errors).toHaveLength(1)
    const error = errors[0]!
    expect(error.message.startsWith('Pug: ')).toBe(true)
    expect(error.index).toBe(at(code, '"x')[0])
    expect(typeof error.lineNumber).toBe('number')
    expect(typeof error.column).toBe('number')
    expect('code' in error).toBe(false)
  })

  it.each(eslintVersions)('surfaces a Pug syntax error through vue/no-parsing-error ($label)', async (v) => {
    const { messages } = await lintText(v, vue('a(href="x'), [{
      files: ['**/*.vue'],
      plugins: { vue: pluginVue },
      languageOptions: { parser: vueParser, parserOptions: { templateTokenizer: { pug: tokenizerPath } } },
      rules: { 'vue/no-parsing-error': 'error' },
    }])
    expect(messages.map((m) => m.ruleId)).toEqual(['vue/no-parsing-error'])
    expect(messages[0]!.message).toMatch(/^Parsing error: Pug: /)
  })

  it('leaves an HTML template to the stock parser (Html.vue)', () => {
    const code = fixture('Html.vue')
    const ours = dump(templateBody(parseVue(code)) as unknown as AnyNode)
    const stock = dump(templateBody(parseVueStock(code)) as unknown as AnyNode)
    expect(JSON.stringify(ours)).toBe(JSON.stringify(stock))
  })

  it('flattens control flow, mixin calls and code into the enclosing element', () => {
    const code = vue('if ok\n  a(v-if="x")\n+m(1)\n  b\nli= n')
    const body = templateBody(parseVue(code))
    expect(elements(body).map((e) => e.name)).toEqual(['a', 'b', 'li'])
    expect(elements(body)[2]!.children).toEqual([])
    for (const type of ['PugControl', 'PugMixinCall', 'PugCode']) {
      const tokens = body.tokens.filter((t) => t.type === type)
      expect(tokens, type).toHaveLength(1)
      expect(tokens[0]!.value).toBe(slice(code, tokens[0]!))
    }
  })

  it('treats lang="jade" like lang="pug" (Jade.vue vs Basic.vue)', () => {
    // The template's content: the `lang` attribute itself is not shifted uniformly.
    const content = (file: string, shift: number): string[] =>
      templateBody(parseVue(fixture(file))).children.flatMap((c) => dump(c as unknown as AnyNode, shift))
    const basic = content('Basic.vue', 1)
    expect(basic.length).toBeGreaterThan(20)
    expect(content('Jade.vue', 0)).toEqual(basic)
  })

  it('bundles the parser source into dist/tokenizer.cjs instead of requiring it', () => {
    const bundle = readFileSync(tokenizerPath, 'utf8')
    expect(bundle).not.toMatch(/require\(["']@pug-lint\/parser/)
    expect(bundle).toContain('module.exports = ')
  })

  it.skipIf(!existsSync(new URL('../../dist/index.js', import.meta.url)))(
    'exports a tokenizerPath from dist/index.js that exists',
    async () => {
      const distUrl = new URL('../../dist/index.js', import.meta.url).href
      const dist = (await import(distUrl)) as { tokenizerPath: string }
      expect(dist.tokenizerPath).toBe(tokenizerPath)
      expect(existsSync(dist.tokenizerPath)).toBe(true)
      expect(existsSync(new URL('../../dist/index.d.ts', import.meta.url))).toBe(true)
    },
  )
})

describe('PugTokenizer construction', () => {
  it('reports a template it cannot locate once, with no tokens', () => {
    const text = vue('div {{ x }}')
    const content = text.slice(...at(text, '\ndiv {{ x }}\n'))
    const tokenizer = new PugTokenizer(content, text, { startingLine: 2, startingColumn: 0 })
    expect(tokenizer.nextToken()).toBeNull()
    expect(tokenizer.tokens).toEqual([])
    expect(tokenizer.errors).toHaveLength(1)
    expect(tokenizer.errors[0]!.message).toContain('x-pug-source-mismatch')
    expect('code' in tokenizer.errors[0]!).toBe(false)
  })

  it('reports a starting line outside the text the same way', () => {
    const text = vue('div')
    const tokenizer = new PugTokenizer('\ndiv\n', text, { startingLine: 99, startingColumn: 0 })
    expect(tokenizer.nextToken()).toBeNull()
    expect(tokenizer.tokens).toEqual([])
    expect(tokenizer.errors.map((e) => e.message)).toEqual([expect.stringContaining('x-pug-source-mismatch')])
  })
})

describe('createLineIndex', () => {
  it('splits lines on \\n only, keeping \\r as the last column', () => {
    const lines = createLineIndex('ab\r\ncd\nef')
    expect(lines.offsetOf(1, 0)).toBe(0)
    expect(lines.offsetOf(2, 1)).toBe(5)
    expect(lines.offsetOf(3, 0)).toBe(7)
    expect(lines.locOf(2)).toEqual({ line: 1, column: 2 })
    expect(lines.locOf(4)).toEqual({ line: 2, column: 0 })
    expect(lines.locOf(9)).toEqual({ line: 3, column: 2 })
    expect(() => lines.offsetOf(4, 0)).toThrow(RangeError)
  })
})
