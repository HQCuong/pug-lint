---
title: "Правила"
description: "Все правила vue-pug/* в eslint-plugin-pug-vue: отступы, блоки атрибутов, кавычки, запятые, сокращения и конструкции Pug, выполняемые при компиляции."
---

# Правила {#rules}

Правила `vue-pug/*` форматируют и проверяют Pug внутри `<template lang="pug">`. Ваши правила `vue/*`
из eslint-plugin-vue продолжают работать рядом с ними; см. [правила `vue/*` на Pug](/ru/guide/vue-rules).

<!-- begin auto-generated rules list -->

✅ enabled in `configs.recommended` (at `warn`). 🔧 fixable with `--fix`.

| Rule | Description | ✅ | 🔧 |
|---|---|---|---|
| [`vue-pug/attribute-commas`](/ru/rules/attribute-commas) | require or disallow commas between attributes in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-equals-spacing`](/ru/rules/attribute-equals-spacing) | disallow spaces around the `=` and `!=` of Pug attributes | ✅ | 🔧 |
| [`vue-pug/attribute-parens-newline`](/ru/rules/attribute-parens-newline) | enforce line breaks after `(` and before `)` of multiline Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-parens-spacing`](/ru/rules/attribute-parens-spacing) | enforce consistent spacing inside the parentheses of Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-quotes`](/ru/rules/attribute-quotes) | enforce a consistent quote style for Pug attribute values | ✅ | 🔧 |
| [`vue-pug/implicit-div`](/ru/rules/implicit-div) | enforce or forbid the tag name `div` before class and id shorthands | ✅ | 🔧 |
| [`vue-pug/indent`](/ru/rules/indent) | enforce consistent indentation in Pug templates | ✅ | 🔧 |
| [`vue-pug/max-attributes-per-line`](/ru/rules/max-attributes-per-line) | enforce a maximum number of attributes per line in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/no-multi-spaces`](/ru/rules/no-multi-spaces) | disallow multiple spaces between attributes in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/no-pug-control-flow`](/ru/rules/no-pug-control-flow) | disallow Pug compile-time constructs (control flow, code, mixins, `#{}` interpolation, includes) |  |  |
| [`vue-pug/prefer-shorthand`](/ru/rules/prefer-shorthand) | enforce or forbid `.class` / `#id` shorthands for static class and id attributes | ✅ | 🔧 |
| [`vue-pug/self-closing`](/ru/rules/self-closing) | enforce or forbid the self-closing `/` of a tag | ✅ | 🔧 |

<!-- end auto-generated rules list -->
