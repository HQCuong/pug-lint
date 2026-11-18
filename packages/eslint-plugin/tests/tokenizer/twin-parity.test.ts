// HTML-twin parity: the Vue AST our tokenizer builds from a Pug template has the same element skeleton
// as the one stock vue-eslint-parser builds from that template rendered by the real `pug` compiler.
import { readdirSync, readFileSync } from 'node:fs'
import { parsePug, walk } from '@pug-lint/parser'
import type { AST } from 'vue-eslint-parser'
import { describe, expect, it } from 'vitest'
import { findPugTemplateRanges } from '../../src/shared/templates.ts'
import { CAN_BE_LEFT_OPEN, NON_PHRASING, VOID_ELEMENTS } from '../../src/tokenizer/emit.ts'
import { compatFixtures, htmlTwin } from '../../tools/compat/run.ts'
import { parseVue, parseVueStock, templateBody } from '../helpers/parse-vue.ts'
import { vue } from '../helpers/vue.ts'

interface AttrSkeleton { key: string; directive: boolean; hasValue: boolean }
interface ElementSkeleton {
  name: string
  attrs: AttrSkeleton[]
  /** Only when the Pug tag has a class shorthand: shorthands ∪ static `class` tokens (twin: its `class` tokens). */
  classes?: string[]
  /** Only on an element whose Pug tag has an id shorthand. */
  id?: string | null
  mustaches: number
  children: Node[]
}

type Node = ElementSkeleton | 'text'

/** The class and id shorthands of a Pug element (from its `PugClassShorthand`/`PugIdShorthand` tokens). */
interface Shorthands { classes: string[]; id: string | undefined }

const staticAttrs = (el: AST.VElement, name: string): AST.VAttribute[] =>
  el.startTag.attributes.filter((a): a is AST.VAttribute => !a.directive && a.key.name === name)

/** Every element under `body`, pre-order. */
function elements(body: AST.VElement): AST.VElement[] {
  return body.children.flatMap((c) => (c.type === 'VElement' ? [c, ...elements(c)] : []))
}

/** The shorthands of each element of a Pug-side `body`, pre-order. */
function shorthandsOf(body: AST.VElement & AST.HasConcreteInfo): Shorthands[] {
  return elements(body).map((el) => {
    const [start, end] = el.startTag.range
    const head = body.tokens.filter((t) => t.range[0] >= start && t.range[1] <= end)
    return {
      classes: head.filter((t) => t.type === 'PugClassShorthand').map((t) => t.value.slice(1)),
      id: head.find((t) => t.type === 'PugIdShorthand')?.value.slice(1),
    }
  })
}

/**
 * The skeleton of `body`'s children. `shorthands` (the Pug side's, pre-order) picks the elements whose
 * `class` (`id`) attributes are replaced by a class token set (id value); `ours` adds the shorthands
 * themselves to it. A run of text and mustaches between elements is one `'text'` (Pug pipe lines give
 * adjacent `VText`s where HTML gives one); whitespace-only `VText`s are dropped, and root text on both
 * sides: our tokenizer emits none there by design (Task 10).
 */
function skeleton(body: AST.VElement, text: string, shorthands: Shorthands[], ours: boolean): Node[] {
  let index = 0
  const visit = (el: AST.VElement): ElementSkeleton => {
    const sh = shorthands[index++] ?? { classes: [], id: undefined }
    const replaced = new Set([...(sh.classes.length > 0 ? ['class'] : []), ...(sh.id === undefined ? [] : ['id'])])
    const out: ElementSkeleton = {
      name: el.rawName.toLowerCase(),
      attrs: el.startTag.attributes
        .map((a) => ({ key: text.slice(...a.key.range).toLowerCase(), directive: a.directive, hasValue: a.value !== null }))
        .filter((a) => a.directive || !replaced.has(a.key)),
      mustaches: el.children.filter((c) => c.type === 'VExpressionContainer').length,
      children: [],
    }
    if (sh.classes.length > 0) {
      const tokens = staticAttrs(el, 'class').flatMap((a) => a.value?.value.split(/\s+/).filter(Boolean) ?? [])
      out.classes = [...new Set([...(ours ? sh.classes : []), ...tokens])].sort()
    }
    if (sh.id !== undefined) out.id = ours ? sh.id : staticAttrs(el, 'id')[0]?.value?.value ?? null
    out.children = children(el.children, false)
    return out
  }
  const children = (nodes: AST.VElement['children'], root: boolean): Node[] => {
    const out: Node[] = []
    for (const c of nodes) {
      if (c.type === 'VElement') out.push(visit(c))
      else if (!root && (c.type === 'VExpressionContainer' || c.value.trim() !== '') && out.at(-1) !== 'text') out.push('text')
    }
    return out
  }
  return children(body.children, true)
}

/** Both skeletons of a `.vue` file with a Pug template: ours, and stock vue-eslint-parser's on its HTML twin. */
function sides(text: string): { pug: Node[]; twin: Node[] } {
  const twinText = htmlTwin(text, { keepShorthands: true })
  const pugBody = templateBody(parseVue(text))
  const shorthands = shorthandsOf(pugBody)
  return {
    pug: skeleton(pugBody, text, shorthands, true),
    twin: skeleton(templateBody(parseVueStock(twinText)), twinText, shorthands, false),
  }
}

/**
 * Why the HTML twin of `text` cannot be compared (null = it can): the template is not valid Pug, it
 * uses a construct `pug.render` evaluates or rewrites (those the compat fixtures avoid, Task 31), or
 * Pug does not compile it.
 */
function skipReason(text: string): string | null {
  const [range] = findPugTemplateRanges(text)
  const doc = parsePug(text, { start: range![0], end: range![1] })
  if (doc.errors.length > 0) return `not valid Pug (${doc.errors[0]!.message})`
  const found = new Set<string>()
  walk(doc, (node) => {
    if (node.type === 'Control' || node.type === 'Code' || node.type === 'MixinCall') found.add(node.type)
    if (node.type === 'Text' && node.parts.some((p) => p.type === 'Interpolation')) found.add('#{}/!{} interpolation')
    if (node.type !== 'Tag') return
    if (node.andAttributes.length > 0) found.add('&attributes')
    for (const a of node.attributeBlocks.flatMap((b) => b.attributes)) {
      if (a.value?.kind === 'expression') found.add('an unquoted attribute value')
      if (a.value?.kind === 'template') found.add('a backtick attribute value')
    }
  })
  if (found.size > 0) return `pug.render evaluates ${[...found].join(', ')}`
  try {
    htmlTwin(text, { keepShorthands: true })
  } catch (e) {
    return `pug cannot compile it (${(e as Error).message.trim().split('\n').at(-1)})`
  }
  return null
}

function expectParity(text: string): void {
  const { pug, twin } = sides(text)
  expect(pug).toEqual(twin)
}

const vueStyleDir = new URL('../../../pug-parser/tests/fixtures/vue-style/', import.meta.url)
const vueStyle = readdirSync(vueStyleDir).filter((f) => f.endsWith('.pug')).sort().map((name) => {
  const text = vue(readFileSync(new URL(name, vueStyleDir), 'utf8'))
  return { name, text, reason: skipReason(text) }
})

// HTML elements (WHATWG), for the drift guard below.
const HTML_TAGS = `a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code
  col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4
  h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript
  object ol optgroup option output p param picture pre progress q rp rt ruby s samp search section select slot small source
  span strong sub summary sup table tbody td template tfoot th thead time title tr track u ul var video wbr`.split(/\s+/)

/**
 * Drift guard for the vue-eslint-parser constants copied into emit.ts (void elements; `p` closed by a
 * non-phrasing tag; a can-be-left-open tag closed by itself; dt/dd): for every HTML element and every
 * listed tag, `p > tag` and `tag > tag` (`tag`, then a sibling, when void). The twin's element tree
 * shows what stock vue-eslint-parser does, so a tag added to or removed from its lists fails here.
 * Raw-text and RCDATA elements are left out: vue-eslint-parser reads their HTML content as text, Pug
 * nests elements in them.
 */
const RAW_CONTENT = new Set(['iframe', 'noscript', 'script', 'style', 'textarea', 'title'])
const drift = [...new Set([...HTML_TAGS, ...VOID_ELEMENTS, ...NON_PHRASING, ...CAN_BE_LEFT_OPEN])]
  .filter((tag) => !RAW_CONTENT.has(tag)).sort()
const driftCases: [string, string][] = [
  ...drift.map((tag): [string, string] => [`p > ${tag}`, `div\n  p\n    ${tag}${VOID_ELEMENTS.has(tag) ? '' : ' t'}\n    span s`]),
  ...drift.map((tag): [string, string] => VOID_ELEMENTS.has(tag)
    ? [`${tag} (void)`, `div\n  ${tag}\n  span s`]
    : [`${tag} > ${tag}`, `div\n  ${tag}\n    ${tag} t\n    span s`]),
  ...['dt', 'dd'].flatMap((a) => ['dt', 'dd'].map((b): [string, string] => [`dl > ${a} > ${b}`, `dl\n  ${a}\n    ${b} t\n    span s`])),
]

describe('HTML-twin parity', () => {
  it.each(compatFixtures().map((f) => [f.name, f.text] as const))('compat/%s', (_name, text) => expectParity(text))

  for (const { name, text, reason } of vueStyle) {
    if (reason) {
      console.log(`twin-parity: skipped vue-style/${name}: ${reason}`)
      it.skip(`vue-style/${name} (skipped: ${reason})`, () => {})
    } else {
      it(`vue-style/${name}`, () => expectParity(text))
    }
  }

  it('skips a minority of the vue-style fixtures', () => {
    expect(vueStyle.filter((f) => f.reason !== null).length).toBeLessThan(vueStyle.length / 2)
  })

  describe('auto-closed and void elements (copied vue-eslint-parser constants)', () => {
    it.each(driftCases)('%s', (_name, body) => {
      expectParity(vue(body))
      // vue-eslint-parser closes elements itself; a stale copy shows as an end tag we emit for an element it
      // already closed (or one we never emit), i.e. a parse error on the Pug side only.
      const errors = (templateBody(parseVue(vue(body))) as AST.VElement & { errors: AST.ParseError[] }).errors
      expect(errors.map((e) => e.message)).toEqual([])
    })
  })
})
