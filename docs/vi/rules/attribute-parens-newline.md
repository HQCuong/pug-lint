---
title: vue-pug/attribute-parens-newline
description: "vue-pug/attribute-parens-newline (eslint-plugin-pug-vue): Bắt buộc ngắt dòng sau `(` và trước `)` của attribute block Pug nhiều dòng. Option, ví dụ và cách fix."
---

# vue-pug/attribute-parens-newline

Bắt buộc ngắt dòng sau `(` và trước `)` của attribute block Pug nhiều dòng.

✅ Được bật trong `configs.recommended` (ở mức `warn`). 🔧 Fix được bằng `--fix`.

Thay thế `vue/first-attribute-linebreak` và `vue/html-closing-bracket-newline` bên trong template
Pug.

## Chi tiết rule {#rule-details}

Một attribute block là nhiều dòng khi có hai attribute của nó bắt đầu ở các dòng khác nhau.

- `multiline: 'always'` (mặc định): block nhiều dòng cần một ngắt dòng ngay sau `(` và ngay trước
  `)`. Bản fix chèn ngắt dòng bằng ký tự xuống dòng và đơn vị thụt lề của chính template (attribute
  đầu tiên sâu hơn tag một cấp, `)` ở cấp của tag).
- `multiline: 'never'`: block nhiều dòng không được có các ngắt dòng đó.

Một block không phải nhiều dòng (kể cả block chỉ có một attribute) cũng không được có chúng.
Khoảng trắng cùng dòng cạnh dấu ngoặc thuộc về
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md); block rỗng được giữ nguyên.

### Sai {#incorrect}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```

```vue
<template lang="pug">
input(
  type="text"
)
</template>
```

### Đúng {#correct}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

```vue
<template lang="pug">
input(type="text" name="q")
</template>
```

## Option {#options}

```js
'vue-pug/attribute-parens-newline': ['warn', { multiline: 'always' }]
```

`multiline`: `'always'` (mặc định) hoặc `'never'`.

### Sai với `[{ "multiline": "never" }]` {#incorrect-with-multiline-never}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

### Đúng với `[{ "multiline": "never" }]` {#correct-with-multiline-never}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```
