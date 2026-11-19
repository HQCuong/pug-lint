---
description: "eslint-plugin-pug-vue के सभी vue-pug/* rules: indentation, attribute blocks, quotes, commas, shorthands और Pug compile-time constructs।"
---

# Rules

`vue-pug/*` rules `<template lang="pug">` के अंदर के Pug को format और जाँचते हैं। eslint-plugin-vue के आपके `vue/*` rules
उनके साथ काम करते रहते हैं; देखें [Pug पर `vue/*` rules](/hi/guide/vue-rules)।

<!-- begin auto-generated rules list -->

✅ enabled in `configs.recommended` (at `warn`). 🔧 fixable with `--fix`.

| Rule | Description | ✅ | 🔧 |
|---|---|---|---|
| [`vue-pug/attribute-commas`](/hi/rules/attribute-commas) | require or disallow commas between attributes in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-equals-spacing`](/hi/rules/attribute-equals-spacing) | disallow spaces around the `=` and `!=` of Pug attributes | ✅ | 🔧 |
| [`vue-pug/attribute-parens-newline`](/hi/rules/attribute-parens-newline) | enforce line breaks after `(` and before `)` of multiline Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-parens-spacing`](/hi/rules/attribute-parens-spacing) | enforce consistent spacing inside the parentheses of Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-quotes`](/hi/rules/attribute-quotes) | enforce a consistent quote style for Pug attribute values | ✅ | 🔧 |
| [`vue-pug/implicit-div`](/hi/rules/implicit-div) | enforce or forbid the tag name `div` before class and id shorthands | ✅ | 🔧 |
| [`vue-pug/indent`](/hi/rules/indent) | enforce consistent indentation in Pug templates | ✅ | 🔧 |
| [`vue-pug/max-attributes-per-line`](/hi/rules/max-attributes-per-line) | enforce a maximum number of attributes per line in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/no-multi-spaces`](/hi/rules/no-multi-spaces) | disallow multiple spaces between attributes in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/no-pug-control-flow`](/hi/rules/no-pug-control-flow) | disallow Pug compile-time constructs (control flow, code, mixins, `#{}` interpolation, includes) |  |  |
| [`vue-pug/prefer-shorthand`](/hi/rules/prefer-shorthand) | enforce or forbid `.class` / `#id` shorthands for static class and id attributes | ✅ | 🔧 |
| [`vue-pug/self-closing`](/hi/rules/self-closing) | enforce or forbid the self-closing `/` of a tag | ✅ | 🔧 |

<!-- end auto-generated rules list -->
