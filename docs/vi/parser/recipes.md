---
title: Công thức
description: "Những chương trình nhỏ xây trên pug-lint-parser: liệt kê class, một codemod an toàn được kiểm bằng fingerprint, kiểm tra template của file .vue, tìm node."
---

# Công thức

Những chương trình nhỏ xây trên `pug-lint-parser`. Mỗi cái chạy được ngay sau `npm install pug-lint-parser`
trong một ES module (`.mjs`, hoặc `"type": "module"` trong `package.json`).

## Liệt kê các class mà template dùng {#list-the-classes-a-template-uses}

Class đến từ shorthand `.class` và từ giá trị `class="…"` tĩnh. `:class` là một Vue binding và
`class=expr` là JavaScript của Pug, nên cả hai đều không phải danh sách tên.

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

## Viết lại dấu nháy một cách an toàn {#rewrite-quotes-safely}

Một codemod sửa mã nguồn theo range, từ edit cuối đến edit đầu để các range phía trước vẫn đúng.
Sau đó nó tự kiểm tra kết quả như plugin ESLint: kết quả phải parse được và có cùng
[fingerprint](./api#fingerprint-doc).

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

## Kiểm tra template của file `.vue` {#check-the-template-of-a-vue-file}

Chỉ parse nội dung của template bằng `start` và `end`; offset vẫn trỏ vào toàn bộ file, nên chúng đổi
thẳng thành vị trí trong editor.

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

## Tìm các node cùng một loại {#find-nodes-of-one-kind}

`walk` ghé thăm mọi node, kèm node cha. Để tìm các construct chỉ có ở Pug mà template Vue không
nên dùng, như rule `vue-pug/no-pug-control-flow` làm:

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
