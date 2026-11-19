---
title: "Рецепты"
description: "Небольшие программы на pug-lint-parser: список классов, безопасный codemod с проверкой через fingerprint, проверка шаблона файла .vue, поиск узлов."
---

# Рецепты {#recipes}

Небольшие программы на `pug-lint-parser`. Каждая запускается как есть после `npm install pug-lint-parser`
в ES-модуле (`.mjs` или `"type": "module"` в `package.json`).

## Список классов, которые использует шаблон {#list-the-classes-a-template-uses}

Классы берутся из сокращений `.class` и из статических значений `class="…"`. `:class` — это привязка Vue,
а `class=expr` — JavaScript Pug, поэтому ни то ни другое не является списком имён.

```js
import { parsePug, walk } from 'pug-lint-parser'

const text = `nav.menu(class="dark wide")
  a.item#home(href="/") Home
  a(class="item", :class="{ active }") Docs
`
const doc = parsePug(text)
const classes = new Set()

walk(doc, (node) => {
  if (node.type !== 'Tag') return
  for (const s of node.shorthands) {
    if (s.kind === 'class') classes.add(s.value)
  }
  for (const block of node.attributeBlocks) {
    for (const attr of block.attributes) {
      // Only static strings: `:class` is a Vue binding, `class=expr` is Pug JavaScript.
      if (attr.key.raw !== 'class' || attr.value?.kind !== 'string') continue
      for (const name of text.slice(...attr.value.inner).split(/\s+/)) {
        if (name) classes.add(name)
      }
    }
  }
})

console.log([...classes]) // [ 'menu', 'dark', 'wide', 'item' ]
```

## Безопасная перезапись кавычек {#rewrite-quotes-safely}

Codemod правит исходник по диапазонам, от последней правки к первой, чтобы более ранние диапазоны
оставались верными. Затем он проверяет собственный результат так же, как плагин ESLint: результат должен
разбираться и иметь тот же [отпечаток](./api#fingerprint-doc).

```js
import { fingerprint, parsePug, walk } from 'pug-lint-parser'

/** Rewrite '…' attribute values as "…", unless the value contains a double quote. */
function doubleQuotes(text) {
  const doc = parsePug(text)
  if (doc.errors.length > 0) return text // never edit a template that does not parse

  const edits = []
  walk(doc, (node) => {
    if (node.type !== 'Tag' && node.type !== 'MixinCall') return
    for (const block of node.attributeBlocks) {
      for (const { value } of block.attributes) {
        if (value?.kind !== 'string' || value.quote !== "'") continue
        const inner = text.slice(...value.inner)
        if (inner.includes('"')) continue
        edits.push({ range: value.range, text: `"${inner}"` })
      }
    }
  })

  // Apply from the end, so the earlier ranges stay valid.
  let out = text
  for (const { range, text: replacement } of edits.sort((a, b) => b.range[0] - a.range[0])) {
    out = out.slice(0, range[0]) + replacement + out.slice(range[1])
  }

  // The same check the ESLint plugin makes: the structure must not change.
  const after = parsePug(out)
  if (after.errors.length > 0 || fingerprint(after) !== fingerprint(doc)) return text
  return out
}

console.log(doubleQuotes(`a(href='/docs' title='Say "hi"') Docs\n`))
// a(href="/docs" title='Say "hi"') Docs
```

## Проверка шаблона файла `.vue` {#check-the-template-of-a-vue-file}

Разбирайте только содержимое шаблона через `start` и `end`; смещения по-прежнему указывают во весь файл,
поэтому напрямую превращаются в позиции в редакторе.

```js
import { parsePug } from 'pug-lint-parser'

const sfc = `<template lang="pug">
div
  p(class="oops) Hi
</template>
`
// Parse only the template's content; ranges and offsets still refer to the whole file.
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

for (const error of doc.errors) {
  const before = sfc.slice(0, error.offset)
  const line = before.split('\n').length
  const column = error.offset - before.lastIndexOf('\n')
  console.log(`${line}:${column} ${error.code}: ${error.message}`)
}
// 3:11 unterminated-string: Unterminated string
```

## Поиск узлов одного вида {#find-nodes-of-one-kind}

`walk` обходит каждый узел вместе с его родителем. Чтобы найти конструкции, существующие только в Pug и
не нужные в шаблоне Vue, как это делает правило `vue-pug/no-pug-control-flow`:

```js
import { parsePug, walk } from 'pug-lint-parser'

const text = 'ul\n  each item in items\n    li= item\n'
walk(parsePug(text), (node) => {
  if (node.type === 'Control' || node.type === 'Code') {
    console.log(node.type, text.slice(...node.range))
  }
})
// Control each item in items
// Code = item
```
