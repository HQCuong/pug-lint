# pug-lint

ESLint linting and formatting for `<template lang="pug">` in Vue single-file components.

| Package | Description |
|---|---|
| [`@pug-lint/eslint-plugin`](packages/eslint-plugin) | The ESLint plugin: runs your `vue/*` rules on Pug templates, adds `vue-pug/*` formatting rules, and guards every fix so it cannot break a template. Start here. |
| [`@pug-lint/parser`](packages/pug-parser) | The Pug parser behind it: a concrete syntax tree with exact source ranges that never throws. |

Quick start:

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from '@pug-lint/eslint-plugin'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

See the [plugin README](packages/eslint-plugin/README.md) for setup, rules, editor integration
and known limitations.

## Development

This is a pnpm workspace (Node.js `^20.19.0 || ^22.13.0 || >=24`).

```sh
pnpm install
pnpm build       # build both packages
pnpm test        # run the test suites (ESLint 9 and 10)
pnpm lint
pnpm typecheck
```

In `packages/eslint-plugin`:

- `pnpm run compat` regenerates the `vue/*` rule compatibility table
  ([docs/vue-compatibility.md](packages/eslint-plugin/docs/vue-compatibility.md)); `pnpm run compat:check`
  fails when it is stale.
- `pnpm run docs:gen` regenerates the rule sections of the plugin README; `pnpm run docs:check` fails when they
  are stale.

## License

[MIT](LICENSE)
