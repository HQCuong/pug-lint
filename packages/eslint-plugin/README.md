<div align="center">

<a href="https://pug-lint.dev/"><img src="https://pug-lint.dev/logo.svg" alt="" width="64" height="64"></a>

# eslint-plugin-pug-vue

ESLint for Pug templates in Vue single-file components.

[![npm version](https://img.shields.io/npm/v/eslint-plugin-pug-vue?color=2e8b62&label=npm)](https://www.npmjs.com/package/eslint-plugin-pug-vue)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-pug-vue?color=2e8b62)](https://www.npmjs.com/package/eslint-plugin-pug-vue)
[![CI](https://github.com/HQCuong/pug-lint/actions/workflows/ci.yml/badge.svg)](https://github.com/HQCuong/pug-lint/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/npm/l/eslint-plugin-pug-vue?color=2e8b62)](https://github.com/HQCuong/pug-lint/blob/main/LICENSE)

**[Documentation](https://pug-lint.dev/)** · [Getting started](https://pug-lint.dev/guide/getting-started) · [Rules](https://pug-lint.dev/rules/)

</div>

---

ESLint linting and formatting for `<template lang="pug">` (and `lang="jade"`) in Vue single-file
components.

- Your `vue/*` rules from eslint-plugin-vue run on Pug templates, under their usual names and with
  your usual options.
- The `vue-pug/*` rules format the Pug itself (indentation, attribute layout, quotes, commas,
  shorthands), and one optional rule reports Pug compile-time constructs.
- Every fix that touches a Pug template is checked before ESLint applies it, so `--fix` and
  fix-on-save do not break templates.
- No Prettier, no separate formatter: fixes come from ESLint.

## Requirements

- Node.js `^20.19.0 || ^22.13.0 || >=24`
- ESLint `^9.15.0 || ^10.0.0`, flat config only (`eslint.config.js`)
- `eslint-plugin-vue` `^10.0.0` and `vue-eslint-parser` `^10.0.0`

## Install

```sh
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

## Configure

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

Put `...vuePug.configs.recommended` **after** the eslint-plugin-vue configs: it sets the parser
options, the processor and the `vue/*` rules that must be off for Pug.

- `configs.base`: the tokenizer, the processor and the crashing `vue/*` rules turned off; no
  `vue-pug/*` rule enabled.
- `configs.recommended`: `base` plus every recommended `vue-pug/*` rule at `warn`.

More in [Configuration](https://pug-lint.dev/guide/configuration): templates indented under `<template>`
(`baseIndent`), keeping a suppressed `vue/*` rule with `configure()`, trailing spaces and blank
lines.

### VS Code: fix on save

With the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint),
add to `.vscode/settings.json`:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

## Rules

<!-- begin auto-generated rules list -->

✅ enabled in `configs.recommended` (at `warn`). 🔧 fixable with `--fix`.

| Rule | Description | ✅ | 🔧 |
|---|---|---|---|
| [`vue-pug/attribute-commas`](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/attribute-commas.md) | require or disallow commas between attributes in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-equals-spacing`](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/attribute-equals-spacing.md) | disallow spaces around the `=` and `!=` of Pug attributes | ✅ | 🔧 |
| [`vue-pug/attribute-parens-newline`](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/attribute-parens-newline.md) | enforce line breaks after `(` and before `)` of multiline Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-parens-spacing`](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/attribute-parens-spacing.md) | enforce consistent spacing inside the parentheses of Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/attribute-quotes`](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/attribute-quotes.md) | enforce a consistent quote style for Pug attribute values | ✅ | 🔧 |
| [`vue-pug/implicit-div`](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/implicit-div.md) | enforce or forbid the tag name `div` before class and id shorthands | ✅ | 🔧 |
| [`vue-pug/indent`](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/indent.md) | enforce consistent indentation in Pug templates | ✅ | 🔧 |
| [`vue-pug/max-attributes-per-line`](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/max-attributes-per-line.md) | enforce a maximum number of attributes per line in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/no-multi-spaces`](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/no-multi-spaces.md) | disallow multiple spaces between attributes in Pug attribute blocks | ✅ | 🔧 |
| [`vue-pug/no-pug-control-flow`](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/no-pug-control-flow.md) | disallow Pug compile-time constructs (control flow, code, mixins, `#{}` interpolation, includes) |  |  |
| [`vue-pug/prefer-shorthand`](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/prefer-shorthand.md) | enforce or forbid `.class` / `#id` shorthands for static class and id attributes | ✅ | 🔧 |
| [`vue-pug/self-closing`](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/self-closing.md) | enforce or forbid the self-closing `/` of a tag | ✅ | 🔧 |

<!-- end auto-generated rules list -->

## Learn more

- [The fix guard](https://pug-lint.dev/guide/fix-guard): how fixes are checked so they cannot break a template.
- [`vue/*` rules on Pug](https://pug-lint.dev/guide/vue-rules): which eslint-plugin-vue rules are turned off or
  suppressed inside Pug templates, and why.
- [Known limitations](https://pug-lint.dev/guide/limitations) and
  [unsupported Pug syntax](https://pug-lint.dev/guide/unsupported-syntax).
- [Troubleshooting](https://pug-lint.dev/guide/troubleshooting).
- [Migrating from eslint-plugin-vue-pug](https://pug-lint.dev/guide/migration).

## License

[MIT](./LICENSE)
