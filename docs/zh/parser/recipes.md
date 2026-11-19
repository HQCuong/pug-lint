---
title: 用法示例
description: "基于 pug-lint-parser 的小程序：列出 class、用 fingerprint 校验的安全 codemod、检查 .vue 文件的模板、查找节点。"
---

# 用法示例

基于 `pug-lint-parser` 的小程序。每一个在 `npm install pug-lint-parser` 之后，
放进 ES module（`.mjs`，或 `package.json` 中设置 `"type": "module"`）里都能直接运行。

## 列出模板用到的 class {#list-the-classes-a-template-uses}

class 来自 `.class` 简写和静态的 `class="…"` 值。`:class` 是 Vue
绑定，`class=expr` 是 Pug 的 JavaScript，所以两者都不是名称列表。

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

## 安全地改写引号 {#rewrite-quotes-safely}

codemod 按范围编辑源码，从最后一处编辑改到第一处，这样前面的范围仍然有效。然后它会像 ESLint 插件那样检查自己的输出：结果必须能解析，并且
[fingerprint](./api#fingerprint-doc) 相同。

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

## 检查 `.vue` 文件的模板 {#check-the-template-of-a-vue-file}

用 `start` 和 `end` 只解析模板的内容；偏移量仍然指向整个文件，
所以可以直接转换成编辑器中的位置。

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

## 查找某一类节点 {#find-nodes-of-one-kind}

`walk` 会访问每个节点，并附带它的父节点。要找出 Vue 模板不应使用的 Pug 专有结构，
就像 `vue-pug/no-pug-control-flow` rule 所做的那样：

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
