---
description: "Configure eslint-plugin-pug-vue: the base and recommended configs, templates indented under <template>, keeping a suppressed vue/* rule, and the plugin key."
---

# Configuration

## The two configs

Both configs apply to `**/*.vue`.

| Config | What it sets |
|---|---|
| `configs.base` | The Pug template tokenizer for vue-eslint-parser, the processor (message suppression and [fix guard](./fix-guard)), and the [crashing `vue/*` rules](./vue-rules) turned off. No `vue-pug/*` rule is enabled. |
| `configs.recommended` | `base` plus every recommended `vue-pug/*` rule at `warn`. |

Use `base` when you want to pick the `vue-pug/*` rules yourself:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.base,
  {
    files: ['**/*.vue'],
    rules: {
      'vue-pug/indent': 'error',
      'vue-pug/attribute-quotes': ['error', 'single'],
    },
  },
]
```

Your own `languageOptions.parserOptions` (for example `parser` for TypeScript in `<script>`) are
merged with the plugin's, so they keep working.

## Templates indented under `<template>`

`vue-pug/indent` puts top-level nodes at column 0 (`baseIndent: 0`, like `.pug` files). If your
templates are written one level under `<template>`, set `baseIndent: 1`, or the rule moves them to
column 0:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  { files: ['**/*.vue'], rules: { 'vue-pug/indent': ['warn', 2, { baseIndent: 1 }] } },
]
```

See [`vue-pug/indent`](/rules/indent) for all options.

## Keeping a suppressed rule

Some `vue/*` rules [are suppressed inside Pug templates](./vue-rules). To keep one reporting there,
build the configs with `configure()` and use them in place of `vuePug.configs`:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configure({ keepVueRules: ['vue/html-self-closing'] }).recommended,
]
```

This is at your own risk. A rule on the suppressed list may report false problems, and its fixes
may not be stable on Pug: for example, `vue/singleline-html-element-content-newline` adds another
blank line on every pass. `keepVueRules` does not apply to the crashing rules, which stay off.

## Plugin key

The plugin is registered under the key `vue-pug`. All rule ids (`vue-pug/indent`, …) and the
configs use it. Registering the plugin under a different key is not supported.

## Trailing spaces, blank lines, final newline

The `vue-pug/*` rules do not handle these. Use the [`@stylistic`](https://eslint.style/) rules
`@stylistic/no-trailing-spaces`, `@stylistic/no-multiple-empty-lines` and `@stylistic/eol-last`:
they work on the whole `.vue` file, Pug templates included, and the fix guard checks their fixes
like any other.
