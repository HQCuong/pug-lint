---
description: "Lint and fix Pug templates on save in VS Code, WebStorm and Neovim with the ESLint integration, without a second formatter."
---

# Editor setup

The plugin needs no editor extension of its own: any editor integration that runs ESLint picks it
up from your `eslint.config.js`.

## VS Code

Install the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint),
then add to `.vscode/settings.json`:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

Fix-on-save goes through the same [fix guard](./fix-guard) as `eslint --fix`, so a fix that would
break a template is not applied.

If another formatter also formats `.vue` files on save (Prettier, Volar's formatter), turn it off
for Vue files or it will fight with ESLint over the Pug:

```json
{
  "[vue]": { "editor.formatOnSave": false }
}
```

## Other editors

- **WebStorm / JetBrains IDEs:** Settings → Languages & Frameworks → JavaScript → Code Quality
  Tools → ESLint: choose *Automatic ESLint configuration*, add `vue` to *Run for files*, and tick
  *Run eslint --fix on save*.
- **Neovim:** use the ESLint language server (`eslint` in nvim-lspconfig) with `vue` in its
  `filetypes`, and run `EslintFixAll` on save.
