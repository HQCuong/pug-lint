# @pug-lint/eslint-plugin: guide for coding agents

> Working on the pug-lint repository itself? Read
> [CONTRIBUTING.md](https://github.com/HQCuong/pug-lint/blob/main/CONTRIBUTING.md) instead.

This file is for an AI agent setting up or fixing lint problems in a Vue project that uses
`@pug-lint/eslint-plugin`. It ships in the npm package, so it matches the installed version. Full
docs: <https://pug-lint.hqcuong.workers.dev>, also as Markdown for agents:
[`/llms.txt`](https://pug-lint.hqcuong.workers.dev/llms.txt) (index) and
[`/llms-full.txt`](https://pug-lint.hqcuong.workers.dev/llms-full.txt) (every page in one file).

## What it does

- Lints `<template lang="pug">` (and `lang="jade"`) in `.vue` files with ESLint: `vue/*` rules from
  eslint-plugin-vue run on Pug templates, and `vue-pug/*` rules format the Pug with `--fix`.
- Every fix inside a Pug template is checked before it is applied; a fix that would change the
  template's structure is dropped and its problem stays reported.

## Setup

Requires ESLint `^9.15.0 || ^10.0.0` with a flat config, `eslint-plugin-vue` `^10` and
`vue-eslint-parser` `^10`.

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from '@pug-lint/eslint-plugin'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended, // must come after the eslint-plugin-vue configs
]
```

## Rules of thumb

- Rule ids are `vue-pug/<name>`; the plugin key is always `vue-pug`.
- Do not re-enable these rules for `.vue` files: they crash on Pug templates, and
  `configs.base` turns them off. The error looks like
  `TypeError: Cannot read properties of null (reading 'type')`.

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

- Some layout `vue/*` rules are silenced inside Pug templates only; their `vue-pug/*` replacement
  does the job there. Do not "fix" this by turning the processor off.
- Templates indented one level under `<template>`:
  `'vue-pug/indent': ['warn', 2, { baseIndent: 1 }]`.
- A problem that `--fix` leaves in place was dropped by the fix guard: fix it by hand, keeping the
  template's structure. While `vue/no-parsing-error` reports a Pug syntax error in a template, no
  fix is applied inside it, so fix the syntax error first.
- A line break inside a `'…'` or `"…"` attribute value is a Pug syntax error; use backticks for
  multi-line values.
