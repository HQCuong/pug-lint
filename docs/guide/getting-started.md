---
description: "Install eslint-plugin-pug-vue and lint Pug templates in Vue single-file components with ESLint: requirements, install, flat config and the first eslint --fix."
---

# Getting started

`eslint-plugin-pug-vue` lints and formats `<template lang="pug">` (and `lang="jade"`) in Vue
single-file components:

- Your `vue/*` rules from eslint-plugin-vue run on Pug templates, under their usual names and with
  your usual options.
- The [`vue-pug/*` rules](/rules/) format the Pug itself: indentation, attribute layout, quotes,
  commas, shorthands. One optional rule reports Pug compile-time constructs.
- Every fix that touches a Pug template is checked before ESLint applies it
  ([the fix guard](./fix-guard)), so `--fix` and fix-on-save do not break templates.
- No Prettier and no separate formatter: fixes come from ESLint.

## Requirements

- Node.js `^20.19.0 || ^22.13.0 || >=24`
- ESLint `^9.15.0 || ^10.0.0`, flat config only (`eslint.config.js`)
- `eslint-plugin-vue` `^10.0.0` and `vue-eslint-parser` `^10.0.0`

## Install

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

Put `...vuePug.configs.recommended` **after** the eslint-plugin-vue configs. It sets the parser
options, the processor and the rules that must be off for Pug. A later config that sets its own
processor, or turns one of the [crashing rules](./vue-rules) back on, breaks linting of Pug files.

## Run it

```sh
npx eslint .          # report problems
npx eslint . --fix    # fix what can be fixed
```

To fix on save in VS Code, see [Editor setup](./editor-setup).

## Next steps

- [Configuration](./configuration): the two configs, `baseIndent`, keeping a suppressed rule.
- [Rules](/rules/): what each `vue-pug/*` rule does and its options.
- [Known limitations](./limitations) before you roll it out on a large codebase.
- Coming from `eslint-plugin-vue-pug`? Read [the migration guide](./migration).
- Using oxlint? Run it next to ESLint: see [Using with oxlint](./oxlint).
