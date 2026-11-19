---
title: "Настройка редактора"
description: "Линтинг и автоисправление шаблонов Pug при сохранении в VS Code, WebStorm и Neovim через интеграцию ESLint, без второго форматировщика."
---

# Настройка редактора {#editor-setup}

Плагину не нужно собственное расширение для редактора: любая интеграция с ESLint подхватит его из вашего
`eslint.config.js`.

## VS Code {#vs-code}

Установите [расширение ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint),
затем добавьте в `.vscode/settings.json`:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

Автоисправление при сохранении проходит через ту же [защиту исправлений](./fix-guard), что и `eslint --fix`,
поэтому исправление, которое сломало бы шаблон, не применяется.

Если другой форматировщик тоже форматирует файлы `.vue` при сохранении (Prettier, форматировщик Volar),
отключите его для Vue-файлов, иначе он будет спорить с ESLint из-за Pug:

```json
{
  "[vue]": { "editor.formatOnSave": false }
}
```

## Другие редакторы {#other-editors}

- **WebStorm / IDE от JetBrains:** Settings → Languages & Frameworks → JavaScript → Code Quality
  Tools → ESLint: выберите *Automatic ESLint configuration*, добавьте `vue` в *Run for files* и включите
  *Run eslint --fix on save*.
- **Neovim:** используйте языковой сервер ESLint (`eslint` в nvim-lspconfig) с `vue` в `filetypes`
  и запускайте `EslintFixAll` при сохранении.
