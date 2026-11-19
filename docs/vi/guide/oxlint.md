---
title: Dùng cùng oxlint
description: "Dùng eslint-plugin-pug-vue trong dự án có oxlint: oxlint cho script, ESLint cho template Vue, và eslint-plugin-oxlint để tránh báo trùng."
---

# Dùng cùng oxlint

[Oxlint](https://oxc.rs/docs/guide/usage/linter) là một linter nhanh hơn nhiều, viết bằng Rust.
Trong file `.vue`, nó chỉ lint các block `<script>`: không lint `<template>`, dù là HTML hay Pug,
và không nạp được plugin này vì plugin cần vue-eslint-parser để đọc template.

Vì vậy trong dự án dùng oxlint, hãy chạy cả hai:

- **oxlint** cho JavaScript và TypeScript, kể cả `<script>` của file `.vue`;
- **ESLint** cho những gì oxlint chưa làm được: các template, với eslint-plugin-vue và
  `eslint-plugin-pug-vue`.

[`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) tắt, trong ESLint,
mọi rule mà config oxlint của bạn đã chạy, nên không vấn đề nào bị báo hai lần và ESLint làm ít
việc hơn.

## Cài đặt {#install}

```sh
npm install --save-dev oxlint eslint-plugin-oxlint \
  eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

## Cấu hình oxlint {#configure-oxlint}

Tạo `.oxlintrc.json` bằng `npx oxlint --init`, và thêm `vue` vào plugins để oxlint cũng chạy các
rule Vue của nó trên các block `<script>`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "vue"],
  "categories": {
    "correctness": "error"
  }
}
```

## Cấu hình ESLint {#configure-eslint}

Đặt config oxlint **cuối cùng**, sau `vuePug.configs.recommended`:

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'
import oxlint from 'eslint-plugin-oxlint'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  // Last: turn off the rules that .oxlintrc.json already runs.
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
]
```

Các rule nó tắt là rule của script (`no-debugger`, `vue/no-dupe-keys`,
`vue/valid-define-props`, …). Nó không tắt rule template nào và không tắt rule `vue-pug/*` nào,
nên template Pug được lint và format y như khi không có oxlint.

## Chạy cả hai {#run-them}

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint:fix": "oxlint --fix && eslint . --fix"
  }
}
```

Oxlint chạy trước: nó chỉ mất vài mili giây, và lỗi của nó hiện ra trước khi ESLint bắt đầu. Oxlint
bỏ qua các file có trong `.gitignore`, nên hãy thêm `node_modules` vào đó nếu chưa có.

`&&` dừng ở linter đầu tiên còn báo lỗi. Nếu oxlint gặp một lỗi mà nó không fix được (ví dụ câu
lệnh `debugger`), `lint:fix` dừng ở đó và ESLint không format các template. Hãy sửa lỗi đó, hoặc
chạy riêng `npx eslint . --fix`.

## VS Code {#vs-code}

Cài [extension Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) cạnh
[extension ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint),
và để cả hai cùng fix khi lưu:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```

Hai bên không bao giờ fix cùng một thứ: oxlint fix các script, ESLint fix các template, và mọi bản
fix ESLint thực hiện trong template Pug vẫn đi qua [fix guard](./fix-guard).

## Không dùng ESLint? {#without-eslint}

Chưa được. Oxlint chạy được các plugin ESLint viết bằng JavaScript, nhưng chỉ đưa cho chúng các
block `<script>` của file `.vue`, còn custom parser và các ngôn ngữ file như template Vue vẫn đang
được phát triển trong oxc. Khi oxlint lint được template Vue, plugin này có thể theo sau: parser
của nó, `pug-lint-parser`, không phụ thuộc vào ESLint. Cho đến lúc đó, hãy giữ ESLint cho template
`.vue`.
