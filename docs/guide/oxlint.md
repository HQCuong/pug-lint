# Using with oxlint

[Oxlint](https://oxc.rs/docs/guide/usage/linter) is a much faster linter written in Rust. In a
`.vue` file it lints the `<script>` blocks only: it does not lint `<template>`, HTML or Pug, and
cannot load this plugin, which needs vue-eslint-parser to read the template.

So in a project that uses oxlint, run both:

- **oxlint** for JavaScript and TypeScript, including the `<script>` of `.vue` files;
- **ESLint** for what oxlint cannot do yet: the templates, with eslint-plugin-vue and
  `eslint-plugin-pug-vue`.

[`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) turns off, in ESLint,
every rule that your oxlint config already runs, so no problem is reported twice and ESLint does
less work.

## Install

```sh
npm install --save-dev oxlint eslint-plugin-oxlint \
  eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

## Configure oxlint

Create `.oxlintrc.json` with `npx oxlint --init`, and add `vue` to its plugins so oxlint also runs
its Vue rules on `<script>` blocks:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "vue"],
  "categories": {
    "correctness": "error"
  }
}
```

## Configure ESLint

Put the oxlint config **last**, after `vuePug.configs.recommended`:

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'
import oxlint from 'eslint-plugin-oxlint'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  // Last: turn off the rules that .oxlintrc.json already runs.
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
]
```

The rules it turns off are script rules (`no-debugger`, `vue/no-dupe-keys`,
`vue/valid-define-props`, …). It turns off no template rule and no `vue-pug/*` rule, so Pug
templates are linted and formatted exactly as without oxlint.

## Run them

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint:fix": "oxlint --fix && eslint . --fix"
  }
}
```

Oxlint runs first: it takes milliseconds, and its errors show up before ESLint starts. Oxlint skips
the files your `.gitignore` lists, so add `node_modules` there if it is not already.

`&&` stops at the first linter that still reports an error. If oxlint finds one it cannot fix (a
`debugger` statement, say), `lint:fix` stops there and ESLint does not format the templates. Fix
that error, or run `npx eslint . --fix` on its own.

## VS Code

Install the [Oxc extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)
next to the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint),
and let both fix on save:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```

The two never fix the same thing: oxlint fixes the scripts, ESLint fixes the templates, and every
fix ESLint makes in a Pug template still goes through [the fix guard](./fix-guard).

## Without ESLint?

Not yet. Oxlint can run ESLint plugins written in JavaScript, but it hands them only the
`<script>` blocks of a `.vue` file, and custom parsers and file languages such as Vue templates are
still in progress in oxc. When oxlint can lint Vue templates, this plugin can follow: its parser,
`pug-lint-parser`, does not depend on ESLint. Until then, keep ESLint for `.vue` templates.
