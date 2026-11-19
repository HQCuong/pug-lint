---
title: vue-pug/attribute-parens-spacing
description: "vue-pug/attribute-parens-spacing (eslint-plugin-pug-vue)：统一 Pug 属性块括号内侧的空格。选项、示例和修复。"
---

# vue-pug/attribute-parens-spacing

统一 Pug 属性块括号内侧的空格。

✅ 在 `configs.recommended` 中启用（级别为 `warn`）。🔧 可用 `--fix` 修复。

替代 `vue/html-closing-bracket-spacing`，后者会在 Pug 模板上崩溃，已被 `configs.base` 关闭。

## 规则详情 {#rule-details}

这条 rule 检查同一行内紧跟在 `(` 之后和紧挨在 `)` 之前的空白：

- `never`（默认）：那里不能有空白。修复会删除它。
- `always`：那里至少有一个空格。修复会插入一个。

如果某一侧的空白包含换行，它归
[`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) 管，不会被处理；空块或只有空白的块也一样。

### 错误示例 {#incorrect}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```

```vue
<template lang="pug">
input( type="text" name="q")
</template>
```

### 正确示例 {#correct}

```vue
<template lang="pug">
a(href="/") Home
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

## 选项 {#options}

```js
'vue-pug/attribute-parens-spacing': ['warn', 'never']
```

`'never'`（默认）或 `'always'`。

### 使用 `["always"]` 时的错误示例 {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

### 使用 `["always"]` 时的正确示例 {#correct-with-always}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```
