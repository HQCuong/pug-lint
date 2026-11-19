---
title: 语法树
description: "pug-lint-parser 的具体语法树：每种节点类型、属性及其值、文本部分，以及格式化工具所需的逐行信息。"
---

# 语法树

`parsePug` 返回一棵**具体**语法树：除了模板的含义，它还保留了模板是怎么写的。每个简写、括号、逗号、引号和行都有一个[范围](./api)，所以工具可以
指向其中任何一个，或者只改写某一个而不动其余部分。

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

`eol` 和 `indentUnit` 告诉格式化工具这个文件已经在使用哪种换行符和缩进。

## 节点 {#nodes}

```ts
type PugNode = Tag | MixinCall | Text | Comment | Code | Control | Filter
```

节点的 `range` 覆盖它**自己所在的行**，不包括嵌套在它之下的行；那些在
`children` 中。可以带嵌套行的节点是 `Tag`、`MixinCall`、`Code` 和 `Control`。

### `Tag` {#tag}

`a.btn#go(href="/x" :title="t") Go` 会解析成：

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

行内文本（`p Hi`）、缓冲代码（`p= msg`）、块展开的子节点（`li: a`）以及
嵌套的行，都放在 `children` 中。

### `MixinCall` {#mixincall}

`+card(title, 2).wide(x="1")`：与标签类似，带有 `name`（`card`，不含 `+`）和 `args`，
即带括号的参数范围 `(title, 2)`（没有括号时为 `null`）。它和标签一样有 `shorthands`、
`attributeBlocks`、`andAttributes` 和 `children`。

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

| `form` | 源码 |
|---|---|
| `inline` | `p Hello`（同一行中标签之后的文本） |
| `pipe` | `\| Hello`（每行一个节点） |
| `block` | `p.`、`script.` 等之下的行 |
| `html` | 一行字面 HTML，`<b>Hello</b>` |

`parts` 把文本拆分成原始文本和插值。对于 `p Hello #{name}, #[b bold] and {{ x }}`：

| 部分 | 源码 |
|---|---|
| `{ type: 'Raw' }` | `Hello ` |
| `{ type: 'Interpolation', escaped, expression }` | `#{name}`（`!{…}` 的 `escaped` 为 `false`） |
| `{ type: 'Raw' }` | `, ` |
| `{ type: 'TagInterpolation', tag }` | `#[b bold]`，其中 `tag` 是一个完整的 `Tag` 节点 |
| `{ type: 'Raw' }` | ` and {{ x }}` |

`{{ }}` 不会被拆分：它属于 Vue，留在原始文本中。

### `Comment`、`Code`、`Control`、`Filter` {#comment-code-control-filter}

| 节点 | 源码 | 字段 |
|---|---|---|
| `Comment` | `// shown`、`//- hidden`，以及嵌套在它们之下的行 | `buffered`（`//` 是，`//-` 不是）、`content` |
| `Code` | `- const x = 1`、`= value`、`!= html`，以及作为标签子节点的 `p= value` | `buffered`、`escaped`、`expression`、`children` |
| `Control` | `if`、`else if`、`else`、`unless`、`each`、`for`、`while`、`case`、`when`、`default`、`mixin`、`block`、`append`、`prepend`、`include`、`extends`、`doctype`、`yield` | `keyword`、`head`（行的其余部分）、`children` |
| `Filter` | `:markdown-it`，以及它的文本行 | `name`、`attributeBlocks`、`children`（`Text` 节点） |

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

一个标签可以有多个块（`a(x)(y)` 是合法的 Pug），所以 `attributeBlocks` 是一个列表；它
通常为空或只有一项。

| `kind` | 何时 | 示例 |
|---|---|---|
| `string` | **整个**值是一个 `'…'` 或 `"…"` 字面量 | `href="/x"` |
| `template` | 整个值是一个 `` `…` `` 字面量 | ``title=`Hi ${name}` `` |
| `expression` | 其他任何情况：Pug 会把它当作 JavaScript 编译 | `href=url`、`title="a" + b` |

对 Vue 来说，`string` 值就是指令或属性收到的内容（`:title="t"` 绑定 `t`）；
`expression` 值则由 Pug 在编译时求值，早于 Vue 看到它。

## 行 {#lines}

`doc.lines` 为被解析范围内的每个源码行提供一条记录。它回答“这一行上是什么，
应该缩进多深”，这是格式化工具需要而语法树本身没有说明的。

```ts
interface PugLine {
  range: Range          // the line, without its line ending
  indent: Range         // its leading whitespace
  kind: 'node' | 'attribute' | 'paren-close' | 'raw' | 'continuation' | 'blank'
  depth: number
  anchor: number | null // index into lines; see below
}
```

对于这个模板：

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
| *（最后一个换行之后）* | `blank` | 0 |

| `kind` | 行 | `depth` |
|---|---|---|
| `node` | 开启一个节点 | 它的嵌套深度 |
| `attribute` | 位于多行属性块内部 | 标签的深度 + 1 |
| `paren-close` | 以闭合属性块的 `)` 开头 | 标签的深度 |
| `raw` | 位于文本块、注释、代码块或 filter 内部 | 所属节点的深度 + 1 |
| `continuation` | 接续上面的一行（多行值），或在错误之后被跳过 | 那一行的深度 + 1 |
| `blank` | 空行或只有空白 | 0 |

`anchor` 设置在那些必须保持**相对于另一行的列位置**、而不是遵循 `depth` 的行上：
文本块中第一行之后的各行（锚定到第一行），以及
接续行（锚定到它所接续的行）。在

```pug
p.
  one
    two
p(title=`a
  b`) x
```

中，`two` 行锚定到 `one` 行，`title` 值的第二行锚定到它上面的一行。当
格式化工具移动锚点行时，这些行会随之移动相同的量。
