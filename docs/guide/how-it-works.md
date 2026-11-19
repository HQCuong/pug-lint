---
description: "How eslint-plugin-pug-vue lints Pug in Vue: a Pug tokenizer for vue-eslint-parser, vue/* and vue-pug/* rules, and a fix guard that checks every fix."
---

# How it works

ESLint cannot read Pug on its own, and eslint-plugin-vue only knows HTML templates. The plugin
connects the two, then checks every fix before ESLint writes it.

<HowItWorks />

## 1. Parse

[vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser) parses `.vue` files for
eslint-plugin-vue. For a template in another language it asks a *tokenizer* to turn that language
into the tokens it would get from HTML. The plugin registers one for `lang="pug"` and `lang="jade"`.

The tokenizer parses the template with [`pug-lint-parser`](/parser/), then emits a start tag, an end
tag, text and `{{ }}` tokens for each Pug element, at the exact positions of the Pug source.
vue-eslint-parser builds its usual template AST from them, so `vue/*` rules point at the right line
and column in your Pug.

A Pug syntax error becomes a parse error that `vue/no-parsing-error` reports.

## 2. Lint

Two kinds of rules run on the same file:

- **`vue/*` rules** from eslint-plugin-vue read the Vue template AST, as they would on an HTML
  template: missing keys, unused variables, attribute order, deprecated syntax.
- **`vue-pug/*` rules** read the Pug syntax tree from `pug-lint-parser` directly. That tree keeps
  what the Vue AST loses: indentation, commas, quotes, parentheses, `.class` and `#id` shorthands.
  This is where the formatting rules work.

## 3. Check

The plugin wraps eslint-plugin-vue's processor, which sees every message before ESLint uses it:

- **Suppress.** A few `vue/*` rules cannot work on Pug: they report false problems, or their
  fixes would write HTML into a Pug template. Their messages are dropped when they are inside a Pug
  template, and only there, so they keep checking your HTML templates. The few rules that crash on
  Pug are turned off instead. [The lists](./vue-rules).
- **Fix guard.** Every fix that touches a Pug template is applied to a copy of the file, which
  `pug-lint-parser` parses again. The plugin compares the structure before and after: the tags and
  their nesting, classes and ids, attribute counts, the shape of text and every JavaScript expression. If
  anything changed, or the copy no longer parses, the fix is dropped and its warning stays.
  [Details](./fix-guard).

ESLint then applies the fixes that are left, with `eslint --fix` or your editor's fix-on-save.

## The two packages

| Package | Role |
|---|---|
| [`eslint-plugin-pug-vue`](https://www.npmjs.com/package/eslint-plugin-pug-vue) | The ESLint plugin: the tokenizer, the `vue-pug/*` rules, the processor and the configs. The one you install. |
| [`pug-lint-parser`](/parser/) | The Pug parser everything above is built on. It knows nothing about ESLint or Vue, and you can use it on its own. |
