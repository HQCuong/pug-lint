---
title: 配置
description: "配置 eslint-plugin-pug-vue：base 与 recommended 两个配置、缩进在 <template> 之下的模板、保留被屏蔽的 vue/* rule，以及插件的 key。"
---

# 配置

## 两个配置 {#the-two-configs}

两个配置都作用于 `**/*.vue`。

| 配置 | 它设置了什么 |
|---|---|
| `configs.base` | 用于 vue-eslint-parser 的 Pug 模板 tokenizer、processor（消息屏蔽和 [fix guard](./fix-guard)），并关闭会[崩溃的 `vue/*` rules](./vue-rules)。不启用任何 `vue-pug/*` rule。 |
| `configs.recommended` | `base` 加上所有推荐的 `vue-pug/*` rules，级别为 `warn`。 |

如果你想自己挑选 `vue-pug/*` rules，请使用 `base`：

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.base,
  {
    files: ['**/*.vue'],
    rules: {
      'vue-pug/indent': 'error',
      'vue-pug/attribute-quotes': ['error', 'single'],
    },
  },
]
```

你自己的 `languageOptions.parserOptions`（例如给 `<script>` 中的 TypeScript 使用的 `parser`）会与插件的合并，因此它们仍然有效。

## 缩进在 `<template>` 之下的模板 {#templates-indented-under-template}

`vue-pug/indent` 会把顶层节点放在第 0 列（`baseIndent: 0`，和 `.pug` 文件一样）。如果你的模板是写在
`<template>` 下面一级缩进的位置，请设置 `baseIndent: 1`，否则这条 rule 会把它们移到第 0 列：

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  { files: ['**/*.vue'], rules: { 'vue-pug/indent': ['warn', 2, { baseIndent: 1 }] } },
]
```

所有选项见 [`vue-pug/indent`](/zh/rules/indent)。

## 保留被屏蔽的 rule {#keeping-a-suppressed-rule}

有些 `vue/*` rules [会在 Pug 模板内部被屏蔽](./vue-rules)。想让其中某条继续在那里报告，
请用 `configure()` 构建配置，并用它代替 `vuePug.configs`：

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configure({ keepVueRules: ['vue/html-self-closing'] }).recommended,
]
```

风险自负。被屏蔽列表中的 rule 可能会误报，它的修复在 Pug 上也可能不稳定：例如，
`vue/singleline-html-element-content-newline` 每运行一遍就会多加一个空行。`keepVueRules` 不适用于会崩溃的 rules，它们始终保持关闭。

## 插件的 key {#plugin-key}

插件注册在 `vue-pug` 这个 key 下。所有 rule id（`vue-pug/indent` 等）和各个配置都使用它。
不支持用其他 key 注册该插件。

## 行尾空格、空行、文件末尾换行 {#trailing-spaces-blank-lines-final-newline}

`vue-pug/*` rules 不处理这些。请使用 [`@stylistic`](https://eslint.style/) 的 rules：
`@stylistic/no-trailing-spaces`、`@stylistic/no-multiple-empty-lines` 和 `@stylistic/eol-last`。
它们作用于整个 `.vue` 文件，包括其中的 Pug 模板，而且 fix guard 会像检查其他修复一样检查它们的修复。
