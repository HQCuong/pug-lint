---
title: 故障排查
description: "解决 eslint-plugin-pug-vue 的常见问题：vue/* rules 崩溃、修复没有被应用、Pug 模板中没有任何报告。"
---

# 故障排查

## `TypeError: Cannot read properties of null (reading 'type')`（或 `'range'`） {#typeerror-cannot-read-properties-of-null-reading-type-or-range}

在 Pug 模板上会崩溃的某条 `vue/*` rule，被放在 `...vuePug.configs.recommended`（或 `base`）之后的某个配置重新打开了，
例如一个共享配置，或者启用它的某条 `rules` 条目。`configs.base` 会对每个 `.vue` 文件关闭这些 rules：

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

请把 `...vuePug.configs.recommended` 放在所有启用它们的配置之后，或者从你自己的
`rules` 中移除它们。在 Pug 模板上请改用对应的 `vue-pug/*` 替代 rule。

## 问题被报告了，但 `--fix` 没有修复它 {#a-problem-is-reported-but-fix-does-not-fix-it}

[fix guard](./fix-guard) 丢弃了这个修复，因为应用它会改变模板的结构，或者让模板无法解析。请手动修复那一行。如果你认为这个修复是安全的，请带上那个模板
[提一个 issue](https://github.com/HQCuong/pug-lint/issues/new/choose)。

另外请检查模板中是否有 `vue/no-parsing-error` 问题：当模板存在 Pug
语法错误时，不会在其中应用任何修复。

## Pug 模板中没有任何报告 {#nothing-is-reported-in-pug-templates}

- 该块必须是 `<template lang="pug">` 或 `<template lang="jade">`。
- `...vuePug.configs.recommended`（或 `base`）必须放在 eslint-plugin-vue 的配置之后，并且后面的
  配置不能为 `**/*.vue` 设置它自己的 `processor`。
- 在 VS Code 中，`vue` 必须在 `eslint.validate` 里（参见[编辑器设置](./editor-setup)）。

## 编辑器和命令行结果不一致 {#the-editor-and-the-cli-disagree}

ESLint 扩展使用的 ESLint 或配置可能和你终端里的不一样。运行
`npx eslint --print-config src/App.vue`，并与扩展的输出面板
（*ESLint* 频道）对比。
