---
title: Configuração do editor
description: "Faça lint e corrija templates Pug ao salvar no VS Code, WebStorm e Neovim com a integração do ESLint, sem um segundo formatador."
---

# Configuração do editor

O plugin não precisa de extensão própria no editor: qualquer integração de editor que rode o ESLint
o carrega a partir do seu `eslint.config.js`.

## VS Code {#vs-code}

Instale a [extensão do ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
e adicione ao `.vscode/settings.json`:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

A correção ao salvar passa pelo mesmo [fix guard](./fix-guard) do `eslint --fix`, então uma
correção que quebraria um template não é aplicada.

Se outro formatador também formata arquivos `.vue` ao salvar (Prettier, o formatador do Volar),
desative-o para arquivos Vue, ou ele vai brigar com o ESLint por causa do Pug:

```json
{
  "[vue]": { "editor.formatOnSave": false }
}
```

## Outros editores {#other-editors}

- **WebStorm / IDEs da JetBrains:** Settings → Languages & Frameworks → JavaScript → Code Quality
  Tools → ESLint: escolha *Automatic ESLint configuration*, adicione `vue` em *Run for files* e
  marque *Run eslint --fix on save*.
- **Neovim:** use o language server do ESLint (`eslint` no nvim-lspconfig) com `vue` em seus
  `filetypes`, e rode `EslintFixAll` ao salvar.
