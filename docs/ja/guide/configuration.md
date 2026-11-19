---

description: "eslint-plugin-pug-vue を設定します。base と recommended の config、<template> の下にインデントされたテンプレート、抑制された vue/* rule を残す方法、プラグインのキーを説明します。"
---

# 設定

## 2 つの config {#the-two-configs}

どちらの config も `**/*.vue` に適用されます。

| Config | 設定する内容 |
|---|---|
| `configs.base` | vue-eslint-parser 用の Pug テンプレートトークナイザー、processor（メッセージの抑制と [fix ガード](./fix-guard)）、そして[クラッシュする `vue/*` rule](./vue-rules) の無効化。`vue-pug/*` rule は 1 つも有効になりません。 |
| `configs.recommended` | `base` に加えて、推奨のすべての `vue-pug/*` rule を `warn` で有効にします。 |

`vue-pug/*` rule を自分で選びたい場合は `base` を使います。

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

自分で設定した `languageOptions.parserOptions`（たとえば `<script>` の TypeScript 用の `parser`）はプラグインのものとマージされるので、そのまま動きます。

## `<template>` の下にインデントされたテンプレート {#templates-indented-under-template}

`vue-pug/indent` は最上位のノードを 0 列目に置きます（`baseIndent: 0`、`.pug` ファイルと同じです）。テンプレートを `<template>` の 1 段下に書いている場合は `baseIndent: 1` を設定してください。設定しないと、rule がそれらを 0 列目に移動します。

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  { files: ['**/*.vue'], rules: { 'vue-pug/indent': ['warn', 2, { baseIndent: 1 }] } },
]
```

すべてのオプションは [`vue-pug/indent`](/ja/rules/indent) を参照してください。

## 抑制された rule を残す {#keeping-a-suppressed-rule}

一部の `vue/*` rule は [Pug テンプレートの中では抑制されます](./vue-rules)。そこでも報告させたい場合は、`configure()` で config を作り、`vuePug.configs` の代わりに使います。

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configure({ keepVueRules: ['vue/html-self-closing'] }).recommended,
]
```

これは自己責任で行ってください。抑制リストにある rule は誤った問題を報告することがあり、その fix は Pug 上で安定しない場合があります。たとえば `vue/singleline-html-element-content-newline` は、実行のたびに空行を 1 つ追加します。`keepVueRules` はクラッシュする rule には効かず、それらは無効のままです。

## プラグインのキー {#plugin-key}

プラグインはキー `vue-pug` で登録されます。すべての rule id（`vue-pug/indent` など）と config がこのキーを使います。別のキーでプラグインを登録することはサポートしていません。

## 行末の空白、空行、末尾の改行 {#trailing-spaces-blank-lines-final-newline}

`vue-pug/*` rule はこれらを扱いません。[`@stylistic`](https://eslint.style/) の rule である `@stylistic/no-trailing-spaces`、`@stylistic/no-multiple-empty-lines`、`@stylistic/eol-last` を使ってください。これらは Pug テンプレートを含む `.vue` ファイル全体に働き、その fix も他の fix と同じように fix ガードが検証します。
