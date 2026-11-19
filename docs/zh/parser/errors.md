---
title: 错误
description: "pug-lint-parser 的错误码及示例、解析器在错误之后如何恢复，以及如何把偏移量转换成行和列。"
---

# 错误

`parsePug` 永远不会抛出异常。无法解析的内容会变成 `doc.errors` 中的一条记录，模板的其余部分仍会被解析：

```ts
interface PugParseError {
  code: string     // one of the codes below
  message: string  // for people; may change between versions
  offset: number   // where the problem is, as an offset into text
}
```

请根据 `code` 匹配，不要根据 `message`。要显示行和列，请从偏移量开始计算：

```js
const before = text.slice(0, error.offset)
const line = before.split('\n').length                    // 1-based
const column = error.offset - before.lastIndexOf('\n')    // 1-based
```

## 恢复 {#recovery}

错误不会中止解析。解析器会跳到出错结构的末尾，或者跳到行尾，然后继续解析下一行。错误之后无法安置的行，比如
嵌套在不能有子节点的结构之下的行，会以 `continuation` 类型保留在 `doc.lines` 中，
并且不会为它们构建节点。

```js
parsePug('div\n  p(class="a)\n  span ok\n  li(a=1 a=2)\n').errors
// [
//   { code: 'unterminated-string', message: 'Unterminated string', offset: 14 },
//   { code: 'duplicate-attribute', message: 'Duplicate attribute "a"', offset: 37 },
// ]
```

ESLint 插件不会在存在错误的模板内部应用任何修复，因为它无法检查它们。

## 错误码 {#codes}

| `code` | 示例 | 消息 |
|---|---|---|
| `unterminated-string` | `p(title="hi) x` | Unterminated string |
| `unclosed-attributes` | `p(title="hi"` | Attribute block is not closed with ")" |
| `unclosed-arguments` | `+card(1, 2` | Mixin arguments are not closed with ")" |
| `missing-attribute-value` | `p(title=) x` | Expected a value after the operator |
| `duplicate-attribute` | `p(a="1" a="2")` | Duplicate attribute "a" |
| `unexpected-character` | `p(a!b) x` | Expected "=" after "!" |
| `unbalanced-key` | `p([a="1") x` | Unclosed "[" in an attribute key |
| `bad-escape` | `p(a="\x")` | Invalid escape sequence in a JavaScript string |
| `inconsistent-indentation` | 空格缩进的行中间出现一个 Tab 缩进的行 | Invalid indentation, you can use tabs or spaces but not both |
| `unterminated-interpolation` | `p Hi #{name` | Interpolation is not closed with "}" |
| `unsupported-syntax` | `#{tag} x` | Unsupported syntax: "#{tag} x" |

每个错误码涵盖一类问题；`unexpected-character`、`unbalanced-key`、
`inconsistent-indentation` 和 `unsupported-syntax` 有多种消息。

这些与 Pug 编译器所拒绝的情况一致，但有一处有意的差异：`'…'` 或 `"…"` 属性值内部的换行
是 `unterminated-string`，和 JavaScript 一样。多行值请使用反引号。

## `unsupported-syntax` {#unsupported-syntax}

这个错误码标记的是解析器没有处理的合法 Pug，比如插值的标签名
（`#{tag}`）或没有标签的文本块。还有少数写法解析时不报错，但结果与 Pug 不同。这两份列表都在[不支持的 Pug 语法](/zh/guide/unsupported-syntax)中。
