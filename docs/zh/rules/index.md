---
title: 规则
description: "eslint-plugin-pug-vue 的全部 vue-pug/* rules：缩进、属性块、引号、逗号、简写和 Pug 编译期结构。"
---

# 规则 {#rules}

`vue-pug/*` rules 负责格式化和检查 `<template lang="pug">` 中的 Pug。你在 eslint-plugin-vue 中使用的 `vue/*` rules
会继续和它们并行工作；参见 [Pug 上的 `vue/*` rules](/zh/guide/vue-rules)。

<!-- begin auto-generated rules list -->

✅ enabled in `configs.recommended` (at `warn`). 🔧 fixable with `--fix`.

| Rule | Description | ✅ | 🔧 |
|---|---|---|---|
| [`vue-pug/attribute-commas`](/zh/rules/attribute-commas) | require or disallow commas between attributes in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-equals-spacing`](/zh/rules/attribute-equals-spacing) | disallow spaces around the `=` and `!=` of Pug attributes | ✅ | 🔧 |
| [`vue-pug/attribute-parens-newline`](/zh/rules/attribute-parens-newline) | enforce line breaks after `(` and before `)` of multiline Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-parens-spacing`](/zh/rules/attribute-parens-spacing) | enforce consistent spacing inside the parentheses of Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-quotes`](/zh/rules/attribute-quotes) | enforce a consistent quote style for Pug attribute values | ✅ | 🔧 |
| [`vue-pug/implicit-div`](/zh/rules/implicit-div) | enforce or forbid the tag name `div` before class and id shorthands | ✅ | 🔧 |
| [`vue-pug/indent`](/zh/rules/indent) | enforce consistent indentation in Pug templates | ✅ | 🔧 |
| [`vue-pug/max-attributes-per-line`](/zh/rules/max-attributes-per-line) | enforce a maximum number of attributes per line in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/no-multi-spaces`](/zh/rules/no-multi-spaces) | disallow multiple spaces between attributes in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/no-pug-control-flow`](/zh/rules/no-pug-control-flow) | disallow Pug compile-time constructs (control flow, code, mixins, `#{}` interpolation, includes) |  |  |
| [`vue-pug/prefer-shorthand`](/zh/rules/prefer-shorthand) | enforce or forbid `.class` / `#id` shorthands for static class and id attributes | ✅ | 🔧 |
| [`vue-pug/self-closing`](/zh/rules/self-closing) | enforce or forbid the self-closing `/` of a tag | ✅ | 🔧 |

<!-- end auto-generated rules list -->
