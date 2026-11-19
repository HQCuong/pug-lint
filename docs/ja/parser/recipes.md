---

description: "pug-lint-parser で作る小さなプログラム。クラスの一覧、fingerprint で検証する安全な codemod、.vue ファイルのテンプレートの検査、ノードの検索。"
---

# レシピ {#recipes}

`pug-lint-parser` で作る小さなプログラムです。どれも `npm install pug-lint-parser` したうえで、ES モジュール（`.mjs`、または `package.json` の `"type": "module"`）でそのまま動きます。

## テンプレートが使うクラスを一覧にする {#list-the-classes-a-template-uses}

クラスは、`.class` の省略記法と、静的な `class="…"` の値から得られます。`:class` は Vue のバインディングで、`class=expr` は Pug の JavaScript なので、どちらも名前のリストではありません。

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

## クォートを安全に書き換える {#rewrite-quotes-safely}

codemod は、範囲を指定してソースを編集します。前の範囲が有効なままになるよう、最後の編集から先頭に向かって適用します。そのあと、ESLint プラグインと同じ方法で自分の出力を検証します。結果がパースでき、[fingerprint](./api#fingerprint-doc) が同じでなければなりません。

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

## `.vue` ファイルのテンプレートを検査する {#check-the-template-of-a-vue-file}

`start` と `end` を使って、テンプレートの中身だけをパースします。オフセットは引き続きファイル全体を指すので、そのままエディターの位置に変換できます。

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

## ある種類のノードを探す {#find-nodes-of-one-kind}

`walk` は、すべてのノードをその親と一緒に訪れます。`vue-pug/no-pug-control-flow` rule のように、Vue テンプレートで使うべきではない Pug 専用の構文を探すには、次のようにします。

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
