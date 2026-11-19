---
title: 与 oxlint 搭配使用
description: "在使用 oxlint 的项目中使用 eslint-plugin-pug-vue：oxlint 负责脚本，ESLint 负责 Vue 模板，并用 eslint-plugin-oxlint 避免重复报告。"
---

# 与 oxlint 搭配使用

[Oxlint](https://oxc.rs/docs/guide/usage/linter) 是一个用 Rust 编写、快得多的 linter。在
`.vue` 文件中，它只检查 `<script>` 块：不检查 `<template>`、HTML 或 Pug，
也无法加载本插件，因为本插件需要 vue-eslint-parser 来读取模板。

所以在使用 oxlint 的项目中，请两个都运行：

- **oxlint** 负责 JavaScript 和 TypeScript，包括 `.vue` 文件的 `<script>`；
- **ESLint** 负责 oxlint 目前还做不到的部分：模板，使用 eslint-plugin-vue 和
  `eslint-plugin-pug-vue`。

[`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) 会在 ESLint 中关闭
你的 oxlint 配置已经运行的每一条 rule，这样同一个问题不会被报告两次，ESLint 也能
少做一些工作。

## 安装 {#install}

```sh
npm install --save-dev oxlint eslint-plugin-oxlint \
  eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

## 配置 oxlint {#configure-oxlint}

用 `npx oxlint --init` 创建 `.oxlintrc.json`，并把 `vue` 加到它的 plugins 中，这样 oxlint 也会在 `<script>` 块上运行
它的 Vue rules：

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "vue"],
  "categories": {
    "correctness": "error"
  }
}
```

## 配置 ESLint {#configure-eslint}

把 oxlint 的配置放在**最后**，位于 `vuePug.configs.recommended` 之后：

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'
import oxlint from 'eslint-plugin-oxlint'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  // Last: turn off the rules that .oxlintrc.json already runs.
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
]
```

它关闭的 rules 都是脚本 rules（`no-debugger`、`vue/no-dupe-keys`、
`vue/valid-define-props` 等）。它不会关闭任何模板 rule，也不会关闭任何 `vue-pug/*` rule，所以 Pug
模板的 lint 和格式化与没有 oxlint 时完全一样。

## 运行 {#run-them}

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint:fix": "oxlint --fix && eslint . --fix"
  }
}
```

Oxlint 先运行：它只需几毫秒，它的错误会在 ESLint 启动之前就显示出来。Oxlint 会跳过
你的 `.gitignore` 列出的文件，所以如果 `node_modules` 还不在里面，请把它加进去。

`&&` 会在第一个仍报告错误的 linter 处停下。如果 oxlint 发现了一个它无法修复的错误（比如
一条 `debugger` 语句），`lint:fix` 就会停在那里，ESLint 不会格式化模板。请修复
那个错误，或单独运行 `npx eslint . --fix`。

## VS Code {#vs-code}

在 [ESLint 扩展](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)旁边安装
[Oxc 扩展](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)，
并让两者都在保存时修复：

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```

两者不会修复同一个东西：oxlint 修复脚本，ESLint 修复模板，而且 ESLint 在 Pug 模板中做的每个修复仍然会经过 [fix guard](./fix-guard)。

## 不用 ESLint？ {#without-eslint}

暂时不行。Oxlint 可以运行用 JavaScript 编写的 ESLint 插件，但它只会把 `.vue` 文件的
`<script>` 块交给它们，而自定义 parser 以及像 Vue 模板这样的文件语言，
在 oxc 中仍在开发。等 oxlint 能 lint Vue 模板之后，本插件也可以跟进：它的 parser
`pug-lint-parser` 并不依赖 ESLint。在那之前，请继续用 ESLint 处理 `.vue` 模板。
