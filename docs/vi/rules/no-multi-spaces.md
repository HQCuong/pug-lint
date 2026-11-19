---
title: vue-pug/no-multi-spaces
description: "vue-pug/no-multi-spaces (eslint-plugin-pug-vue): Cấm nhiều khoảng trắng giữa các attribute trong attribute block Pug. Option, ví dụ và cách fix."
---

# vue-pug/no-multi-spaces

Cấm nhiều khoảng trắng giữa các attribute trong attribute block Pug.

✅ Được bật trong `configs.recommended` (ở mức `warn`). 🔧 Fix được bằng `--fix`.

Thay thế `vue/no-multi-spaces` bên trong template Pug.

## Chi tiết rule {#rule-details}

Một chuỗi hai hoặc nhiều space hay tab trên một dòng giữa hai attribute của cùng một block sẽ bị
báo, và bản fix thay nó bằng một khoảng trắng. Dấu phẩy đi cùng attribute đứng trước nó, nên chỉ
phần khoảng trắng sau dấu phẩy cuối cùng của khoảng trống được đo.

Giá trị attribute, khoảng trắng cạnh dấu ngoặc (xem
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md)) và text sau tag không bao giờ
bị đụng đến.

### Sai {#incorrect}

```vue
<template lang="pug">
a(href="/"   target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(type="text",   name="q")
</template>
```

### Đúng {#correct}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

```vue
<template lang="pug">
p(title="a   b")   spaced   text
</template>
```

## Option {#options}

Không có.
