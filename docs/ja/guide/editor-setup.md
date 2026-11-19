---

description: "VS Code、WebStorm、Neovim の ESLint 連携で、別のフォーマッターなしに Pug テンプレートを保存時に lint・fix します。"
---

# エディターの設定

このプラグインにエディター専用の拡張機能は不要です。ESLint を実行するエディター連携であれば、`eslint.config.js` から自動的にプラグインを読み込みます。

## VS Code {#vs-code}

[ESLint 拡張機能](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)をインストールし、`.vscode/settings.json` に次を追加します。

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

保存時の fix は `eslint --fix` と同じ [fix ガード](./fix-guard)を通るので、テンプレートを壊す fix は適用されません。

別のフォーマッター（Prettier、Volar のフォーマッター）も保存時に `.vue` ファイルを整形する場合は、Vue ファイルでそれを無効にしてください。そうしないと、Pug をめぐって ESLint と競合します。

```json
{
  "[vue]": { "editor.formatOnSave": false }
}
```

## その他のエディター {#other-editors}

- **WebStorm / JetBrains IDE:** Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint で *Automatic ESLint configuration* を選び、*Run for files* に `vue` を追加し、*Run eslint --fix on save* にチェックを入れます。
- **Neovim:** ESLint language server（nvim-lspconfig の `eslint`）を使い、`filetypes` に `vue` を加えて、保存時に `EslintFixAll` を実行します。
