---
title: vue-pug/self-closing
description: "vue-pug/self-closing (eslint-plugin-pug-vue): Bắt buộc hoặc cấm dấu `/` tự đóng của tag. Option, ví dụ và cách fix."
---

# vue-pug/self-closing

Bắt buộc hoặc cấm dấu `/` tự đóng của tag.

✅ Được bật trong `configs.recommended` (ở mức `warn`). 🔧 Fix được bằng `--fix`.

Thay thế `vue/html-self-closing` và `vue/html-end-tags` bên trong template Pug.

## Chi tiết rule {#rule-details}

- `never` (mặc định): mọi dấu `/` sau tag (`img/`, `MyIcon/`) đều bị báo.
- `always-components`: một component (tên tag có chữ hoa hoặc dấu gạch nối) không có nội dung phải
  kết thúc bằng `/`, và bản fix thêm nó vào. Mọi tag khác không được có. Một component đã có `/`
  được giữ nguyên.

Pug render `p/ text` thành `<p/>` theo sau là text, và từ chối `/` trên tag có dòng lồng bên dưới.
Vì vậy bản fix chỉ xóa `/` khi không có gì theo sau nó trên dòng (kể cả khoảng trắng) và tag không
có dòng lồng nào ngoài các comment không buffered (`//-`). Nếu không, `/` được báo mà không có fix.
Một tag có bất kỳ nội dung nào (text, code, `.`, dòng lồng, kể cả khoảng trắng ở cuối) không bao
giờ được thêm `/`.

### Sai {#incorrect}

```vue
<template lang="pug">
img(src="logo.png")/
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")/
</template>
```

### Đúng {#correct}

```vue
<template lang="pug">
img(src="logo.png")
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")
  br
</template>
```

## Option {#options}

```js
'vue-pug/self-closing': ['warn', 'never']
```

`'never'` (mặc định) hoặc `'always-components'`.

### Sai với `["always-components"]` {#incorrect-with-always-components}

```vue
<template lang="pug">
MyIcon(name="star")
</template>
```

### Đúng với `["always-components"]` {#correct-with-always-components}

```vue
<template lang="pug">
div
  MyIcon(name="star")/
  my-icon/
  MyButton Save
  img(src="logo.png")
</template>
```
