---
title: 工作原理
description: "eslint-plugin-pug-vue 如何 lint Vue 中的 Pug：给 vue-eslint-parser 用的 Pug tokenizer、vue/* 与 vue-pug/* rules，以及检查每个修复的 fix guard。"
---

# 工作原理

ESLint 自己读不懂 Pug，而 eslint-plugin-vue 只认识 HTML 模板。插件把两者连接起来，
并在 ESLint 写入之前检查每个修复。

<HowItWorks />

## 1. 解析 {#_1-parse}

[vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser) 为 eslint-plugin-vue 解析 `.vue` 文件。
对于用其他语言写的模板，它会请一个 *tokenizer* 把那种语言转换成它从 HTML 得到的 token。插件为 `lang="pug"` 和 `lang="jade"` 注册了一个。

tokenizer 用 [`pug-lint-parser`](/zh/parser/) 解析模板，然后为每个 Pug 元素发出开始标签、结束标签、
文本和 `{{ }}` token，位置精确对应 Pug 源码。
vue-eslint-parser 据此构建它惯用的模板 AST，所以 `vue/*` rules 会指向你的 Pug 中正确的行和列。

Pug 语法错误会变成解析错误，由 `vue/no-parsing-error` 报告。

## 2. Lint {#_2-lint}

两类 rules 在同一个文件上运行：

- 来自 eslint-plugin-vue 的 **`vue/*` rules** 读取 Vue 模板 AST，和在 HTML
  模板上一样：缺失的 key、未使用的变量、属性顺序、已弃用的语法。
- **`vue-pug/*` rules** 直接读取来自 `pug-lint-parser` 的 Pug 语法树。这棵树保留了
  Vue AST 会丢失的信息：缩进、逗号、引号、括号、`.class` 和 `#id` 简写。
  格式化类的 rules 就在这里工作。

## 3. 检查 {#_3-check}

插件包装了 eslint-plugin-vue 的 processor，它会在 ESLint 使用每条消息之前先看到它：

- **屏蔽。** 少数 `vue/*` rules 无法在 Pug 上工作：它们会误报，或者它们的
  修复会把 HTML 写进 Pug 模板。当这些消息位于 Pug 模板内部时会被丢弃，而且只在那里丢弃，因此它们仍会检查你的 HTML 模板。
  在 Pug 上会崩溃的那几条 rules 则直接关闭。[完整列表](./vue-rules)。
- **fix guard。** 每个涉及 Pug 模板的修复都会先应用到文件的副本上，再由
  `pug-lint-parser` 重新解析。插件会比较前后的结构：标签及其
  嵌套、class 和 id、属性数量、文本的形态以及每一个 JavaScript 表达式。只要
  有任何变化，或者副本不再能解析，修复就会被丢弃，它的警告则保留。
  [详情](./fix-guard)。

之后 ESLint 会应用剩下的修复，通过 `eslint --fix` 或你编辑器的保存时修复。

## 两个包 {#the-two-packages}

| 包 | 作用 |
|---|---|
| [`eslint-plugin-pug-vue`](https://www.npmjs.com/package/eslint-plugin-pug-vue) | ESLint 插件：tokenizer、`vue-pug/*` rules、processor 和配置。你要安装的就是它。 |
| [`pug-lint-parser`](/zh/parser/) | 以上一切所基于的 Pug 解析器。它对 ESLint 和 Vue 一无所知，你可以单独使用它。 |
