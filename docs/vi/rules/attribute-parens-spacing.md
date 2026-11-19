---
title: vue-pug/attribute-parens-spacing
description: "vue-pug/attribute-parens-spacing (eslint-plugin-pug-vue): Bắt buộc khoảng trắng nhất quán bên trong dấu ngoặc của attribute block Pug. Option, ví dụ và cách fix."
---

# vue-pug/attribute-parens-spacing

Bắt buộc khoảng trắng nhất quán bên trong dấu ngoặc của attribute block Pug.

✅ Được bật trong `configs.recommended` (ở mức `warn`). 🔧 Fix được bằng `--fix`.

Thay thế `vue/html-closing-bracket-spacing`, rule bị crash trên template Pug và bị `configs.base`
tắt.

## Chi tiết rule {#rule-details}

Rule kiểm tra khoảng trắng ngay sau `(` và ngay trước `)` trên cùng một dòng:

- `never` (mặc định): không có khoảng trắng ở đó. Bản fix xóa nó.
- `always`: có ít nhất một khoảng trắng ở đó. Bản fix chèn một khoảng trắng.

Một phía có khoảng trắng chứa ngắt dòng thuộc về
[`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) và được giữ nguyên, block rỗng
hoặc chỉ có khoảng trắng cũng vậy.

### Sai {#incorrect}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```

```vue
<template lang="pug">
input( type="text" name="q")
</template>
```

### Đúng {#correct}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

## Option {#options}

```js
'vue-pug/attribute-parens-spacing': ['warn', 'never']
```

`'never'` (mặc định) hoặc `'always'`.

### Sai với `["always"]` {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

### Đúng với `["always"]` {#correct-with-always}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```
