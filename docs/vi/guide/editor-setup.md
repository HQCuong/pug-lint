---
title: Thiết lập editor
description: "Lint và fix template Pug khi lưu file trong VS Code, WebStorm và Neovim bằng tích hợp ESLint, không cần formatter thứ hai."
---

# Thiết lập editor

Plugin không cần extension riêng cho editor: mọi tích hợp editor có chạy ESLint đều tự nhận
plugin từ `eslint.config.js` của bạn.

## VS Code {#vs-code}

Cài [extension ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint),
rồi thêm vào `.vscode/settings.json`:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

Fix-on-save đi qua cùng [fix guard](./fix-guard) như `eslint --fix`, nên bản fix nào có thể làm
hỏng template sẽ không được áp dụng.

Nếu một formatter khác cũng format file `.vue` khi lưu (Prettier, formatter của Volar), hãy tắt nó
cho file Vue, nếu không nó sẽ giành quyền với ESLint trên phần Pug:

```json
{
  "[vue]": { "editor.formatOnSave": false }
}
```

## Các editor khác {#other-editors}

- **WebStorm / các IDE của JetBrains:** Settings → Languages & Frameworks → JavaScript → Code Quality
  Tools → ESLint: chọn *Automatic ESLint configuration*, thêm `vue` vào *Run for files*, và tick
  *Run eslint --fix on save*.
- **Neovim:** dùng ESLint language server (`eslint` trong nvim-lspconfig) với `vue` trong
  `filetypes`, và chạy `EslintFixAll` khi lưu.
