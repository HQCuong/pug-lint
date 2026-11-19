---
title: "Configuration de l'éditeur"
description: "Linter et corriger les templates Pug à l'enregistrement dans VS Code, WebStorm et Neovim avec l'intégration ESLint, sans second formateur."
---

# Configuration de l'éditeur

Le plugin n'a besoin d'aucune extension d'éditeur propre : toute intégration d'éditeur qui exécute
ESLint le prend en compte à partir de votre `eslint.config.js`.

## VS Code {#vs-code}

Installez l'[extension ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint),
puis ajoutez ceci à `.vscode/settings.json` :

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

La correction à l'enregistrement passe par le même [fix guard](./fix-guard) que `eslint --fix` : une
correction qui casserait un template n'est donc pas appliquée.

Si un autre formateur formate aussi les fichiers `.vue` à l'enregistrement (Prettier, le formateur de
Volar), désactivez-le pour les fichiers Vue, sinon il se battra avec ESLint sur le Pug :

```json
{
  "[vue]": { "editor.formatOnSave": false }
}
```

## Autres éditeurs {#other-editors}

- **WebStorm / IDE JetBrains :** Settings → Languages & Frameworks → JavaScript → Code Quality
  Tools → ESLint : choisissez *Automatic ESLint configuration*, ajoutez `vue` à *Run for files* et
  cochez *Run eslint --fix on save*.
- **Neovim :** utilisez le serveur de langage ESLint (`eslint` dans nvim-lspconfig) avec `vue` dans
  ses `filetypes`, et lancez `EslintFixAll` à l'enregistrement.
