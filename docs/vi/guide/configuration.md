---
title: Cấu hình
description: "Cấu hình eslint-plugin-pug-vue: config base và recommended, template thụt lề dưới <template>, giữ lại một rule vue/* bị suppress, và plugin key."
---

# Cấu hình

## Hai config {#the-two-configs}

Cả hai config đều áp dụng cho `**/*.vue`.

| Config | Nó thiết lập gì |
|---|---|
| `configs.base` | Tokenizer cho template Pug của vue-eslint-parser, processor (suppress message và [fix guard](./fix-guard)), và tắt các [rule `vue/*` bị crash](./vue-rules). Không bật rule `vue-pug/*` nào. |
| `configs.recommended` | `base` cộng mọi rule `vue-pug/*` được khuyến nghị ở mức `warn`. |

Dùng `base` khi bạn muốn tự chọn các rule `vue-pug/*`:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.base,
  {
    files: ['**/*.vue'],
    rules: {
      'vue-pug/indent': 'error',
      'vue-pug/attribute-quotes': ['error', 'single'],
    },
  },
]
```

`languageOptions.parserOptions` của bạn (ví dụ `parser` cho TypeScript trong `<script>`) được
gộp với của plugin, nên chúng vẫn hoạt động.

## Template thụt lề dưới `<template>` {#templates-indented-under-template}

`vue-pug/indent` đặt các node cấp cao nhất ở cột 0 (`baseIndent: 0`, như file `.pug`). Nếu
template của bạn được viết thụt vào một cấp dưới `<template>`, hãy đặt `baseIndent: 1`, nếu không
rule sẽ kéo chúng về cột 0:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  { files: ['**/*.vue'], rules: { 'vue-pug/indent': ['warn', 2, { baseIndent: 1 }] } },
]
```

Xem [`vue-pug/indent`](/vi/rules/indent) để biết mọi option.

## Giữ lại một rule bị suppress {#keeping-a-suppressed-rule}

Một số rule `vue/*` [bị suppress bên trong template Pug](./vue-rules). Để một rule vẫn báo ở đó,
hãy tạo config bằng `configure()` và dùng nó thay cho `vuePug.configs`:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configure({ keepVueRules: ['vue/html-self-closing'] }).recommended,
]
```

Bạn tự chịu rủi ro. Một rule trong danh sách suppress có thể báo sai, và bản fix của nó có thể
không ổn định trên Pug: ví dụ `vue/singleline-html-element-content-newline` thêm một dòng trống
nữa sau mỗi lần chạy. `keepVueRules` không áp dụng cho các rule bị crash, chúng vẫn bị tắt.

## Plugin key {#plugin-key}

Plugin được đăng ký dưới key `vue-pug`. Mọi rule id (`vue-pug/indent`, …) và các config đều dùng
key này. Đăng ký plugin dưới key khác không được hỗ trợ.

## Khoảng trắng cuối dòng, dòng trống, newline cuối file {#trailing-spaces-blank-lines-final-newline}

Các rule `vue-pug/*` không xử lý những thứ này. Hãy dùng các rule của [`@stylistic`](https://eslint.style/):
`@stylistic/no-trailing-spaces`, `@stylistic/no-multiple-empty-lines` và `@stylistic/eol-last`.
Chúng chạy trên toàn bộ file `.vue`, kể cả template Pug, và fix guard kiểm tra bản fix của chúng
như mọi bản fix khác.
