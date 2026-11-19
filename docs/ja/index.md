---
layout: home
title: Vue の Pug テンプレートのための ESLint
description: "Vue のシングルファイルコンポーネント内の Pug テンプレートを ESLint で lint・整形します。vue/* rule が Pug 上で動き、eslint --fix が Pug を整形し、すべての fix は事前に検証されるのでテンプレートを壊しません。"
# The hero and sections are written here, not with `hero`/`features` frontmatter, so the home
# page can hold the live --fix example. `markdownStyles: false` drops the .vp-doc wrapper; the
# sections opt back in with the vp-doc class where they render Markdown.
markdownStyles: false
---

<section class="pl-hero">
<div class="pl-hero-text">
<h1 class="home-heading">Vue の Pug テンプレートのための ESLint</h1>
<p class="pl-lead"><code>&lt;template lang="pug"&gt;</code> で <code>vue/*</code> rule を動かし、<code>eslint --fix</code> で Pug を整形し、すべてのテンプレートを壊さずに保ちます。各 fix は適用前に検証されます。</p>
<div class="pl-install vp-doc">

```sh
npm i -D eslint-plugin-pug-vue
```

</div>
<div class="pl-actions">
<a class="pl-button primary" href="/ja/guide/getting-started">はじめる</a>
<a class="pl-button" href="/ja/rules/">12 個のルールを見る</a>
</div>
</div>
<div class="pl-hero-demo">
<FixDemo />
</div>
</section>

<section class="pl-section vp-doc">
<div class="pl-row">
<div class="pl-row-text">

## Pug 上で動く `vue/*` rule {#your-vue-rules-on-pug}

eslint-plugin-vue の rule は、いつもの名前とオプションのまま Pug テンプレート上で動きます。key の欠落、未使用の変数、属性の順序、非推奨の構文などを検出します。Pug では動作しない一部の rule は、無効にするか、Pug テンプレートの中でだけ出力を抑えます。そのため HTML テンプレートに対するチェックは引き続き働きます。

[Pug 上で動く rule](/ja/guide/vue-rules)

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

## `eslint --fix` による整形 {#formatting-with-eslint-fix}

12 個の小さな `vue-pug/*` rule が Pug そのものを整形します。インデント、属性ブロックのスペース・カンマ・クォート・改行、そして `.class` / `#id` の省略記法です。どの rule にもオプションがあり、不要なものは無効にできます。Prettier は不要で、保存時に ESLint と競合する別のフォーマッターもありません。

[すべてのルールを見る](/ja/rules/)

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

## テンプレートを壊さない fix {#fixes-that-cannot-break-a-template}

Pug ではインデントが構造そのものです。1 行ずらすだけで木構造が変わります。そのため ESLint が Pug テンプレートに fix を書き込む前に、どの rule 由来の fix であっても、プラグインが次の検証を行います。

1. fix を適用した状態のテンプレートをパースします。
2. タグ、そのネスト、クラス、属性、すべての JavaScript の式を元のテンプレートと比較します。
3. 何も変わっていない場合にだけ fix を適用します。変わっている場合は fix を破棄して警告を残すので、その行を手作業で直せます。

[fix ガードの仕組み](/ja/guide/fix-guard)

</div>
<div class="pl-row-code">

```pug
//- the same template to the guard
p(class="intro lead") Hello
p.intro.lead Hello

//- a different one: a class is gone
p.intro Hello
```

<p class="pl-caption">そのため <code>vue-pug/prefer-shorthand</code> は 1 行目を 2 行目に書き換えることがありますが、クラスが失われる fix や、行を別の親に移す fix が適用されることはありません。</p>

</div>
</div>
</section>

<section class="pl-section pl-start vp-doc">

## 2 分で始める {#start-in-two-minutes}

ESLint 9.15 または 10 の flat config、eslint-plugin-vue 10、vue-eslint-parser 10 が必要です。
[セットアップ](/ja/guide/getting-started)で、インストール、設定、VS Code での保存時 fix までを順に説明します。
eslint-plugin-vue-pug から移行する場合は[移行ガイド](/ja/guide/migration)を読んでください。

</section>
