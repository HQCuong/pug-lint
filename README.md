<div align="center">

<sub>**English** | [Tiếng Việt](./i18n/vi/README.md) | [한국어](./i18n/ko/README.md) | [简体中文](./i18n/zh/README.md) | [日本語](./i18n/ja/README.md) | [Deutsch](./i18n/de/README.md) | [Français](./i18n/fr/README.md) | [Español](./i18n/es/README.md) | [हिन्दी](./i18n/hi/README.md) | [Português (Brasil)](./i18n/pt/README.md) | [Русский](./i18n/ru/README.md)</sub>

<br>

<a href="https://pug-lint.dev/">
  <img src="https://pug-lint.dev/og.png" alt="pug-lint: ESLint for Pug templates in Vue" width="720">
</a>

<br>
<br>

[![npm version](https://img.shields.io/npm/v/eslint-plugin-pug-vue?color=2e8b62&label=npm)](https://www.npmjs.com/package/eslint-plugin-pug-vue)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-pug-vue?color=2e8b62)](https://www.npmjs.com/package/eslint-plugin-pug-vue)
[![CI](https://github.com/HQCuong/pug-lint/actions/workflows/ci.yml/badge.svg)](https://github.com/HQCuong/pug-lint/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/npm/l/eslint-plugin-pug-vue?color=2e8b62)](./LICENSE)

**[Documentation](https://pug-lint.dev/)** ·
[Getting started](https://pug-lint.dev/guide/getting-started) ·
[Rules](https://pug-lint.dev/rules/) ·
[Migrating from eslint-plugin-vue-pug](https://pug-lint.dev/guide/migration)

</div>

---

Lint and format `<template lang="pug">` in Vue single-file components with ESLint.

## Features

- **Your `vue/*` rules run on Pug.** eslint-plugin-vue rules check Pug templates under their usual
  names and options. The few that cannot work on Pug are turned off or silenced inside Pug
  templates only, so your HTML templates stay covered.
- **Formatting with `eslint --fix`.** Twelve small [`vue-pug/*` rules](https://pug-lint.dev/rules/)
  handle indentation, attribute spacing, commas, quotes and line breaks, and the `.class` / `#id`
  shorthands. No Prettier, and no second formatter fighting ESLint on save.
- **Fixes that cannot break a template.** Every fix that touches a Pug template is parsed and
  compared with the original before ESLint writes it, whichever rule it comes from. A fix that
  would change the structure is dropped and its warning stays.
  [How it works](https://pug-lint.dev/guide/fix-guard).
- **Works where you already lint.** `eslint` on the CLI, fix-on-save in VS Code or any editor that
  runs ESLint. ESLint 9 and 10, flat config, `lang="pug"` and `lang="jade"`. Using oxlint? Run it
  next to ESLint: [Using with oxlint](https://pug-lint.dev/guide/oxlint).

```vue
<!-- before: eslint --fix -->
<template lang="pug">
div.card( class="shadow" , :title = "title" )
    h2( v-if='title' ) {{ title }}
    input(v-model="name" , type='text' disabled)/
</template>

<!-- after -->
<template lang="pug">
.card.shadow(:title="title")
  h2(v-if="title") {{ title }}
  input(v-model="name" type="text" disabled)
</template>
```

## Installation

```sh
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

Requires Node.js `^20.19.0 || ^22.13.0 || >=24`, ESLint `^9.15.0 || ^10.0.0` with a flat config,
eslint-plugin-vue `^10` and vue-eslint-parser `^10`.

## Quick start

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended, // after the eslint-plugin-vue configs
]
```

Then run `npx eslint . --fix`, or
[set up fix-on-save](https://pug-lint.dev/guide/editor-setup) in your editor.

## How it works

```mermaid
flowchart TD
  A["A .vue file with a Pug template"] --> B
  subgraph B ["vue-eslint-parser"]
    T["Pug tokenizer<br/>(eslint-plugin-pug-vue)"] -->|uses| P["pug-lint-parser<br/>Pug to syntax tree"]
  end
  B -->|Vue template AST| V["vue/* rules<br/>(eslint-plugin-vue)"]
  B -->|Pug syntax tree| R["vue-pug/* rules<br/>(eslint-plugin-pug-vue)"]
  V --> S1
  R --> S1
  subgraph C ["Plugin processor"]
    S1["Suppress vue/* messages<br/>that misreport on Pug"] --> S2["Fix guard: apply the fix to a copy,<br/>parse it again, compare the structure"]
  end
  S2 -->|same structure| OK["Fix applied"]
  S2 -->|structure changed| NO["Fix dropped, warning kept"]
```

1. **Parse.** vue-eslint-parser hands each `<template lang="pug">` to the plugin's tokenizer,
   which parses it with `pug-lint-parser` and returns the tokens Vue expects from HTML, at the
   exact positions of your Pug.
2. **Lint.** `vue/*` rules read the Vue template AST as on an HTML template; `vue-pug/*` rules
   read the Pug syntax tree, which keeps the indentation, quotes and commas they format.
3. **Check.** Before ESLint writes anything, the processor drops the few `vue/*` messages that
   misreport on Pug, and the fix guard rejects every fix that would change the template's
   structure.

More in [How it works](https://pug-lint.dev/guide/how-it-works).

## Packages

| Package | Version | What it is |
|---|---|---|
| [`eslint-plugin-pug-vue`](packages/eslint-plugin) | [![npm](https://img.shields.io/npm/v/eslint-plugin-pug-vue?color=2e8b62&label=)](https://www.npmjs.com/package/eslint-plugin-pug-vue) | The ESLint plugin. Install this one. |
| [`pug-lint-parser`](packages/pug-parser) | [![npm](https://img.shields.io/npm/v/pug-lint-parser?color=2e8b62&label=)](https://www.npmjs.com/package/pug-lint-parser) | The Pug parser behind it: a concrete syntax tree with exact source ranges that never throws. Installed with the plugin; use it directly only to build your own Pug tooling. |

## Contributing

Bug reports, docs fixes and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for
setup and the checks to run, and follow the [Code of Conduct](CODE_OF_CONDUCT.md). Security
issues: see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE). Not affiliated with the Pug or Vue projects.
