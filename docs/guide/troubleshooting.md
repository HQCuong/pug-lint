---
description: "Fix common problems with eslint-plugin-pug-vue: crashing vue/* rules, fixes that are not applied, nothing reported in Pug templates."
---

# Troubleshooting

## `TypeError: Cannot read properties of null (reading 'type')` (or `'range'`)

One of the `vue/*` rules that crash on Pug templates was turned back on by a config placed after
`...vuePug.configs.recommended` (or `base`), for example a shared config or a `rules` entry that
enables it. `configs.base` turns these off for every `.vue` file:

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

Put `...vuePug.configs.recommended` after every config that enables them, or remove them from your
own `rules`. Use the `vue-pug/*` replacement for Pug templates instead.

## A problem is reported but `--fix` does not fix it

The [fix guard](./fix-guard) dropped the fix because applying it would have changed the template's
structure or made it unparsable. Fix that line by hand. If you think the fix was safe, please
[open an issue](https://github.com/HQCuong/pug-lint/issues/new/choose) with the template.

Also check that the template has no `vue/no-parsing-error` problem: while a template has a Pug
syntax error, no fix is applied inside it.

## Nothing is reported in Pug templates

- The block must be `<template lang="pug">` or `<template lang="jade">`.
- `...vuePug.configs.recommended` (or `base`) must come after the eslint-plugin-vue configs, and no
  later config may set its own `processor` for `**/*.vue`.
- In VS Code, `vue` must be in `eslint.validate` (see [Editor setup](./editor-setup)).

## The editor and the CLI disagree

The ESLint extension may use another ESLint or another config than your terminal. Run
`npx eslint --print-config src/App.vue` and compare with the extension's output panel
(*ESLint* channel).
