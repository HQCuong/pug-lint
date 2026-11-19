---

description: "eslint-plugin-pug-vue をインストールして、Vue のシングルファイルコンポーネント内の Pug テンプレートを ESLint で lint します。必要な環境、インストール、flat config、最初の eslint --fix を説明します。"
---

# セットアップ

`eslint-plugin-pug-vue` は、Vue のシングルファイルコンポーネント内の `<template lang="pug">`（および `lang="jade"`）を lint して整形します。

- eslint-plugin-vue の `vue/*` rule が、いつもの名前とオプションのまま Pug テンプレート上で動きます。
- [`vue-pug/*` rule](/ja/rules/) が Pug そのものを整形します。対象はインデント、属性のレイアウト、クォート、カンマ、省略記法です。Pug のコンパイル時構文を報告するオプションの rule も 1 つあります。
- Pug テンプレートに触れるすべての fix は、ESLint が適用する前に検証されます（[fix ガード](./fix-guard)）。そのため `--fix` や保存時の fix でテンプレートが壊れることはありません。
- Prettier も別のフォーマッターも不要です。fix はすべて ESLint から提供されます。

## 必要な環境 {#requirements}

- Node.js `^20.19.0 || ^22.13.0 || >=24`
- ESLint `^9.15.0 || ^10.0.0`（flat config のみ、`eslint.config.js`）
- `eslint-plugin-vue` `^10.0.0` と `vue-eslint-parser` `^10.0.0`

## インストール {#install}

::: code-group

```sh [npm]
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [pnpm]
pnpm add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [yarn]
yarn add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

:::

## 設定 {#configure}

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

`...vuePug.configs.recommended` は eslint-plugin-vue の config の**後ろ**に置いてください。これは parser のオプション、processor、そして Pug では無効にしておく必要がある rule を設定します。後続の config が独自の processor を設定したり、[クラッシュする rule](./vue-rules) を再び有効にしたりすると、Pug ファイルの lint が壊れます。

## 実行する {#run-it}

```sh
npx eslint .          # report problems
npx eslint . --fix    # fix what can be fixed
```

VS Code で保存時に fix するには、[エディターの設定](./editor-setup)を参照してください。

## 次のステップ {#next-steps}

- [設定](./configuration): 2 つの config、`baseIndent`、抑制された rule を残す方法。
- [ルール](/ja/rules/): 各 `vue-pug/*` rule の動作とオプション。
- 大きなコードベースに導入する前に、[既知の制限](./limitations)を確認してください。
- `eslint-plugin-vue-pug` から移行する場合は、[移行ガイド](./migration)を読んでください。
- oxlint を使っている場合は、ESLint と並べて実行します。[oxlint と併用する](./oxlint)を参照してください。
