# pug-lint

ESLint linting and formatting for `<template lang="pug">` in Vue single-file components.

- Your `vue/*` rules from eslint-plugin-vue run on Pug templates.
- `vue-pug/*` rules format the Pug with `eslint --fix`: indentation, attribute layout, quotes,
  commas, shorthands. No Prettier needed.
- Every fix is checked before it is applied, so `--fix` and fix-on-save never break a template.

**Documentation: <https://pug-lint.dev>**

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

## Quick start

```sh
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-lint
```

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-lint'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

Then run `npx eslint . --fix`, or [set up fix-on-save](https://pug-lint.dev/guide/editor-setup)
in your editor.

## Packages

| Package | Description |
|---|---|
| [`eslint-plugin-pug-lint`](packages/eslint-plugin) | The ESLint plugin: runs your `vue/*` rules on Pug templates, adds `vue-pug/*` formatting rules, and guards every fix. Start here. |
| [`pug-lint-parser`](packages/pug-parser) | The Pug parser behind it: a concrete syntax tree with exact source ranges that never throws. |

## Contributing

Bug reports, docs fixes and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for
setup and the checks to run, and follow the [Code of Conduct](CODE_OF_CONDUCT.md). Security issues:
see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
