---
title: vue-pug/attribute-quotes
description: "vue-pug/attribute-quotes (eslint-plugin-pug-vue): Bắt buộc một kiểu dấu nháy nhất quán cho giá trị attribute Pug. Option, ví dụ và cách fix."
---

# vue-pug/attribute-quotes

Bắt buộc một kiểu dấu nháy nhất quán cho giá trị attribute Pug.

✅ Được bật trong `configs.recommended` (ở mức `warn`). 🔧 Fix được bằng `--fix`.

Thay thế `vue/html-quotes` bên trong template Pug. Bản fix của rule đó escape dấu nháy bên trong
thành `&quot;`, điều này sai trong Pug (giá trị attribute là một biểu thức JavaScript), và nó
không biết rằng backtick là dấu nháy hợp lệ trong Pug.

## Chi tiết rule {#rule-details}

Một giá trị là một chuỗi `'…'` hoặc `"…"` duy nhất ở kiểu dấu nháy còn lại sẽ bị báo. Bản fix chỉ
đổi chỗ hai ký tự nháy, và không bao giờ escape lại thứ gì: khi giá trị chứa dấu nháy đích hoặc
dấu gạch chéo ngược, nó được báo mà không có fix.

Giá trị dùng backtick được giữ nguyên theo mặc định. Với `backticks: 'convert'`, giá trị backtick
bị báo và được fix chỉ khi nó nằm trên một dòng và không chứa `${}`, dấu nháy hay dấu gạch chéo
ngược; các giá trị backtick khác được giữ nguyên. Các giá trị không phải một literal đơn (`x`,
`a + 'b'`, `{ a: 1 }`) không bao giờ bị đụng đến.

### Sai {#incorrect}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

```vue
<template lang="pug">
p(title='Say "hi"') Hello
</template>
```

Ví dụ thứ hai được báo mà không có fix: đổi dấu nháy sẽ cần escape.

### Đúng {#correct}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

```vue
<template lang="pug">
p(:class=`card` :title="'Hi ' + name" :data-id=id) Hello
</template>
```

## Option {#options}

```js
'vue-pug/attribute-quotes': ['warn', 'double', { backticks: 'keep' }]
```

- Option đầu tiên: `'double'` (mặc định) hoặc `'single'`.
- `backticks`: `'keep'` (mặc định) hoặc `'convert'`.

### Sai với `["single"]` {#incorrect-with-single}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

### Đúng với `["single"]` {#correct-with-single}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

### Sai với `["double", { "backticks": "convert" }]` {#incorrect-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello`) Hi
</template>
```

### Đúng với `["double", { "backticks": "convert" }]` {#correct-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello ${name}`) Hi
</template>
```
