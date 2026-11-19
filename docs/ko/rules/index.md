---
title: 규칙
description: "eslint-plugin-pug-vue의 모든 vue-pug/* 규칙: 들여쓰기, 속성 블록, 따옴표, 쉼표, 축약 표기, Pug 컴파일 타임 구문."
---

# 규칙

`vue-pug/*` 규칙은 `<template lang="pug">` 안의 Pug를 포맷하고 검사합니다. eslint-plugin-vue의 `vue/*` 규칙도
함께 계속 동작합니다. [Pug에서의 `vue/*` 규칙](/ko/guide/vue-rules)을 참고하세요.

<!-- begin auto-generated rules list -->

✅ enabled in `configs.recommended` (at `warn`). 🔧 fixable with `--fix`.

| Rule | Description | ✅ | 🔧 |
|---|---|---|---|
| [`vue-pug/attribute-commas`](/ko/rules/attribute-commas) | require or disallow commas between attributes in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-equals-spacing`](/ko/rules/attribute-equals-spacing) | disallow spaces around the `=` and `!=` of Pug attributes | ✅ | 🔧 |
| [`vue-pug/attribute-parens-newline`](/ko/rules/attribute-parens-newline) | enforce line breaks after `(` and before `)` of multiline Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-parens-spacing`](/ko/rules/attribute-parens-spacing) | enforce consistent spacing inside the parentheses of Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-quotes`](/ko/rules/attribute-quotes) | enforce a consistent quote style for Pug attribute values | ✅ | 🔧 |
| [`vue-pug/implicit-div`](/ko/rules/implicit-div) | enforce or forbid the tag name `div` before class and id shorthands | ✅ | 🔧 |
| [`vue-pug/indent`](/ko/rules/indent) | enforce consistent indentation in Pug templates | ✅ | 🔧 |
| [`vue-pug/max-attributes-per-line`](/ko/rules/max-attributes-per-line) | enforce a maximum number of attributes per line in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/no-multi-spaces`](/ko/rules/no-multi-spaces) | disallow multiple spaces between attributes in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/no-pug-control-flow`](/ko/rules/no-pug-control-flow) | disallow Pug compile-time constructs (control flow, code, mixins, `#{}` interpolation, includes) |  |  |
| [`vue-pug/prefer-shorthand`](/ko/rules/prefer-shorthand) | enforce or forbid `.class` / `#id` shorthands for static class and id attributes | ✅ | 🔧 |
| [`vue-pug/self-closing`](/ko/rules/self-closing) | enforce or forbid the self-closing `/` of a tag | ✅ | 🔧 |

<!-- end auto-generated rules list -->
