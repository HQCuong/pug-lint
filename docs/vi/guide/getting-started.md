---
title: Bắt đầu
description: "Cài eslint-plugin-pug-vue và lint template Pug trong Vue single-file component bằng ESLint: yêu cầu, cài đặt, flat config và lần eslint --fix đầu tiên."
---

# Bắt đầu

`eslint-plugin-pug-vue` lint và format `<template lang="pug">` (và `lang="jade"`) trong Vue
single-file component:

- Các rule `vue/*` của eslint-plugin-vue chạy trên template Pug, với tên quen thuộc và các option
  bạn vẫn dùng.
- Các [rule `vue-pug/*`](/vi/rules/) format chính phần Pug: thụt lề, bố cục attribute, dấu nháy,
  dấu phẩy, shorthand. Một rule tùy chọn báo các construct compile-time của Pug.
- Mọi bản fix đụng đến template Pug đều được kiểm tra trước khi ESLint áp dụng
  ([fix guard](./fix-guard)), nên `--fix` và fix-on-save không làm hỏng template.
- Không cần Prettier hay formatter riêng: các bản fix đến từ ESLint.

## Yêu cầu {#requirements}

- Node.js `^20.19.0 || ^22.13.0 || >=24`
- ESLint `^9.15.0 || ^10.0.0`, chỉ hỗ trợ flat config (`eslint.config.js`)
- `eslint-plugin-vue` `^10.0.0` và `vue-eslint-parser` `^10.0.0`

## Cài đặt {#install}

::: code-group

```sh [npm]
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [pnpm]
pnpm add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [yarn]
yarn add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

:::

## Cấu hình {#configure}

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

Hãy đặt `...vuePug.configs.recommended` **sau** các config của eslint-plugin-vue. Nó thiết lập
parser option, processor và các rule phải tắt cho Pug. Một config đứng sau mà đặt processor riêng,
hoặc bật lại một [rule bị crash](./vue-rules), sẽ làm hỏng việc lint file Pug.

## Chạy {#run-it}

```sh
npx eslint .          # report problems
npx eslint . --fix    # fix what can be fixed
```

Để fix khi lưu trong VS Code, xem [Thiết lập editor](./editor-setup).

## Bước tiếp theo {#next-steps}

- [Cấu hình](./configuration): hai config, `baseIndent`, giữ lại một rule bị suppress.
- [Rule](/vi/rules/): mỗi rule `vue-pug/*` làm gì và các option của nó.
- [Hạn chế đã biết](./limitations) trước khi bạn triển khai trên một codebase lớn.
- Đang dùng `eslint-plugin-vue-pug`? Đọc [hướng dẫn chuyển đổi](./migration).
- Dùng oxlint? Chạy nó cạnh ESLint: xem [Dùng cùng oxlint](./oxlint).
