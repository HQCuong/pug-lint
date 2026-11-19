---
title: vue-pug/implicit-div
description: "vue-pug/implicit-div (eslint-plugin-pug-vue): Bắt buộc hoặc cấm tên tag `div` trước shorthand class và id. Option, ví dụ và cách fix."
---

# vue-pug/implicit-div

Bắt buộc hoặc cấm tên tag `div` trước shorthand class và id.

✅ Được bật trong `configs.recommended` (ở mức `warn`). 🔧 Fix được bằng `--fix`.

## Chi tiết rule {#rule-details}

Trong Pug, một dòng bắt đầu bằng shorthand `.class` hoặc `#id` là một `div`.

- `always` (mặc định): dùng dạng ngầm định. Một `div` tường minh theo sau là shorthand bị báo và
  bản fix xóa tên đi.
- `never`: viết `div`. Một tag bắt đầu bằng shorthand bị báo và bản fix chèn `div`.

Một `div` không có shorthand (`div`, `div(v-if="ok")`) không bao giờ bị báo. Hai trường hợp dưới
`always` được báo mà không có fix: một `div` bên trong tag interpolation (`#[div.a x]`), và một
`div` mà shorthand đầu tiên không đứng ngay sau tên (`div(a).b`), vì xóa tên sẽ để lại một dòng
bắt đầu bằng `(`.

### Sai {#incorrect}

```vue
<template lang="pug">
div.card Content
</template>
```

```vue
<template lang="pug">
div#app.container
  p Hello
</template>
```

### Đúng {#correct}

```vue
<template lang="pug">
.card Content
</template>
```

```vue
<template lang="pug">
#app.container
  div(v-if="ready") Hello
</template>
```

## Option {#options}

```js
'vue-pug/implicit-div': ['warn', 'always']
```

`'always'` (mặc định) hoặc `'never'`.

### Sai với `["never"]` {#incorrect-with-never}

```vue
<template lang="pug">
.card Content
</template>
```

### Đúng với `["never"]` {#correct-with-never}

```vue
<template lang="pug">
div.card Content
</template>
```
