---
title: vue-pug/prefer-shorthand
description: "vue-pug/prefer-shorthand (eslint-plugin-pug-vue): Bắt buộc hoặc cấm shorthand `.class` / `#id` cho attribute class và id tĩnh. Option, ví dụ và cách fix."
---

# vue-pug/prefer-shorthand

Bắt buộc hoặc cấm shorthand `.class` / `#id` cho attribute class và id tĩnh.

✅ Được bật trong `configs.recommended` (ở mức `warn`). 🔧 Fix được bằng `--fix`.

## Chi tiết rule {#rule-details}

Class và id được cấu hình riêng, mỗi cái với `always`, `never` hoặc `ignore`.

- `always` (mặc định cho cả hai): một attribute `class` hoặc `id` tĩnh trở thành shorthand:
  `p(class="a b")` → `p.a.b`, `p(id="x")` → `p#x`. Shorthand mới được đặt sau các shorthand đã có,
  và attribute block bị bỏ trống sẽ bị xóa.
- `never`: shorthand trở thành một attribute. Các class được nối vào attribute `class` tĩnh đã có;
  nếu không, attribute mới được chèn lên đầu trong attribute block đầu tiên (hoặc trong một block
  mới), với kiểu dấu nháy của giá trị chuỗi đầu tiên trong block đó (`"` nếu không có). Một tag
  bị bỏ trống tên và không còn shorthand sẽ nhận `div`.
- `ignore`: loại đó không được kiểm tra.

Chỉ attribute tĩnh được chuyển đổi: tên đúng là `class` hoặc `id`, giá trị là một chuỗi `'…'`
hoặc `"…"` thuần, và mọi token ngăn cách bằng khoảng trắng trong đó đều là tên shorthand Pug hợp
lệ. Nếu có token nào không hợp lệ (`md:flex`, `w-1/2`, `-1`, `1a`), cả giá trị được giữ nguyên.
Giá trị `id` phải là một token duy nhất. Attribute bound (`:class`, `v-bind:id`) không bao giờ bị
đụng đến. Một tag có cả shorthand id lẫn attribute `id` (là lỗi trong Pug) giữ id của nó như đã
viết.

Mọi chuyển đổi của một tag được áp dụng bằng một bản fix duy nhất, gắn vào báo cáo đầu tiên của
tag.

### Sai {#incorrect}

```vue
<template lang="pug">
p(class="lead") Text
</template>
```

```vue
<template lang="pug">
section(id="intro" class="hero dark")
</template>
```

### Đúng {#correct}

```vue
<template lang="pug">
p.lead Text
</template>
```

```vue
<template lang="pug">
section#intro.hero.dark(class="md:flex w-1/2" :class="{ active }")
</template>
```

## Option {#options}

```js
'vue-pug/prefer-shorthand': ['warn', { class: 'always', id: 'always' }]
```

`class` và `id`: `'always'` (mặc định), `'never'` hoặc `'ignore'`.

### Sai với `[{ "class": "never", "id": "always" }]` {#incorrect-with-class-never-id-always}

```vue
<template lang="pug">
p.lead Text
</template>
```

### Đúng với `[{ "class": "never", "id": "always" }]` {#correct-with-class-never-id-always}

```vue
<template lang="pug">
p#intro(class="lead") Text
</template>
```
