---

description: "eslint-plugin-vue-pug から eslint-plugin-pug-vue への移行手順。アンインストール、flat config、変更された rule を説明します。"
---

# eslint-plugin-vue-pug からの移行

`eslint-plugin-vue-pug` は同じ `vue-pug` というキーで自身を登録するため、2 つのプラグインを併用することはできません。

1. `eslint-plugin-vue-pug` と `vue-eslint-parser-template-tokenizer-pug` をアンインストールし、config から `plugin:vue-pug/...` のエントリを削除します。このプラグインには flat config が必要です。
2. [セットアップ](./getting-started)の手順どおりに、このプラグインをインストールして設定します。
3. 古い rule を置き換えます。
   - `vue-pug/no-parsing-error` → `vue/no-parsing-error`。Pug の構文エラーを報告し、`flat/base` を除くすべての eslint-plugin-vue の config で有効になっています。
   - `vue-pug/component-name-in-template-casing` → 置き換えなし。`vue/component-name-in-template-casing` は Pug テンプレートでクラッシュするため、無効になっています。
   - `vue-pug/no-pug-control-flow` は id が同じですが、オプションが違います。古い rule はオプションを取らず、古い `strongly-recommended` の config で有効でした。こちらは `{ allow: [...] }` を取り、どの config にも含まれません。[その rule のドキュメント](/ja/rules/no-pug-control-flow#migrating-from-eslint-plugin-vue-pug)を参照してください。

古い config は、一部のレイアウト系 rule（`vue/html-indent`、`vue/html-self-closing` など）をあらゆる場所で無効にしていました。このプラグインでは、それらは HTML テンプレートでは有効のままで、Pug テンプレートの中でだけ抑制されます（[クラッシュする rule](./vue-rules)を除く）。代わりに `vue-pug/*` rule が働きます。
