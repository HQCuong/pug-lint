# Migrating from eslint-plugin-vue-pug

`eslint-plugin-vue-pug` registers itself under the same `vue-pug` key, so the two plugins cannot be
used together.

1. Uninstall `eslint-plugin-vue-pug` and `vue-eslint-parser-template-tokenizer-pug`, and remove the
   `plugin:vue-pug/...` entries from your config. This plugin needs a flat config.
2. Install and configure this plugin as in [Getting started](./getting-started).
3. Replace the old rules:
   - `vue-pug/no-parsing-error` → `vue/no-parsing-error`, which reports Pug syntax errors and is
     enabled by every eslint-plugin-vue config except `flat/base`.
   - `vue-pug/component-name-in-template-casing` → none: `vue/component-name-in-template-casing`
     crashes on Pug templates and is turned off.
   - `vue-pug/no-pug-control-flow` keeps its id, but its options differ: the old rule takes no
     options and was enabled by the old `strongly-recommended` configs; this one takes
     `{ allow: [...] }` and is in no config. See
     [its docs](/rules/no-pug-control-flow#migrating-from-eslint-plugin-vue-pug).

The old configs turned some layout rules off everywhere (`vue/html-indent`,
`vue/html-self-closing`, …). Here they stay on for HTML templates and are only suppressed inside
Pug templates (except the [crashing ones](./vue-rules)), with `vue-pug/*` rules taking their place.
