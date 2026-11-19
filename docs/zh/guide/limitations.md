---
title: 已知限制
description: "eslint-plugin-pug-vue 的已知限制：多行属性值、简写、与 HTML 模板 AST 的差异，以及 fix guard 的开销。"
---

# 已知限制

- **多行属性值需要使用反引号。** `'…'` 或 `"…"` 值中间的换行是 Pug 语法错误（Pug 本身就无法编译），
  会通过 `vue/no-parsing-error` 报告。
  当模板存在解析错误时，不会在其中应用任何修复。
- **简写对 `vue/*` rules 来说不是属性。** `.class` 和 `#id` 简写不会
  作为属性暴露出来，所以 `vue/no-restricted-class` 之类的 rules 看不到简写写出的 class。
- **Vue AST 与 HTML 模板的 AST 有几处不同**，`vue/*` rules 可能会注意到：
  每一行管道文本（`| text`）都是独立的文本节点；直接位于模板根部的文本没有
  文本节点；字符串属性值会原样传递，所以指令字符串中的转义引号
  （`:x="f(\"a\")"`）可能产生多余的 Vue 解析错误。
- **不带引号的属性值和 `${}` 属性值**（`a(href=url)`、``a(title=`${x}`)``）是 Pug
  的编译期表达式，不是 Vue 绑定。它们会作为普通属性值传给 `vue/*` rules，
  而 fix guard 会丢弃所有改写它们的修复。
- **以引号开头的值必须是一个完整的字符串。** `a(title="x" + y)` 是合法的 Pug，但会被
  按设计报告为解析错误（`vue/no-parsing-error`）：请写成 `a(title=("x" + y))` 或
  `a(:title="'x' + y")`。
- **单独的 CR 换行。** 在行尾是单独 `\r`（旧版 Mac 风格）的模板中，
  `vue-pug/*` rules 会报告问题但不会修复，tokenizer 会报告解析错误。
  请把文件转换成 LF 或 CRLF。
- **有些 Pug 语法会被解析器报告为不支持**，或者解析结果与 Pug 不同：
  参见[不支持的 Pug 语法](./unsupported-syntax)。
- **fix guard 的开销与部分修复集：** 参见 [fix guard](./fix-guard#cost)。
