---
title: API
description: "pug-lint-parser 的 API 参考：parsePug 及其选项、walk、fingerprint、literalSpans，以及导出的类型。"
---

# API

```js
import { parsePug, walk, fingerprint, literalSpans } from 'pug-lint-parser'
```

这个包仅支持 ESM，没有任何依赖，并附带 TypeScript 类型：下面的每个节点类型
都会导出（`import type { Tag, PugDocument } from 'pug-lint-parser'`）。

**每个位置都是你传入的 `text` 中的偏移量**：UTF-16 索引，和
`String.prototype.slice` 使用同一单位。`Range` 是 `[start, end)`，所以 `text.slice(...range)` 会返回节点的
源码，而 `text.slice(0, start) + replacement + text.slice(end)` 则会编辑它。

## `parsePug(text, options?)` {#parsepug-text-options}

```ts
function parsePug(text: string, options?: ParseOptions): PugDocument

interface ParseOptions {
  start?: number // default 0
  end?: number   // default text.length
}
```

解析 `text[start, end)` 并返回[文档](./syntax-tree#pugdocument)。它永远不会抛出异常：
无法解析的内容会变成 `doc.errors` 中的一条记录，并从下一行继续解析（参见
[错误](./errors)）。

`start` 和 `end` 让你无需复制就能解析较大文件的一部分，例如 `.vue` 文件中
`<template lang="pug">` 块的内容。范围仍然指向整个
`text`：

```js
const sfc = '<template lang="pug">\ndiv\n  p Hi\n</template>\n'
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

doc.range                 // [21, 33]
doc.children[0].name      // { value: 'div', range: [22, 25] }
```

当这个片段的每一行缩进量都相同时（比如缩进在
`<template>` 之下的模板），这个共同的缩进就是基准：解析器会把它当作第 0 列，和 Vue 在编译模板之前所做的一样。Pug 自己会拒绝带缩进的 `.pug` 文件，所以解析器在这里比
Pug 编译器更宽松。

换行符可以是 LF 或 CRLF；单独的 CR 也会被当作换行。开头的 BOM 不会被
去掉：请传入 `start: 1` 来跳过它。

## `walk(doc, visit)` {#walk-doc-visit}

```ts
function walk(
  doc: PugDocument,
  visit: (node: PugNode, parent: PugNode | PugDocument) => void,
): void
```

按文档顺序为每个节点调用 `visit`（先序：节点先于它的子节点）。它会进入 `children`，也会进入每个 `#[…]` [标签插值](./syntax-tree#text)的
标签，这种标签的父节点是外层的 `Text` 节点。

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

一个概括模板**结构**的字符串：fingerprint 相同的两个模板
会渲染出相同的元素树。ESLint 插件通过比较 fingerprint 来拒绝会
改变模板的修复。

它包含的内容：

- 标签、mixin 调用、文本、注释、代码和控制块，以及它们的嵌套方式；
- 每个标签的静态 class 和 id 集合，**无论写法如何**：`p(class="a b")` 和 `p.a.b`
  的 fingerprint 相同，`p.a` 则不同；
- 其他属性的数量，以及每个值的种类（无值或字符串、表达式、带 `${}` 的模板）；
- Pug 会编译的每一段 JavaScript，按其文本比较（缩进除外）：表达式和 `${}`
  属性值、`&attributes(…)`、mixin 参数、代码、控制语句头和 `#{…}`；
- 文本的形态：它在哪里被拆分成行和插值。

它忽略的内容：空白和缩进宽度、引号、逗号、属性顺序和名称、
除 `class` 和 `id` 之外的字符串属性值、标签名大小写、文本内容、自闭合标签的 `/`
以及块展开的 `:`。

```js
fingerprint(parsePug('p(class="a b") Hi')) === fingerprint(parsePug('p.a.b Hi'))  // true
fingerprint(parsePug('p.a Hi')) === fingerprint(parsePug('p.a.b Hi'))             // false
```

字符串的格式不属于 API：请比较 fingerprint，不要去解析它们。

## `literalSpans(text, range)` {#literalspans-text-range}

```ts
function literalSpans(text: string, range: [number, number]): [number, number][]
```

返回 `text[range]` 处 JavaScript 表达式中字符串字面量（`'…'`、`"…"`）和模板字面量（`` `…` ``）的范围。
用它来区分代码和字符串内容，例如
避免重新缩进多行模板字面量的内部。未终止的字面量会一直延伸到
`range` 的末尾。

```js
const e = 'f("a", `b ${c}`, d)'
literalSpans(e, [0, e.length])              // [[2, 5], [7, 15]]
                                            // '"a"' and '`b ${c}`'
```

## 类型 {#types}

| 类型 | 说明 |
|---|---|
| `Range` | `[start: number, end: number]`，`text` 中的偏移量 |
| `PugDocument` | `parsePug` 的结果：[语法树、行和错误](./syntax-tree#pugdocument) |
| `PugNode` | `Tag \| MixinCall \| Text \| Comment \| Code \| Control \| Filter` |
| `Tag`、`MixinCall`、`Text`、`Comment`、`Code`、`Control`、`Filter` | [各种节点](./syntax-tree#nodes) |
| `AttributeBlock`、`Attribute`、`AttributeValue` | [属性](./syntax-tree#attributes) |
| `TextPart` | `Text` 内部的 `Raw`、`Interpolation` 或 `TagInterpolation` |
| `ControlKeyword` | `Control` 节点的关键字 |
| `PugLine` | [一行源码](./syntax-tree#lines) |
| `PugParseError` | [`{ code, message, offset }`](./errors) |
| `ParseOptions` | `{ start?, end? }` |
