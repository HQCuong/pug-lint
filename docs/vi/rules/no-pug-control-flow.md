---
title: vue-pug/no-pug-control-flow
description: "vue-pug/no-pug-control-flow (eslint-plugin-pug-vue): Cấm các construct compile-time của Pug (control flow, code, mixin, interpolation `#{}`, include). Option, ví dụ và cách fix."
---

# vue-pug/no-pug-control-flow

Cấm các construct compile-time của Pug (control flow, code, mixin, interpolation `#{}`, include).

Không được bật trong `configs.recommended`. Không fix được.

## Chi tiết rule {#rule-details}

Conditional, vòng lặp, code, mixin và interpolation `#{}` của Pug chạy một lần, khi template được
compile. Vue không bao giờ nhìn thấy chúng, nên chúng không reactive, và các rule `vue/*` không
thấy chính logic Pug. Rule này báo chúng để template dùng directive và binding của Vue thay vào
đó. Mỗi construct thuộc một danh mục:

| Danh mục | Báo |
|---|---|
| `control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default` |
| `code` | `- code`, `= expression`, `!= expression`, `p= expression` |
| `mixin` | định nghĩa mixin (`mixin name`) và lời gọi (`+name`) |
| `interpolation` | `#{…}` và `!{…}` trong text |
| `include` | `include`, `extends`, `block`, `append`, `prepend`, `yield`, `doctype` |

### Sai {#incorrect}

```vue
<template lang="pug">
ul
  each item in items
    li= item
</template>
```

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Đúng {#correct}

```vue
<template lang="pug">
ul
  li(v-for="item in items" :key="item") {{ item }}
</template>
```

```vue
<template lang="pug">
p(v-if="name") Hello {{ name }}
</template>
```

## Option {#options}

```js
'vue-pug/no-pug-control-flow': ['warn', { allow: [] }]
```

`allow`: các danh mục không bị báo, bất kỳ giá trị nào trong `'control'`, `'code'`, `'mixin'`,
`'interpolation'`, `'include'` (mặc định `[]`).

### Đúng với `[{ "allow": ["interpolation"] }]` {#correct-with-allow-interpolation}

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Sai với `[{ "allow": ["interpolation"] }]` {#incorrect-with-allow-interpolation}

```vue
<template lang="pug">
p= name
</template>
```

## Chuyển từ `eslint-plugin-vue-pug` {#migrating-from-eslint-plugin-vue-pug}

`eslint-plugin-vue-pug` có một rule cùng id, `vue-pug/no-pug-control-flow`. Khác biệt:

- Schema của nó rỗng: nó không nhận option và luôn báo mọi construct nó biết. Rule này nhận
  `{ allow: [...] }` (xem ở trên). Mọi option bạn truyền cho rule cũ đều bị ESLint từ chối, nên một
  cấu hình hiện có không có option vẫn hoạt động.
- Rule cũ được bật (ở mức `warn`) bởi các config `strongly-recommended` của nó. Rule này không nằm
  trong config nào: hãy tự bật.
