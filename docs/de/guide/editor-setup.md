---
title: Editor einrichten
description: "Pug-Templates beim Speichern in VS Code, WebStorm und Neovim mit der ESLint-Integration linten und fixen, ohne zweiten Formatter."
---

# Editor einrichten

Das Plugin braucht keine eigene Editor-Erweiterung: Jede Editor-Integration, die ESLint ausführt,
übernimmt es aus Ihrer `eslint.config.js`.

## VS Code {#vs-code}

Installieren Sie die [ESLint-Erweiterung](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
und ergänzen Sie dann `.vscode/settings.json`:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

Der Fix beim Speichern läuft durch denselben [Fix-Guard](./fix-guard) wie `eslint --fix`, ein Fix,
der ein Template kaputt machen würde, wird also nicht angewendet.

Wenn ein anderer Formatter `.vue`-Dateien ebenfalls beim Speichern formatiert (Prettier, der
Formatter von Volar), schalten Sie ihn für Vue-Dateien ab, sonst kämpft er mit ESLint um das Pug:

```json
{
  "[vue]": { "editor.formatOnSave": false }
}
```

## Andere Editoren {#other-editors}

- **WebStorm / JetBrains-IDEs:** Settings → Languages & Frameworks → JavaScript → Code Quality
  Tools → ESLint: Wählen Sie *Automatic ESLint configuration*, ergänzen Sie `vue` unter *Run for
  files* und aktivieren Sie *Run eslint --fix on save*.
- **Neovim:** Verwenden Sie den ESLint-Language-Server (`eslint` in nvim-lspconfig) mit `vue` in
  seinen `filetypes` und führen Sie beim Speichern `EslintFixAll` aus.
