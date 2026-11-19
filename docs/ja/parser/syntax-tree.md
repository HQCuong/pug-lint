---

description: "pug-lint-parser の具象構文木。すべてのノード型、属性とその値、テキストの部品、フォーマッターが必要とする行ごとの情報。"
---

# 構文木 {#syntax-tree}

`parsePug` は**具象**構文木を返します。テンプレートの意味だけでなく、それがどう書かれているかも保持します。すべての省略記法、括弧、カンマ、クォート、行が[範囲](./api)を持つので、ツールはそのどれでも指し示したり、ほかを変えずに 1 つだけ書き換えたりできます。

## `PugDocument` {#pugdocument}

```ts
interface PugDocument {
  type: 'Document'
  text: string             // the text passed to parsePug
  range: Range             // [start, end) that was parsed
  children: PugNode[]      // the top-level nodes
  errors: PugParseError[]  // see Errors
  lines: PugLine[]         // one entry per source line, see Lines
  eol: '\n' | '\r\n'       // the first line ending found; '\n' if there is none
  indentUnit: string       // the indentation of the first nested line, relative to its parent; '  ' if none
}
```

`eol` と `indentUnit` は、ファイルがすでにどの改行コードとインデントを使っているかをフォーマッターに伝えます。

## ノード {#nodes}

```ts
type PugNode = Tag | MixinCall | Text | Comment | Code | Control | Filter
```

ノードの `range` は**そのノード自身の行**を覆い、その下にネストされた行は含みません。ネストされた行は `children` にあります。ネストされた行を取れるノードは `Tag`、`MixinCall`、`Code`、`Control` です。

### `Tag` {#tag}

`a.btn#go(href="/x" :title="t") Go` は次のようにパースされます。

```js
{
  type: 'Tag',
  range: [0, 33],                                   // the whole head line
  name: { value: 'a', range: [0, 1] },              // null for an implicit div: .card
  shorthands: [
    { kind: 'class', value: 'btn', range: [1, 5] }, // range includes the '.'
    { kind: 'id', value: 'go', range: [5, 8] },     // and the '#'
  ],
  attributeBlocks: [{ range: [8, 30], attributes: [/* see Attributes */], commas: [] }],
  andAttributes: [],                                // &attributes(obj): { range, expression }
  selfClose: null,                                  // the '/' of img/
  dot: null,                                        // the '.' of p. (text block)
  expansion: null,                                  // the ':' of li: a
  children: [{ type: 'Text', form: 'inline', range: [31, 33], content: [31, 33], parts: [/* … */] }],
}
```

インラインのテキスト（`p Hi`）、バッファ付きコード（`p= msg`）、ブロック展開の子（`li: a`）、ネストされた行は、すべて `children` に入ります。

### `MixinCall` {#mixincall}

`+card(title, 2).wide(x="1")`: タグと同様ですが、`name`（`+` を除いた `card`）と `args` を持ちます。`args` は括弧を含む引数の範囲 `(title, 2)` です（括弧がなければ `null`）。タグと同じく `shorthands`、`attributeBlocks`、`andAttributes`、`children` を持ちます。

### `Text` {#text}

```ts
interface Text {
  type: 'Text'
  form: 'inline' | 'pipe' | 'block' | 'html'
  range: Range
  content: Range       // the text itself, after `| ` or the tag
  parts: TextPart[]
}
```

| `form` | ソース |
|---|---|
| `inline` | `p Hello`（同じ行でタグの後ろにあるテキスト） |
| `pipe` | `\| Hello`（1 行につき 1 ノード） |
| `block` | `p.`、`script.` などの下の行 |
| `html` | リテラル HTML の行、`<b>Hello</b>` |

`parts` は、テキストを生のテキストと補間に分割します。`p Hello #{name}, #[b bold] and {{ x }}` の場合は次のとおりです。

| 部品 | ソース |
|---|---|
| `{ type: 'Raw' }` | `Hello ` |
| `{ type: 'Interpolation', escaped, expression }` | `#{name}`（`!{…}` は `escaped: false`） |
| `{ type: 'Raw' }` | `, ` |
| `{ type: 'TagInterpolation', tag }` | `#[b bold]`。`tag` は完全な `Tag` ノード |
| `{ type: 'Raw' }` | ` and {{ x }}` |

`{{ }}` は分割されません。これは Vue のものなので、生のテキストの中に残ります。

### `Comment`、`Code`、`Control`、`Filter` {#comment-code-control-filter}

| ノード | ソース | フィールド |
|---|---|---|
| `Comment` | `// shown`、`//- hidden`、およびその下にネストされた行 | `buffered`（`//` は true、`//-` は false）、`content` |
| `Code` | `- const x = 1`、`= value`、`!= html`、およびタグの子としての `p= value` | `buffered`、`escaped`、`expression`、`children` |
| `Control` | `if`、`else if`、`else`、`unless`、`each`、`for`、`while`、`case`、`when`、`default`、`mixin`、`block`、`append`、`prepend`、`include`、`extends`、`doctype`、`yield` | `keyword`、`head`（行の残り）、`children` |
| `Filter` | `:markdown-it` と、そのテキスト行 | `name`、`attributeBlocks`、`children`（`Text` ノード） |

## 属性 {#attributes}

```ts
interface AttributeBlock {
  range: Range        // includes '(' and ')'
  attributes: Attribute[]
  commas: Range[]     // the commas between attributes, if any
}

interface Attribute {
  range: Range
  key: { raw: string; range: Range }                  // href, :title, @click, v-model.trim
  operator: { value: '=' | '!='; range: Range } | null // null for a boolean attribute: disabled
  value: AttributeValue | null
}

interface AttributeValue {
  range: Range
  raw: string
  kind: 'string' | 'template' | 'expression'
  quote: '"' | "'" | '`' | null
  inner: Range | null       // between the quotes; null for an expression
  hasSubstitution: boolean  // a template literal with ${…}
}
```

1 つのタグが複数のブロックを持つこともあります（`a(x)(y)` は有効な Pug です）。そのため `attributeBlocks` はリストで、通常は空か、1 つのエントリを持ちます。

| `kind` | 条件 | 例 |
|---|---|---|
| `string` | 値の**全体**が 1 つの `'…'` または `"…"` リテラル | `href="/x"` |
| `template` | 値の全体が 1 つの `` `…` `` リテラル | ``title=`Hi ${name}` `` |
| `expression` | それ以外すべて。Pug が JavaScript としてコンパイルします | `href=url`、`title="a" + b` |

Vue にとって、`string` の値は、ディレクティブや属性が受け取るものです（`:title="t"` は `t` をバインドします）。`expression` の値は、Vue が見る前に、Pug がコンパイル時に評価します。

## 行 {#lines}

`doc.lines` には、パースした範囲のソースの 1 行ごとに 1 つのエントリがあります。「この行には何があり、どの深さでインデントすべきか」に答えるもので、フォーマッターに必要ですが、木だけでは分かりません。

```ts
interface PugLine {
  range: Range          // the line, without its line ending
  indent: Range         // its leading whitespace
  kind: 'node' | 'attribute' | 'paren-close' | 'raw' | 'continuation' | 'blank'
  depth: number
  anchor: number | null // index into lines; see below
}
```

次のテンプレートの場合:

```pug
ul#list
  li(
    v-for="x in xs"
    :key="x"
  ) {{ x }}
  p.
    some text
```

| 行 | `kind` | `depth` |
|---|---|---|
| `ul#list` | `node` | 0 |
| `  li(` | `node` | 1 |
| `    v-for="x in xs"` | `attribute` | 2 |
| `    :key="x"` | `attribute` | 2 |
| `  ) {{ x }}` | `paren-close` | 1 |
| `  p.` | `node` | 1 |
| `    some text` | `raw` | 2 |
| *（最後の改行の後）* | `blank` | 0 |

| `kind` | 行 | `depth` |
|---|---|---|
| `node` | ノードを始める | そのネストの深さ |
| `attribute` | 複数行の属性ブロックの中 | タグの深さ + 1 |
| `paren-close` | ブロックを閉じる `)` で始まる | タグの深さ |
| `raw` | テキストブロック、コメント、コードブロック、フィルターの中 | 所有者の深さ + 1 |
| `continuation` | 上の行の続き（複数行の値）、またはエラーの後で読み飛ばされた行 | その行の深さ + 1 |
| `blank` | 空、または空白だけ | 0 |

`anchor` は、`depth` に従うのではなく、**別の行を基準にした**列を保つべき行に設定されます。テキストブロックの 2 行目以降（最初の行を基準にします）と、continuation の行（続きとなる元の行を基準にします）です。次の例では、

```pug
p.
  one
    two
p(title=`a
  b`) x
```

`two` の行は `one` の行を基準にし、`title` の値の 2 行目はその上の行を基準にします。フォーマッターが基準の行を動かすときは、これらの行も同じ量だけ動かします。
