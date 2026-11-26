---
title: pug-lint-parser
description: "pug-lint-parser は、lint やフォーマッター向けの Pug パーサーです。正確なソース範囲とエラー回復を備え、例外を投げず、依存パッケージもありません。"
---

# pug-lint-parser

lint やフォーマッター向けに作られた、Pug テンプレートの具象構文木（CST）パーサーです。[`eslint-plugin-pug-vue`](https://github.com/HQCuong/pug-lint/tree/main/packages/eslint-plugin) の土台になっているパーサーです。

- **例外を投げません。** パースできない入力は `errors` のエントリになり、パースは次の行から続きます。
- **正確なソース範囲。** すべてのノード、属性、値、省略記法、カンマ、行が `[start, end)` の範囲を持ちます。渡したテキストへの UTF-16 オフセットなので、位置を調整せずにソースを切り出したり、最小限の編集を組み立てたりできます。
- **一部分をその場でパースできます。** `parsePug(text, { start, end })` は `text[start, end)` だけをパースします（たとえば `<template lang="pug">` ブロックの中身）。範囲は引き続き `text` 全体を基準にします。
- **改行コードを保持します。** LF と CRLF のどちらも扱え、`doc.eol` は最初に見つかった改行コードです。
- 実行時の依存パッケージはありません。ESM のみです。Node.js `^22.13.0 || >=24`。

## 使い方 {#usage}

```js
import { parsePug, walk } from 'pug-lint-parser'

const text = 'ul#list\n  li.item(v-for="x in xs" :key="x") {{ x }}\n'
const doc = parsePug(text)

console.log(doc.errors) // []
walk(doc, (node) => {
  if (node.type === 'Tag') console.log(node.name?.value ?? 'div', text.slice(...node.range))
})
// ul ul#list
// li li.item(v-for="x in xs" :key="x") {{ x }}
```

## API {#api}

すべてのノード型を含む完全なリファレンスはサイトにあります。[API](https://pug-lint.dev/ja/parser/api)、[構文木](https://pug-lint.dev/ja/parser/syntax-tree)、[エラー](https://pug-lint.dev/ja/parser/errors)、[レシピ](https://pug-lint.dev/ja/parser/recipes)です。

- `parsePug(text, options?)` → `PugDocument`。`options.start` / `options.end` で、パースを `text` のその範囲に限定します。
- `walk(doc, visit)`: すべてのノードに対して、ドキュメント順に `visit(node, parent)` を呼びます。タグ補間（`#[…]`）の中のタグも含みます。
- `fingerprint(doc)` → `string`: 木の構造の要約です（タグとそのネスト、クラスと id の集合、属性の数、テキストと補間の形）。空白、クォート、属性の順序、静的な `class` と `id` 以外の属性の名前と値、タグ名の大文字小文字、テキストの内容、コードや制御構文のヘッドの内容は無視するため、`p(class="a b")` と `p.a.b` は同じ fingerprint になります。ESLint プラグインは、テンプレートの構造を変える fix を拒否するために fingerprint を比較します。
- `literalSpans(text, range)` → JavaScript の式に含まれる文字列リテラルとテンプレートリテラルの範囲。
- すべてのノードの型: `PugDocument`、`PugNode`、`Tag`、`AttributeBlock`、`Attribute`、`AttributeValue`、`Text`、`Comment`、`Code`、`Control`、`MixinCall`、`Filter`、`PugLine`、`PugParseError` など（`src/ast.ts` を参照）。

`PugDocument` は、`children`（木）、`errors`（`{ code, message, offset }`）、`lines`（ソースの 1 行ごとに 1 エントリ。インデントの範囲、種類、論理的な深さを持ちます）、`eol`、`indentUnit` を持ちます。

## 未対応の構文 {#unsupported-syntax}

一部の Pug の書き方はエラーコード `unsupported-syntax` で報告され、いくつかはエラーなしで、ただし Pug とは異なる解釈でパースされます。それらは [docs/unsupported-syntax.md](https://github.com/HQCuong/pug-lint/blob/main/packages/pug-parser/docs/unsupported-syntax.md) に載っています。

## ライセンス {#license}

MIT
