---
layout: home
title: ESLint for Pug templates in Vue
description: Lint and format Pug templates in Vue single-file components with ESLint. Your vue/* rules run on Pug, eslint --fix formats the Pug, and every fix is checked so it never breaks a template.
# The hero and sections are written here, not with `hero`/`features` frontmatter, so the home
# page can hold the live --fix example. `markdownStyles: false` drops the .vp-doc wrapper; the
# sections opt back in with the vp-doc class where they render Markdown.
markdownStyles: false
---

<section class="pl-hero">
<div class="pl-hero-text">
<h1 class="home-heading">ESLint for Pug templates in Vue</h1>
<p class="pl-lead">Run your <code>vue/*</code> rules on <code>&lt;template lang="pug"&gt;</code>, format the Pug with <code>eslint --fix</code>, and keep every template intact: each fix is checked before it is applied.</p>
<div class="pl-install vp-doc">

```sh
npm i -D eslint-plugin-pug-vue
```

</div>
<div class="pl-actions">
<a class="pl-button primary" href="/guide/getting-started">Get started</a>
<a class="pl-button" href="/rules/">Browse the 12 rules</a>
</div>
</div>
<div class="pl-hero-demo">
<FixDemo />
</div>
</section>

<section class="pl-section vp-doc">
<div class="pl-row">
<div class="pl-row-text">

## Your `vue/*` rules, on Pug

eslint-plugin-vue rules run on Pug templates under their usual names and options: missing keys,
unused variables, attribute order, deprecated syntax. The few rules that cannot work on Pug are
turned off, or silenced inside Pug templates only, so they keep checking your HTML templates.

[Which rules run on Pug](/guide/vue-rules)

</div>
<div class="pl-row-code">

```vue
<template lang="pug">
ul
  li(v-for="todo in todos") {{ todo.title }}
</template>
```

```txt
3:3  error  Elements in iteration expect to have 'v-bind:key' directives  vue/require-v-for-key
```

</div>
</div>

<div class="pl-row">
<div class="pl-row-text">

## Formatting with `eslint --fix`

Twelve small `vue-pug/*` rules format the Pug itself: indentation, the spacing, commas, quotes
and line breaks of attribute blocks, and the `.class` / `#id` shorthands. Each one has options,
and you can turn any of them off. No Prettier, and no second formatter fighting ESLint on save.

[See every rule](/rules/)

</div>
<div class="pl-row-code">

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

</div>
</div>

<div class="pl-row">
<div class="pl-row-text">

## Fixes that cannot break a template

In Pug, indentation is structure: move one line and the tree changes. So before ESLint writes a
fix into a Pug template, the plugin checks it, whichever rule the fix comes from:

1. it parses the template with the fix applied;
2. it compares the tags, their nesting, classes, attributes and every JavaScript expression with the original;
3. it applies the fix only if nothing changed. Otherwise it drops the fix and keeps the warning, so you can fix that line by hand.

[How the fix guard works](/guide/fix-guard)

</div>
<div class="pl-row-code">

```pug
//- the same template to the guard
p(class="intro lead") Hello
p.intro.lead Hello

//- a different one: a class is gone
p.intro Hello
```

<p class="pl-caption">So <code>vue-pug/prefer-shorthand</code> may rewrite the first line into the second, but a fix that loses a class, or moves a line to another parent, is never applied.</p>

</div>
</div>
</section>

<section class="pl-section pl-start vp-doc">

## Start in two minutes

It needs ESLint 9.15 or 10 with a flat config, eslint-plugin-vue 10 and vue-eslint-parser 10.
[Getting started](/guide/getting-started) walks through install, config and fix-on-save in VS Code.
Coming from eslint-plugin-vue-pug? Read [the migration guide](/guide/migration).

</section>
