---
title: vue-pug/max-attributes-per-line
description: "vue-pug/max-attributes-per-line (eslint-plugin-pug-vue): Giới hạn số attribute tối đa trên mỗi dòng trong attribute block Pug. Option, ví dụ và cách fix."
---

# vue-pug/max-attributes-per-line

Giới hạn số attribute tối đa trên mỗi dòng trong attribute block Pug.

✅ Được bật trong `configs.recommended` (ở mức `warn`). 🔧 Fix được bằng `--fix`.

Thay thế `vue/max-attributes-per-line` bên trong template Pug.

## Chi tiết rule {#rule-details}

Attribute được đếm theo từng attribute block: `a(w x)(y z)` có hai block, mỗi block hai attribute.

- Một block nằm trên một dòng được chứa tối đa `singleline` attribute (mặc định `3`). Vượt quá thì
  mọi attribute sau attribute đầu tiên đều bị báo.
- Một block có bất kỳ ngắt dòng nào, kể cả bên trong một giá trị, là nhiều dòng. Mỗi dòng của nó
  được chứa tối đa `multiline` attribute (mặc định `1`); những attribute thừa bị báo.

Bản fix thay khoảng trắng trước attribute bị báo bằng một ngắt dòng, thụt vào sâu hơn tag một cấp
(dấu phẩy đi cùng attribute đứng trước nó). Các ngắt dòng sau `(` và trước `)` do
[`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) lo. Các tag bên trong tag
interpolation (`#[a(x y z w)]`) không được kiểm tra: chúng là một phần của dòng text.

### Sai {#incorrect}

```vue
<template lang="pug">
input(type="text" name="q" placeholder="Search" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text" name="q"
  required
)
</template>
```

### Đúng {#correct}

```vue
<template lang="pug">
input(type="text" name="q" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
  placeholder="Search"
  required
)
</template>
```

## Option {#options}

```js
'vue-pug/max-attributes-per-line': ['warn', { singleline: 3, multiline: 1 }]
```

- `singleline` (số nguyên ≥ 1, mặc định `3`): giới hạn tối đa cho block nằm trên một dòng.
- `multiline` (số nguyên ≥ 1, mặc định `1`): giới hạn tối đa cho mỗi dòng trong block nhiều dòng.

### Sai với `[{ "singleline": 1 }]` {#incorrect-with-singleline-1}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Đúng với `[{ "singleline": 1 }]` {#correct-with-singleline-1}

```vue
<template lang="pug">
a(href="/") Home
</template>
```
