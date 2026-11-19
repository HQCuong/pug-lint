---

description: "eslint-plugin-pug-vue のよくある問題の対処法。クラッシュする vue/* rule、適用されない fix、Pug テンプレートで何も報告されない場合。"
---

# トラブルシューティング

## `TypeError: Cannot read properties of null (reading 'type')`（または `'range'`） {#typeerror-cannot-read-properties-of-null-reading-type-or-range}

Pug テンプレートでクラッシュする `vue/*` rule のどれかが、`...vuePug.configs.recommended`（または `base`）より後ろに置かれた config によって再び有効にされています。たとえば共有 config や、それを有効にする `rules` のエントリです。`configs.base` は、すべての `.vue` ファイルでこれらを無効にします。

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

`...vuePug.configs.recommended` を、これらを有効にするすべての config の後ろに置くか、自分の `rules` から削除してください。Pug テンプレートには、代わりに対応する `vue-pug/*` rule を使います。

## 問題は報告されるのに `--fix` で直らない {#a-problem-is-reported-but-fix-does-not-fix-it}

適用するとテンプレートの構造が変わる、またはパースできなくなるため、[fix ガード](./fix-guard)がその fix を破棄しました。その行は手作業で直してください。fix は安全だったはずだと思う場合は、そのテンプレートを添えて[issue を作成](https://github.com/HQCuong/pug-lint/issues/new/choose)してください。

あわせて、テンプレートに `vue/no-parsing-error` の問題がないか確認してください。テンプレートに Pug の構文エラーがある間は、その中で fix は一切適用されません。

## Pug テンプレートで何も報告されない {#nothing-is-reported-in-pug-templates}

- ブロックは `<template lang="pug">` または `<template lang="jade">` でなければなりません。
- `...vuePug.configs.recommended`（または `base`）は eslint-plugin-vue の config の後ろに置く必要があり、それより後ろの config が `**/*.vue` に独自の `processor` を設定してはいけません。
- VS Code では、`eslint.validate` に `vue` を含める必要があります（[エディターの設定](./editor-setup)を参照）。

## エディターと CLI の結果が一致しない {#the-editor-and-the-cli-disagree}

ESLint 拡張機能が、ターミナルとは別の ESLint や別の config を使っていることがあります。`npx eslint --print-config src/App.vue` を実行し、拡張機能の出力パネル（*ESLint* チャンネル）と比較してください。
