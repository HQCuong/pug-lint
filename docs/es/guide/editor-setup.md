---
title: Configuración del editor
description: "Analiza y corrige plantillas Pug al guardar en VS Code, WebStorm y Neovim con la integración de ESLint, sin un segundo formateador."
---

# Configuración del editor

El plugin no necesita una extensión de editor propia: cualquier integración de editor que ejecute
ESLint lo detecta a partir de tu `eslint.config.js`.

## VS Code {#vs-code}

Instala la [extensión de ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
y añade lo siguiente a `.vscode/settings.json`:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

La corrección al guardar pasa por la misma [guarda de correcciones](./fix-guard) que `eslint --fix`,
así que una corrección que rompería una plantilla no se aplica.

Si otro formateador también da formato a los archivos `.vue` al guardar (Prettier, el formateador de
Volar), desactívalo para los archivos Vue o competirá con ESLint por el Pug:

```json
{
  "[vue]": { "editor.formatOnSave": false }
}
```

## Otros editores {#other-editors}

- **WebStorm / IDE de JetBrains:** Settings → Languages & Frameworks → JavaScript → Code Quality
  Tools → ESLint: elige *Automatic ESLint configuration*, añade `vue` a *Run for files* y marca
  *Run eslint --fix on save*.
- **Neovim:** usa el servidor de lenguaje de ESLint (`eslint` en nvim-lspconfig) con `vue` en sus
  `filetypes` y ejecuta `EslintFixAll` al guardar.
