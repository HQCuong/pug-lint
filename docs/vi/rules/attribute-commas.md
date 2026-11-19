---
title: vue-pug/attribute-commas
description: "vue-pug/attribute-commas (eslint-plugin-pug-vue): Bắt buộc hoặc cấm dấu phẩy giữa các attribute trong attribute block của Pug. Option, ví dụ và cách fix."
---

# vue-pug/attribute-commas

Bắt buộc hoặc cấm dấu phẩy giữa các attribute trong attribute block của Pug.

✅ Được bật trong `configs.recommended` (ở mức `warn`). 🔧 Fix được bằng `--fix`.

## Chi tiết rule {#rule-details}

Pug chấp nhận các attribute ngăn cách bằng khoảng trắng, bằng dấu phẩy, hoặc cả hai. Rule này làm
cho lựa chọn đó nhất quán:

- `never` (mặc định): mọi dấu phẩy trong attribute block đều bị báo và bị xóa.
- `always`: đúng một dấu phẩy giữa mỗi cặp attribute. Dấu phẩy thiếu được chèn ngay sau attribute
  đứng trước nó; dấu phẩy thừa trong cùng khoảng trống bị xóa.

Với cả hai option, dấu phẩy trước attribute đầu tiên hoặc sau attribute cuối cùng đều bị báo. Khi
xóa một dấu phẩy sẽ làm hai attribute dính vào nhau (`a(x="1",y="2")`), bản fix đặt một khoảng
trắng vào chỗ đó. Rule chỉ đụng đến ký tự dấu phẩy: với `always`, khoảng trắng đứng trước dấu phẩy
(`x="1" , y="2"`) được giữ nguyên, và ở v1 không rule nào chuẩn hóa nó.

### Sai {#incorrect}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text",
  name="q"
)
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
input(
  type="text"
  name="q"
)
</template>
```

## Option {#options}

```js
'vue-pug/attribute-commas': ['warn', 'never']
```

`'never'` (mặc định) hoặc `'always'`.

### Sai với `["always"]` {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Đúng với `["always"]` {#correct-with-always}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```
