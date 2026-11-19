---
title: vue-pug/indent
description: "vue-pug/indent (eslint-plugin-pug-vue): Bắt buộc thụt lề nhất quán trong template Pug. Option, ví dụ và cách fix."
---

# vue-pug/indent

Bắt buộc thụt lề nhất quán trong template Pug.

✅ Được bật trong `configs.recommended` (ở mức `warn`). 🔧 Fix được bằng `--fix`.

Thay thế `vue/html-indent`, rule bị crash trên template Pug và bị `configs.base` tắt.

## Chi tiết rule {#rule-details}

Rule kiểm tra khoảng trắng đầu dòng của mọi dòng trong block `<template lang="pug">`:

- Một dòng tag, text, code hoặc control được thụt lề một đơn vị cho mỗi cấp lồng.
- Trong attribute block nhiều dòng, các dòng attribute sâu hơn tag một cấp, và dòng bắt đầu bằng
  `)` đóng block nằm ở cấp của tag.
- Các dòng của text block (`p.`, `pre.`, `script.`), comment, code block hoặc filter sau dòng đầu
  tiên giữ nguyên độ lệch so với dòng đầu, nên phần thụt lề riêng của block được bảo toàn khi nó
  di chuyển. Khi ký tự thụt lề đổi (space sang tab hoặc ngược lại), một dòng thụt ít hơn dòng đầu
  không thể giữ độ lệch: nó nhận thụt lề của dòng đầu, vì trộn tab và space là lỗi cú pháp Pug.
- Các dòng bắt đầu bên trong một string hoặc template literal không bao giờ bị thụt lề lại: khoảng
  trắng đầu dòng của chúng là một phần của giá trị.
- Các dòng nằm trong vùng mà parser báo lỗi bị bỏ qua.

Thụt lề trong Pug là cấu trúc: di chuyển một dòng mà không mang theo anh em và con của nó sẽ làm
đổi cây. Vì vậy mọi báo cáo của một template đều mang cùng một bản fix, thụt lề lại cả đoạn một
lần. Chỉ cần một báo cáo còn lại là đủ để fix tất cả trong một lượt.

### Sai {#incorrect}

```vue
<template lang="pug">
div
   p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
      v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

### Đúng {#correct}

```vue
<template lang="pug">
div
  p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
    v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

```vue
<template lang="pug">
div
  pre.
    first line
      keeps its extra indentation
  p(title=`a
      b`)
</template>
```

## Option {#options}

```js
'vue-pug/indent': ['warn', 2, { baseIndent: 0 }]
```

- Option đầu tiên: đơn vị thụt lề, một số lượng space (mặc định `2`) hoặc `'tab'`.
- `baseIndent` (mặc định `0`): số đơn vị cộng thêm vào mọi dòng, để các node cấp cao nhất có thể
  được thụt lề so với `<template>`.

### Sai với `["tab"]` {#incorrect-with-tab}

```vue
<template lang="pug">
div
  p Hello
</template>
```

### Đúng với `["tab"]` {#correct-with-tab}

```vue
<template lang="pug">
div
	p Hello
</template>
```

### Đúng với `[2, { "baseIndent": 1 }]` {#correct-with-2-baseindent-1}

```vue
<template lang="pug">
  div
    p Hello
</template>
```
