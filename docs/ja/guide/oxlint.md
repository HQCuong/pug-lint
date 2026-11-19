---

description: "oxlint を使うプロジェクトで eslint-plugin-pug-vue を使う方法。スクリプトは oxlint、Vue テンプレートは ESLint で lint し、eslint-plugin-oxlint で重複した報告を防ぎます。"
---

# oxlint と併用する

[Oxlint](https://oxc.rs/docs/guide/usage/linter) は Rust で書かれた、はるかに高速な linter です。`.vue` ファイルでは `<script>` ブロックだけを lint し、`<template>`（HTML も Pug も）は lint しません。また、テンプレートの読み取りに vue-eslint-parser を必要とするこのプラグインを読み込むこともできません。

そのため、oxlint を使うプロジェクトでは両方を実行します。

- **oxlint**: JavaScript と TypeScript 用です。`.vue` ファイルの `<script>` も含みます。
- **ESLint**: oxlint がまだ扱えないもの、つまりテンプレート用です。eslint-plugin-vue と `eslint-plugin-pug-vue` を使います。

[`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) は、oxlint の設定ですでに実行されているすべての rule を ESLint 側で無効にします。そのため、同じ問題が二重に報告されることはなく、ESLint の処理も減ります。

## インストール {#install}

```sh
npm install --save-dev oxlint eslint-plugin-oxlint \
  eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

## oxlint の設定 {#configure-oxlint}

`npx oxlint --init` で `.oxlintrc.json` を作成し、plugins に `vue` を加えて、oxlint が `<script>` ブロックにも Vue の rule を実行するようにします。

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "vue"],
  "categories": {
    "correctness": "error"
  }
}
```

## ESLint の設定 {#configure-eslint}

oxlint の config は、`vuePug.configs.recommended` の**後ろ**、つまり**最後**に置きます。

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'
import oxlint from 'eslint-plugin-oxlint'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  // Last: turn off the rules that .oxlintrc.json already runs.
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
]
```

無効にされるのはスクリプト用の rule（`no-debugger`、`vue/no-dupe-keys`、`vue/valid-define-props` など）です。テンプレートの rule も `vue-pug/*` rule も無効にしないので、Pug テンプレートは oxlint がない場合とまったく同じように lint・整形されます。

## 実行する {#run-them}

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint:fix": "oxlint --fix && eslint . --fix"
  }
}
```

oxlint を先に実行します。数ミリ秒で終わり、そのエラーは ESLint が始まる前に表示されます。oxlint は `.gitignore` に書かれたファイルをスキップするので、まだ書かれていなければ `node_modules` を追加してください。

`&&` は、エラーを報告した最初の linter で止まります。oxlint が修正できないエラー（たとえば `debugger` 文）を見つけると、`lint:fix` はそこで止まり、ESLint はテンプレートを整形しません。そのエラーを直すか、`npx eslint . --fix` を単独で実行してください。

## VS Code {#vs-code}

[ESLint 拡張機能](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)と一緒に [Oxc 拡張機能](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)をインストールし、どちらも保存時に fix するようにします。

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```

両者が同じものを fix することはありません。oxlint はスクリプトを、ESLint はテンプレートを fix し、ESLint が Pug テンプレートに加えるすべての fix は、引き続き [fix ガード](./fix-guard)を通ります。

## ESLint なしでは使えますか？ {#without-eslint}

まだできません。Oxlint は JavaScript で書かれた ESLint プラグインを実行できますが、渡されるのは `.vue` ファイルの `<script>` ブロックだけです。カスタムパーサーや Vue テンプレートのようなファイル言語への対応は、oxc でまだ開発中です。oxlint が Vue テンプレートを lint できるようになれば、このプラグインも追従できます。そのパーサーである `pug-lint-parser` は ESLint に依存していません。それまでは、`.vue` のテンプレートには ESLint を使い続けてください。
