---

description: "eslint-plugin-pug-vue のすべての vue-pug/* rule。インデント、属性ブロック、クォート、カンマ、省略記法、Pug のコンパイル時構文。"
---

# ルール {#rules}

`vue-pug/*` rule は、`<template lang="pug">` の中の Pug を整形し、検査します。eslint-plugin-vue の `vue/*` rule も、これらと並んで動き続けます。詳しくは [Pug 上の `vue/*` rule](/ja/guide/vue-rules) を参照してください。

<!-- begin auto-generated rules list -->

✅ enabled in `configs.recommended` (at `warn`). 🔧 fixable with `--fix`.

| Rule | Description | ✅ | 🔧 |
|---|---|---|---|
| [`vue-pug/attribute-commas`](/ja/rules/attribute-commas) | require or disallow commas between attributes in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-equals-spacing`](/ja/rules/attribute-equals-spacing) | disallow spaces around the `=` and `!=` of Pug attributes | ✅ | 🔧 |
| [`vue-pug/attribute-parens-newline`](/ja/rules/attribute-parens-newline) | enforce line breaks after `(` and before `)` of multiline Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-parens-spacing`](/ja/rules/attribute-parens-spacing) | enforce consistent spacing inside the parentheses of Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-quotes`](/ja/rules/attribute-quotes) | enforce a consistent quote style for Pug attribute values | ✅ | 🔧 |
| [`vue-pug/implicit-div`](/ja/rules/implicit-div) | enforce or forbid the tag name `div` before class and id shorthands | ✅ | 🔧 |
| [`vue-pug/indent`](/ja/rules/indent) | enforce consistent indentation in Pug templates | ✅ | 🔧 |
| [`vue-pug/max-attributes-per-line`](/ja/rules/max-attributes-per-line) | enforce a maximum number of attributes per line in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/no-multi-spaces`](/ja/rules/no-multi-spaces) | disallow multiple spaces between attributes in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/no-pug-control-flow`](/ja/rules/no-pug-control-flow) | disallow Pug compile-time constructs (control flow, code, mixins, `#{}` interpolation, includes) |  |  |
| [`vue-pug/prefer-shorthand`](/ja/rules/prefer-shorthand) | enforce or forbid `.class` / `#id` shorthands for static class and id attributes | ✅ | 🔧 |
| [`vue-pug/self-closing`](/ja/rules/self-closing) | enforce or forbid the self-closing `/` of a tag | ✅ | 🔧 |

<!-- end auto-generated rules list -->
