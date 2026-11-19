---
title: vue-pug/implicit-div
description: "vue-pug/implicit-div (eslint-plugin-pug-vue)：要求或禁止在 class 和 id 简写之前写标签名 div。选项、示例和修复。"
---

# vue-pug/implicit-div

要求或禁止在 class 和 id 简写之前写标签名 `div`。

✅ 在 `configs.recommended` 中启用（级别为 `warn`）。🔧 可用 `--fix` 修复。

## 规则详情 {#rule-details}

在 Pug 中，以 `.class` 或 `#id` 简写开头的行就是一个 `div`。

- `always`（默认）：使用隐式写法。显式的 `div` 后面跟着简写时会被报告，修复会删除这个名称。
- `never`：写出 `div`。以简写开头的标签会被报告，修复会插入 `div`。

没有简写的 `div`（`div`、`div(v-if="ok")`）永远不会被报告。`always` 下有两种情况
会被报告但没有修复：标签插值内的 `div`（`#[div.a x]`），以及第一个简写没有紧跟在名称之后的 `div`（`div(a).b`），
因为删除名称会留下一个以 `(` 开头的行。

### 错误示例 {#incorrect}

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

### 正确示例 {#correct}

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

## 选项 {#options}

```js
'vue-pug/implicit-div': ['warn', 'always']
```

`'always'`（默认）或 `'never'`。

### 使用 `["never"]` 时的错误示例 {#incorrect-with-never}

```vue
<template lang="pug">
.card Content
</template>
```

### 使用 `["never"]` 时的正确示例 {#correct-with-never}

```vue
<template lang="pug">
div.card Content
</template>
```
