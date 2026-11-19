---
title: vue-pug/max-attributes-per-line
description: "vue-pug/max-attributes-per-line (eslint-plugin-pug-vue)：限制 Pug 属性块中每行的属性数量。选项、示例和修复。"
---

# vue-pug/max-attributes-per-line

限制 Pug 属性块中每行的属性数量。

✅ 在 `configs.recommended` 中启用（级别为 `warn`）。🔧 可用 `--fix` 修复。

在 Pug 模板内部替代 `vue/max-attributes-per-line`。

## 规则详情 {#rule-details}

属性按属性块计数：`a(w x)(y z)` 有两个块，每个块两个属性。

- 位于一行内的块最多可以有 `singleline` 个属性（默认 `3`）。超过之后，第一个之后的每个属性都会被报告。
- 包含任何换行的块（包括值内部的换行）是多行块。它的每一行最多可以有 `multiline` 个属性（默认 `1`）；多出来的会被报告。

修复会把被报告属性之前的空白替换成换行，缩进比标签深一级（逗号跟随它前面的属性）。`(` 之后和 `)` 之前的换行
交给 [`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) 处理。标签插值内部的标签
（`#[a(x y z w)]`）不会被检查：它们是文本行的一部分。

### 错误示例 {#incorrect}

```vue
<template lang="pug">
input(type="text" name="q" placeholder="Search" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text" name="q"
  required
)
</template>
```

### 正确示例 {#correct}

```vue
<template lang="pug">
input(type="text" name="q" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
  placeholder="Search"
  required
)
</template>
```

## 选项 {#options}

```js
'vue-pug/max-attributes-per-line': ['warn', { singleline: 3, multiline: 1 }]
```

- `singleline`（≥ 1 的整数，默认 `3`）：位于一行内的块的最大值。
- `multiline`（≥ 1 的整数，默认 `1`）：多行块中每行的最大值。

### 使用 `[{ "singleline": 1 }]` 时的错误示例 {#incorrect-with-singleline-1}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### 使用 `[{ "singleline": 1 }]` 时的正确示例 {#correct-with-singleline-1}

```vue
<template lang="pug">
a(href="/") Home
</template>
```
