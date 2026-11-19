---
title: vue-pug/attribute-equals-spacing
description: "vue-pug/attribute-equals-spacing (eslint-plugin-pug-vue): Cấm khoảng trắng quanh `=` và `!=` của attribute Pug. Option, ví dụ và cách fix."
---

# vue-pug/attribute-equals-spacing

Cấm khoảng trắng quanh `=` và `!=` của attribute Pug.

✅ Được bật trong `configs.recommended` (ở mức `warn`). 🔧 Fix được bằng `--fix`.

Thay thế `vue/no-spaces-around-equal-signs-in-attribute` bên trong template Pug.

## Chi tiết rule {#rule-details}

Khoảng trắng giữa tên attribute và `=` / `!=` của nó, và giữa toán tử và giá trị, phải rỗng. Bản
fix xóa nó. Một khoảng trống có chứa ngắt dòng được giữ nguyên.

### Sai {#incorrect}

```vue
<template lang="pug">
a(href = "/") Home
</template>
```

```vue
<template lang="pug">
input(:value= "query" @input ="update")
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
div(v-html!="html" :title="title")
</template>
```

## Option {#options}

Không có.
