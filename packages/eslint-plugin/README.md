# @pug-lint/eslint-plugin

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
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser @pug-lint/eslint-plugin
```

## Configure

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from '@pug-lint/eslint-plugin'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

Put `...vuePug.configs.recommended` **after** the eslint-plugin-vue configs. It sets the parser
options, the processor and the rules that must be off for Pug; a later config that sets its own
processor or turns one of the [crashing rules](#vue-rules-inside-pug-templates) back on breaks
linting of Pug files.

Two configs are available, both for `**/*.vue`:

- `configs.base`: the Pug template tokenizer for vue-eslint-parser, the processor (suppression and
  fix guard, see below), and the crashing `vue/*` rules turned off. No `vue-pug/*` rule is enabled.
- `configs.recommended`: `base` plus every recommended `vue-pug/*` rule at `warn`.

Your own `languageOptions.parserOptions` (for example `parser` for TypeScript in `<script>`) are
merged with the plugin's, so they keep working.

`vue-pug/indent` puts top-level nodes at column 0 (`baseIndent: 0`, like Pug files). If your
templates are written one level under `<template>`, set `baseIndent: 1`, or the rule moves them
to column 0:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  { files: ['**/*.vue'], rules: { 'vue-pug/indent': ['warn', 2, { baseIndent: 1 }] } },
]
```

### Plugin key

The plugin is registered under the key `vue-pug`. All rule ids (`vue-pug/indent`, …) and the
configs use it. Registering the plugin under a different key is not supported.

### VS Code: fix on save

With the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint),
add to `.vscode/settings.json`:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

### Trailing spaces, blank lines, final newline

The `vue-pug/*` rules do not handle these. Use the
[`@stylistic`](https://eslint.style/) rules `@stylistic/no-trailing-spaces`,
`@stylistic/no-multiple-empty-lines` and `@stylistic/eol-last`: they work on the whole `.vue`
file, Pug templates included, and the fix guard checks their fixes like any other.

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

## How the fix guard works

For each Pug template, a fix is applied only if the template still parses afterwards and its
structure is unchanged: the tags and their nesting, each tag's class and id set and attribute count,
the shape of text and interpolations, and every piece of JavaScript that Pug compiles (unquoted and
`${}` attribute values, `&attributes`, mixin arguments, code, control heads, `#{}`), up to its
indentation. The parser reports what Pug itself rejects (for example a tab/space mix or a repeated
attribute), so a fix that would introduce it is dropped too. Each fix is verified on its own, then the surviving fixes
are verified again as the combined set that ESLint will apply. A fix that fails is dropped and its
problem is still reported, so you can fix it by hand.

This covers every rule, including `vue/*` rules and third-party rules. While a template has a
Pug syntax error, no fix is applied inside it.

## `vue/*` rules inside Pug templates

Most eslint-plugin-vue rules work on Pug templates as they do on HTML. The rest are measured by a
compatibility harness that runs every rule on Pug templates and on their HTML equivalents; the
full results are in [docs/vue-compatibility.md](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/vue-compatibility.md).

- Rules that **crash** on Pug templates are turned off by `configs.base`. A Pug element has no
  written end tag, so its end tag is zero-width, which breaks these rules' use of
  vue-eslint-parser's token store. A crash cannot be
  filtered afterwards, and a config can only select files, not templates, so they are off for
  **every** `.vue` file, HTML templates included. In a project that mixes
  HTML and Pug templates, these rules no longer check the HTML templates either. The `vue-pug/*`
  replacements cover the Pug templates.
- Rules that **misreport** on Pug or whose **fixes would break or reformat** Pug are not turned
  off. The processor drops their messages only when they are located inside a Pug template, so
  they keep working on HTML templates and in `<script>`.

<!-- begin auto-generated vue rule lists -->

Turned off for every `.vue` file by `configs.base`, because they crash on Pug templates:

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

Suppressed inside Pug templates only (they keep working on HTML templates and in `<script>`):

- `vue/array-bracket-newline`
- `vue/array-element-newline`
- `vue/brace-style`
- `vue/first-attribute-linebreak` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-comment-content-newline`
- `vue/html-comment-content-spacing`
- `vue/html-end-tags` (Pug replacement: `vue-pug/self-closing`)
- `vue/html-quotes` (Pug replacement: `vue-pug/attribute-quotes`)
- `vue/html-self-closing` (Pug replacement: `vue-pug/self-closing`)
- `vue/max-attributes-per-line` (Pug replacement: `vue-pug/max-attributes-per-line`)
- `vue/multiline-html-element-content-newline`
- `vue/multiline-ternary`
- `vue/no-multi-spaces` (Pug replacement: `vue-pug/no-multi-spaces`)
- `vue/no-spaces-around-equal-signs-in-attribute` (Pug replacement: `vue-pug/attribute-equals-spacing`)
- `vue/no-unsupported-features`
- `vue/object-curly-newline`
- `vue/object-property-newline`
- `vue/padding-line-between-tags`
- `vue/singleline-html-element-content-newline`
- `vue/static-class-names-order`
- `vue/v-if-else-key`

<!-- end auto-generated vue rule lists -->

### Keeping a suppressed rule

To keep a suppressed rule reporting inside Pug templates, build the configs with `configure()` and
use them in place of `vuePug.configs`:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configure({ keepVueRules: ['vue/html-self-closing'] }).recommended,
]
```

This is at your own risk. A rule on this list may report false problems, and its fixes may not be
stable on Pug: for example, `vue/singleline-html-element-content-newline` adds another blank line
on every pass. `keepVueRules` does not apply to the crashing rules, which stay off.

## Known limitations

- **Multi-line attribute values need backticks.** A line break inside a `'…'` or `"…"` value is a
  Pug syntax error (Pug itself does not compile it), reported through `vue/no-parsing-error`.
  While a template has a parse error, no fix is applied inside it.
- **Shorthands are not attributes for `vue/*` rules.** `.class` and `#id` shorthands are not
  exposed as attributes, so rules such as `vue/no-restricted-class` do not see shorthand classes.
- **The Vue AST differs from an HTML template's** in a few places that `vue/*` rules can notice:
  each piped text line (`| text`) is its own text node; text directly at the template root has no
  text node; string attribute values are passed through raw, so escaped quotes inside a directive
  string (`:x="f(\"a\")"`) may give a spurious Vue parse error.
- **Unquoted and `${}` attribute values** (`a(href=url)`, ``a(title=`${x}`)``) are Pug
  compile-time expressions, not Vue bindings. They are passed to `vue/*` rules as plain attribute
  values, and the fix guard drops every fix that rewrites them.
- **A value that starts with a quote must be one string.** `a(title="x" + y)` is valid Pug but is
  reported as a parse error (`vue/no-parsing-error`), by design: write `a(title=("x" + y))` or
  `a(:title="'x' + y")`.
- **Lone CR line breaks.** In a template whose lines end with a lone `\r` (old Mac style), the
  `vue-pug/*` rules report problems but do not fix them, and the tokenizer reports a parse error.
  Convert the file to LF or CRLF.
- **Some Pug syntax is reported as unsupported**, or parsed differently from Pug, by the parser:
  see [unsupported-syntax.md](https://github.com/HQCuong/pug-lint/blob/main/packages/pug-parser/docs/unsupported-syntax.md).
- **Fix guard cost.** The guard parses the template again for each distinct fix, so its cost grows
  with the number of fixes times the template size. A fully misformatted 3000-line template can
  take several seconds; a normal template takes milliseconds. The cost only arises while a template
  has problems to fix.
- **Partial fix sets.** The guard verifies the full set of surviving fixes. If ESLint applies only
  some of them (`--fix-type`, or a custom `fix` predicate in the Node.js API), that subset was not
  verified as a set.

## Troubleshooting

### `TypeError: Cannot read properties of null (reading 'type')` (or `'range'`)

One of the `vue/*` rules that crash on Pug templates was turned back on by a config placed after
`...vuePug.configs.recommended` (or `base`), for example a shared config or a `rules` entry that
enables it. `configs.base` turns these off for every `.vue` file:

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

Put `...vuePug.configs.recommended` after every config that enables them, or remove them from
your own `rules`. Use the `vue-pug/*` replacement for Pug templates instead.

## Migrating from eslint-plugin-vue-pug

`eslint-plugin-vue-pug` registers itself under the same `vue-pug` key, so the two plugins cannot be
used together.

1. Uninstall `eslint-plugin-vue-pug` and `vue-eslint-parser-template-tokenizer-pug`, and remove the
   `plugin:vue-pug/...` entries from your config. This plugin needs a flat config.
2. Install and configure this plugin as above.
3. Replace the old rules:
   - `vue-pug/no-parsing-error` → `vue/no-parsing-error`, which reports Pug syntax errors and is
     enabled by every eslint-plugin-vue config except `flat/base`.
   - `vue-pug/component-name-in-template-casing` → none: `vue/component-name-in-template-casing`
     crashes on Pug templates and is turned off.
   - `vue-pug/no-pug-control-flow` keeps its id, but its options differ: the old rule takes no
     options and was enabled by the old `strongly-recommended` configs; this one takes
     `{ allow: [...] }` and is in no config. See
     [its docs](https://github.com/HQCuong/pug-lint/blob/main/packages/eslint-plugin/docs/rules/no-pug-control-flow.md#migrating-from-eslint-plugin-vue-pug).

The old configs turned some layout rules off everywhere (`vue/html-indent`, `vue/html-self-closing`,
…). Here they stay on for HTML templates and are only suppressed inside Pug templates (except the
crashing ones), with `vue-pug/*` rules taking their place.

## License

MIT
