---
title: vue-pug/attribute-parens-newline
description: "vue-pug/attribute-parens-newline (eslint-plugin-pug-vue)：要求多行 Pug 属性块在 ( 之后和 ) 之前换行。选项、示例和修复。"
---

# vue-pug/attribute-parens-newline

要求多行 Pug 属性块在 `(` 之后和 `)` 之前换行。

✅ 在 `configs.recommended` 中启用（级别为 `warn`）。🔧 可用 `--fix` 修复。

在 Pug 模板内部替代 `vue/first-attribute-linebreak` 和 `vue/html-closing-bracket-newline`。

## 规则详情 {#rule-details}

当属性块中有两个属性从不同的行开始时，这个属性块就是多行的。

- `multiline: 'always'`（默认）：多行块需要在 `(` 之后和 `)` 之前紧接着换行。修复会使用模板自己的换行符和缩进单位插入换行
  （第一个属性比标签深一级，`)` 与标签同级）。
- `multiline: 'never'`：多行块不能有这些换行。

不是多行的块（包括只有一个属性的块）同样不能有这些换行。括号旁边同一行内的空格归
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md) 管；空块不会被处理。

### 错误示例 {#incorrect}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```

```vue
<template lang="pug">
input(
  type="text"
)
</template>
```

### 正确示例 {#correct}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

```vue
<template lang="pug">
input(type="text" name="q")
</template>
```

## 选项 {#options}

```js
'vue-pug/attribute-parens-newline': ['warn', { multiline: 'always' }]
```

`multiline`：`'always'`（默认）或 `'never'`。

### 使用 `[{ "multiline": "never" }]` 时的错误示例 {#incorrect-with-multiline-never}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

### 使用 `[{ "multiline": "never" }]` 时的正确示例 {#correct-with-multiline-never}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```
