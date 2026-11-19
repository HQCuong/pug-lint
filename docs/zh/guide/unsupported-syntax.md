---
title: 不支持的 Pug 语法
description: "pug-lint-parser 报告为不支持，或解析结果与 Pug 编译器不同的 Pug 写法，以及如何改写它们。"
---

# 报告为 `unsupported-syntax` 的语法 {#syntax-reported-as-unsupported-syntax}

解析器永远不会抛出异常。它没有建模的输入，会在第一个无法读取的偏移处变成一个 `unsupported-syntax`
错误，该行的其余部分会被跳过。
本文列出了这个错误的所有已知来源。其他任何产生
`unsupported-syntax` 的情况都是 bug。

“Invalid Pug”标记的是 Pug 本身就会拒绝的写法；之所以列出它们，是因为
解析器对它们也使用这个错误码。

## 行 {#lines}

| 写法 | 示例 | 说明 |
| --- | --- | --- |
| 插值的标签名 | `#{tag} text`, `#{tag}/` | |
| 插值的 mixin 名 | `+#{name}()` | `+ name`（`+` 后面有空格）是 mixin 调用。 |
| 没有标签的文本块 | 只有一个 `.` 的行，下面缩进嵌套着文本行 | Pug 会把文本放到父级中。请使用 `\|` 行。 |
| 行首的标签插值或 mustache | `#[b x] y`, `{{ x }}` | 请使用 `\| #[b x] y` / `\| {{ x }}`。 |
| 其他任何不是以 Pug 结构开头的内容 | `)`, `@x`, `.5` | |
| 嵌套在管道文本之下的行 | `\| a` 下面缩进了一个 `p` | Invalid Pug。只在第一个嵌套行报告一次；嵌套的行会被跳过，并形成一个错误恢复区域（`doc.lines` 的类型为 `continuation`）。嵌套在字面 HTML（`<ul>`）之下的行是合法的：Pug 会让它们成为同级节点，解析器也是如此。 |
| 嵌套在缓冲代码之下的行 | `= x` 或 `!= x` 下面缩进了一个 `p` | Invalid Pug。报告并恢复的方式与管道文本之下相同。在 `p= x` 之下，这些行是 `p` 的子节点，和 Pug 一致。 |

## 标签或 mixin 调用的头部之后 {#after-a-tag-or-mixin-call-head}

| 写法 | 示例 | 说明 |
| --- | --- | --- |
| 标签之后的非缓冲代码 | `p- x` | |
| `.` 后面同一行还有其他内容 | `p. text`, `p.: a` | Invalid Pug。 |
| mixin 调用之后的文本块 | `+m.` | |
| mixin 调用之后的块展开 | `+m: p` | `MixinCall` 没有 `expansion` 字段。作为子节点则没问题：`li: +m`。 |
| mixin 调用之后的 `/` | `+m/` | |
| `/` 之后的块展开 | `img/: x` | Invalid Pug。 |
| `:` 后面没有跟空格和子节点 | `li:`, `li(x):b`, `when 1:` | Invalid Pug。 |
| 不是标签或 mixin 调用的展开子节点 | `li: \| x`, `li: <b>x</b>`, `li: = x`, `li: // c`, `li: if x`, `when 1: each x in y` | 这里控制关键字永远不会被当作标签名读取。 |
| 标签之后的内联 filter | `p: :markdown text` | |

## 控制语句头 {#control-heads}

| 写法 | 示例 | 说明 |
| --- | --- | --- |
| 条件或循环之后的块展开 | `else: p`, `else : p`, `if x: p`, `unless x: p`, `else if x: p`, `while x: p`, `case x: p`, `each a in b: p`, `for a in b: p` | Invalid Pug。在语句头中，位于字符串和括号之外、且不是用来闭合顶层 `?` 的第一个 `:` 处报告（所以 `if a ? b : c` 和 `each v in {a: 1}` 没问题）。展开在 `when` 和 `default` 之后是有效的：`when 1: p a`。 |

## filter {#filters}

| 写法 | 示例 | 说明 |
| --- | --- | --- |
| filter 头之后不是文本的内容 | `:a(x):b`, `:md.x` | 嵌套的 filter 只按 `:a:b(attrs)` 的形式读取，属性写在最后一个名字之后。 |

## 标签插值 `#[…]` {#tag-interpolation}

| 写法 | 示例 | 说明 |
| --- | --- | --- |
| 不是以标签开头 | `#[+m]`, `#[\| x]`, `#[- x]`, `#[:cdata x]` | `#[…]` 内部不会读取 mixin 调用、文本、代码和 filter。 |
| 头部之后跟着的不是文本、`=`/`!=` 代码或 `: child` | `#[p.]`, `#[p- x]`, `#[img/: x]` | |

## 没有报错，但解析结果与 Pug 不同 {#parsed-without-an-error-but-not-as-pug-does}

由差分 oracle 发现（`tests/oracle`，Task 17）。

| 写法 | 示例 | 说明 |
| --- | --- | --- |
| block 名称之后的注释 | `block content // c` | Pug 会在 `//` 处结束名称，并把其余部分变成一个同级注释，该注释还会接管嵌套的行。解析器则把它保留在 `block` 头部中。 |
| 重复的属性或 id | `a(x=1 x=2)`, `#a#b` | Pug 会拒绝它们；解析器会接受。 |
| `each` 之后空的 `else` | `each x in y` … `else` 下面没有嵌套内容 | Pug 会拒绝它；解析器会接受。 |
