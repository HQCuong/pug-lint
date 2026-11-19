---
title: Xử lý sự cố
description: "Sửa các sự cố thường gặp với eslint-plugin-pug-vue: rule vue/* bị crash, fix không được áp dụng, không có gì được báo trong template Pug."
---

# Xử lý sự cố

## `TypeError: Cannot read properties of null (reading 'type')` (hoặc `'range'`) {#typeerror-cannot-read-properties-of-null-reading-type-or-range}

Một trong các rule `vue/*` bị crash trên template Pug đã bị một config đặt sau
`...vuePug.configs.recommended` (hoặc `base`) bật lại, ví dụ một config dùng chung hoặc một mục
`rules` bật nó. `configs.base` tắt các rule này cho mọi file `.vue`:

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

Hãy đặt `...vuePug.configs.recommended` sau mọi config bật chúng, hoặc xóa chúng khỏi `rules` của
bạn. Với template Pug, hãy dùng rule `vue-pug/*` thay thế.

## Một vấn đề được báo nhưng `--fix` không sửa {#a-problem-is-reported-but-fix-does-not-fix-it}

[Fix guard](./fix-guard) đã bỏ bản fix vì áp dụng nó sẽ làm đổi cấu trúc của template hoặc làm nó
không parse được. Hãy sửa dòng đó bằng tay. Nếu bạn nghĩ bản fix đó an toàn, xin
[mở một issue](https://github.com/HQCuong/pug-lint/issues/new/choose) kèm template.

Cũng hãy kiểm tra template không có vấn đề `vue/no-parsing-error`: khi template còn lỗi cú pháp
Pug, không bản fix nào được áp dụng bên trong nó.

## Không có gì được báo trong template Pug {#nothing-is-reported-in-pug-templates}

- Block phải là `<template lang="pug">` hoặc `<template lang="jade">`.
- `...vuePug.configs.recommended` (hoặc `base`) phải đứng sau các config của eslint-plugin-vue, và
  không config nào đứng sau được đặt `processor` riêng cho `**/*.vue`.
- Trong VS Code, `vue` phải có trong `eslint.validate` (xem [Thiết lập editor](./editor-setup)).

## Editor và CLI cho kết quả khác nhau {#the-editor-and-the-cli-disagree}

Extension ESLint có thể dùng ESLint khác hoặc config khác với terminal của bạn. Chạy
`npx eslint --print-config src/App.vue` và so sánh với output panel của extension
(kênh *ESLint*).
