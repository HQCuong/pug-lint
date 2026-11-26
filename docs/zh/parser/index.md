---
title: pug-lint-parser
description: "pug-lint-parser：面向 lint 和格式化工具的 Pug 解析器，带有精确的源码范围和错误恢复。它永远不会抛出异常，也没有任何依赖。"
---

# pug-lint-parser

用于 Pug 模板的具体语法树（CST）解析器，专为 lint 和格式化工具而设计。
它是 [`eslint-plugin-pug-vue`](https://github.com/HQCuong/pug-lint/tree/main/packages/eslint-plugin) 背后的解析器。

- **永不抛出异常。** 无法解析的输入会变成 `errors` 中的一条记录，并从下一行继续解析。
- **精确的源码范围。** 每个节点、属性、值、简写、逗号和行都有一个
  `[start, end)` 范围：它们是你传入文本的 UTF-16 偏移量，所以你可以直接切出源码，或者
  构造最小的编辑，而无需调整位置。
- **就地解析一个片段。** `parsePug(text, { start, end })` 只解析 `text[start, end)`（例如
  `<template lang="pug">` 块的内容）；范围仍然指向整个 `text`。
- **保留换行符。** LF 和 CRLF 都能处理；`doc.eol` 是找到的第一个换行符。
- 没有运行时依赖。仅支持 ESM。Node.js `^22.13.0 || >=24`。

## 用法 {#usage}

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

完整的参考文档（包含每种节点类型）在本站：[API](/zh/parser/api)、
[语法树](/zh/parser/syntax-tree)、[错误](/zh/parser/errors)和
[用法示例](/zh/parser/recipes)。

- `parsePug(text, options?)` → `PugDocument`。`options.start` / `options.end` 把解析限制在
  `text` 的该范围内。
- `walk(doc, visit)`：按文档顺序为每个节点调用 `visit(node, parent)`，包括
  标签插值（`#[…]`）内部的标签。
- `fingerprint(doc)` → `string`：语法树的结构摘要（标签及其嵌套、
  class 和 id 集合、属性数量、文本和插值的形态）。它会忽略
  空白、引号风格、属性顺序、除静态 `class` 和
  `id` 之外的属性名称和值、标签名大小写、文本内容，以及代码和控制语句头的内容，所以 `p(class="a b")` 和 `p.a.b` 的
  fingerprint 相同。ESLint 插件通过比较 fingerprint 来拒绝会改变模板结构的修复。
- `literalSpans(text, range)` → JavaScript 表达式中字符串和模板字面量的范围。
- 每种节点的类型：`PugDocument`、`PugNode`、`Tag`、`AttributeBlock`、`Attribute`、
  `AttributeValue`、`Text`、`Comment`、`Code`、`Control`、`MixinCall`、`Filter`、`PugLine`、
  `PugParseError` 等（见 `src/ast.ts`）。

`PugDocument` 包含 `children`（语法树）、`errors`（`{ code, message, offset }`）、`lines`（每个源码行
一条记录，带有它的缩进范围、类型和逻辑深度）、`eol` 和 `indentUnit`。

## 不支持的语法 {#unsupported-syntax}

有些 Pug 写法会以错误码 `unsupported-syntax` 报告，另有少数写法解析时不报错，但与 Pug 的结果不同。它们列在
[docs/unsupported-syntax.md](https://github.com/HQCuong/pug-lint/blob/main/packages/pug-parser/docs/unsupported-syntax.md)。

## 许可证 {#license}

MIT
