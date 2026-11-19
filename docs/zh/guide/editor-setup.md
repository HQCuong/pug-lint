---
title: 编辑器设置
description: "在 VS Code、WebStorm 和 Neovim 中通过 ESLint 集成在保存时 lint 并修复 Pug 模板，无需第二个格式化工具。"
---

# 编辑器设置

插件不需要专门的编辑器扩展：任何运行 ESLint 的编辑器集成都会从你的 `eslint.config.js` 读取它。

## VS Code {#vs-code}

安装 [ESLint 扩展](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)，
然后在 `.vscode/settings.json` 中添加：

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

保存时修复和 `eslint --fix` 一样会经过同一个 [fix guard](./fix-guard)，所以会破坏模板的修复不会被应用。

如果还有其他格式化工具也会在保存时格式化 `.vue` 文件（Prettier、Volar 的格式化工具），请对 Vue 文件关闭它，否则它会和 ESLint 在 Pug 上互相打架：

```json
{
  "[vue]": { "editor.formatOnSave": false }
}
```

## 其他编辑器 {#other-editors}

- **WebStorm / JetBrains IDE：** Settings → Languages & Frameworks → JavaScript → Code Quality
  Tools → ESLint：选择 *Automatic ESLint configuration*，把 `vue` 加到 *Run for files*，并勾选
  *Run eslint --fix on save*。
- **Neovim：** 使用 ESLint language server（nvim-lspconfig 中的 `eslint`），在它的
  `filetypes` 中加入 `vue`，并在保存时运行 `EslintFixAll`。
