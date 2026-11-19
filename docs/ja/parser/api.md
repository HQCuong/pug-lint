---

description: "pug-lint-parser の API リファレンス。parsePug とそのオプション、walk、fingerprint、literalSpans、エクスポートされる型。"
---

# API {#api}

```js
import { parsePug, walk, fingerprint, literalSpans } from 'pug-lint-parser'
```

このパッケージは ESM のみで、依存パッケージはなく、TypeScript の型を同梱しています。以下のすべてのノード型がエクスポートされています（`import type { Tag, PugDocument } from 'pug-lint-parser'`）。

**すべての位置は、渡した `text` へのオフセットです。** UTF-16 のインデックスで、`String.prototype.slice` と同じ単位です。`Range` は `[start, end)` なので、`text.slice(...range)` でノードのソースが得られ、`text.slice(0, start) + replacement + text.slice(end)` でそれを編集できます。

## `parsePug(text, options?)` {#parsepug-text-options}

```ts
function parsePug(text: string, options?: ParseOptions): PugDocument

interface ParseOptions {
  start?: number // default 0
  end?: number   // default text.length
}
```

`text[start, end)` をパースし、[ドキュメント](./syntax-tree#pugdocument)を返します。例外は投げません。パースできないものは `doc.errors` のエントリになり、パースは次の行から続きます（[エラー](./errors)を参照）。

`start` と `end` を使うと、大きなファイルの一部を、コピーせずにパースできます。たとえば `.vue` ファイルの `<template lang="pug">` ブロックの中身です。範囲は引き続き `text` 全体を基準にします。

```js
const sfc = '<template lang="pug">\ndiv\n  p Hi\n</template>\n'
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

doc.range                 // [21, 33]
doc.children[0].name      // { value: 'div', range: [22, 25] }
```

スライスのすべての行が同じ量だけインデントされている場合（`<template>` の下にインデントされたテンプレートなど）、その共通のインデントが基準になります。パーサーはそれを 0 列目として扱います。Vue がテンプレートをコンパイルする前に行うのと同じです。Pug 自体はインデントされた `.pug` ファイルを拒否するので、ここではパーサーのほうが Pug コンパイラより寛容です。

改行は LF でも CRLF でもかまいません。単独の CR も改行として読まれます。先頭の BOM は取り除かれません。読み飛ばすには `start: 1` を渡してください。

## `walk(doc, visit)` {#walk-doc-visit}

```ts
function walk(
  doc: PugDocument,
  visit: (node: PugNode, parent: PugNode | PugDocument) => void,
): void
```

すべてのノードに対して、ドキュメント順（先行順: ノードが子より先）に `visit` を呼びます。`children` と、各 `#[…]` の[タグ補間](./syntax-tree#text)のタグの中にも入ります。後者の親は、それを囲む `Text` ノードです。

```js
walk(parsePug('if ok\n  p a\nelse\n  +card(1)\n- const x = 1\n//- note\n'), (node, parent) => {
  console.log(node.type, '<', parent.type)
})
// Control < Document     (if)
// Tag < Control
// Text < Tag
// Control < Document     (else)
// MixinCall < Control
// Code < Document
// Comment < Document
```

## `fingerprint(doc)` {#fingerprint-doc}

```ts
function fingerprint(doc: PugDocument): string
```

テンプレートの**構造**を要約する文字列です。fingerprint が同じ 2 つのテンプレートは、同じ要素ツリーを描画します。ESLint プラグインは、テンプレートを変えてしまう fix を拒否するために fingerprint を比較します。

含まれるもの:

- タグ、mixin 呼び出し、テキスト、コメント、コード、制御ブロックと、それらのネスト。
- 各タグの静的なクラスと id の集合。**書き方は問いません**: `p(class="a b")` と `p.a.b` は同じ fingerprint になり、`p.a` は異なります。
- その他の属性の数と、各値の種類（なし、または文字列、式、`${}` を含むテンプレート）。
- Pug がコンパイルするすべての JavaScript。インデントを除いたテキストで比較します。式や `${}` の属性値、`&attributes(…)`、mixin の引数、コード、制御構文のヘッド、`#{…}` が対象です。
- テキストの形: 行や補間にどこで分かれているか。

無視されるもの: 空白とインデント幅、クォート、カンマ、属性の順序と名前、`class` と `id` 以外の文字列の属性値、タグ名の大文字小文字、テキストの内容、自己終了タグの `/`、ブロック展開の `:`。

```js
fingerprint(parsePug('p(class="a b") Hi')) === fingerprint(parsePug('p.a.b Hi'))  // true
fingerprint(parsePug('p.a Hi')) === fingerprint(parsePug('p.a.b Hi'))             // false
```

文字列の形式は API の一部ではありません。fingerprint は比較するだけにして、パースしないでください。

## `literalSpans(text, range)` {#literalspans-text-range}

```ts
function literalSpans(text: string, range: [number, number]): [number, number][]
```

`text[range]` にある JavaScript の式の中の、文字列リテラル（`'…'`、`"…"`）とテンプレートリテラル（`` `…` ``）の範囲です。コードと文字列の内容を区別するのに使います。たとえば、複数行のテンプレートリテラルの中身を再インデントしないようにするためです。閉じられていないリテラルは `range` の末尾まで続きます。

```js
const e = 'f("a", `b ${c}`, d)'
literalSpans(e, [0, e.length])              // [[2, 5], [7, 15]]
                                            // '"a"' and '`b ${c}`'
```

## 型 {#types}

| 型 | 内容 |
|---|---|
| `Range` | `[start: number, end: number]`、`text` へのオフセット |
| `PugDocument` | `parsePug` の結果: [木、行、エラー](./syntax-tree#pugdocument) |
| `PugNode` | `Tag \| MixinCall \| Text \| Comment \| Code \| Control \| Filter` |
| `Tag`、`MixinCall`、`Text`、`Comment`、`Code`、`Control`、`Filter` | [ノード](./syntax-tree#nodes) |
| `AttributeBlock`、`Attribute`、`AttributeValue` | [属性](./syntax-tree#attributes) |
| `TextPart` | `Text` の中の `Raw`、`Interpolation`、`TagInterpolation` |
| `ControlKeyword` | `Control` ノードのキーワード |
| `PugLine` | [ソースの 1 行](./syntax-tree#lines) |
| `PugParseError` | [`{ code, message, offset }`](./errors) |
| `ParseOptions` | `{ start?, end? }` |
