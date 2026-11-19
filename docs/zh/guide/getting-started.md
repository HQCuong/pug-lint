---
title: 快速开始
description: "安装 eslint-plugin-pug-vue，用 ESLint 对 Vue 单文件组件中的 Pug 模板进行 lint：环境要求、安装、flat config 和第一次 eslint --fix。"
---

# 快速开始

`eslint-plugin-pug-vue` 用来对 Vue 单文件组件中的 `<template lang="pug">`（以及 `lang="jade"`）进行 lint 和格式化：

- 来自 eslint-plugin-vue 的 `vue/*` rules 会在 Pug 模板上运行，名称不变，选项也和你平时用的一样。
- [`vue-pug/*` rules](/zh/rules/) 负责格式化 Pug 本身：缩进、属性布局、引号、
  逗号、简写。另有一条可选的 rule 用来报告 Pug 的编译期语法。
- 每个涉及 Pug 模板的修复在 ESLint 应用之前都会经过检查
  （[fix guard](./fix-guard)），所以 `--fix` 和保存时修复不会破坏模板。
- 不需要 Prettier，也不需要单独的格式化工具：修复全部来自 ESLint。

## 环境要求 {#requirements}

- Node.js `^20.19.0 || ^22.13.0 || >=24`
- ESLint `^9.15.0 || ^10.0.0`，只支持 flat config（`eslint.config.js`）
- `eslint-plugin-vue` `^10.0.0` 和 `vue-eslint-parser` `^10.0.0`

## 安装 {#install}

::: code-group

```sh [npm]
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [pnpm]
pnpm add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [yarn]
yarn add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

:::

## 配置 {#configure}

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

请把 `...vuePug.configs.recommended` 放在 eslint-plugin-vue 的配置**之后**。它会设置 parser
选项、processor，以及在 Pug 上必须关闭的 rules。如果后面的配置设置了它自己的
processor，或把某条[会崩溃的 rule](./vue-rules) 重新打开，Pug 文件的 lint 就会出问题。

## 运行 {#run-it}

```sh
npx eslint .          # report problems
npx eslint . --fix    # fix what can be fixed
```

要在 VS Code 中设置保存时修复，请参阅[编辑器设置](./editor-setup)。

## 下一步 {#next-steps}

- [配置](./configuration)：两个配置、`baseIndent`、保留被屏蔽的 rule。
- [规则](/zh/rules/)：每条 `vue-pug/*` rule 的作用及其选项。
- 在大型代码库中推广之前，请先看[已知限制](./limitations)。
- 从 `eslint-plugin-vue-pug` 迁移过来？请阅读[迁移指南](./migration)。
- 在用 oxlint？让它和 ESLint 并行运行：参见[与 oxlint 搭配使用](./oxlint)。
