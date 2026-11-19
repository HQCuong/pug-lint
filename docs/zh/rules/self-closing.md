---
title: vue-pug/self-closing
description: "vue-pug/self-closing (eslint-plugin-pug-vue)：要求或禁止标签的自闭合 /。选项、示例和修复。"
---

# vue-pug/self-closing

要求或禁止标签的自闭合 `/`。

✅ 在 `configs.recommended` 中启用（级别为 `warn`）。🔧 可用 `--fix` 修复。

在 Pug 模板内部替代 `vue/html-self-closing` 和 `vue/html-end-tags`。

## 规则详情 {#rule-details}

- `never`（默认）：标签之后的每个 `/`（`img/`、`MyIcon/`）都会被报告。
- `always-components`：没有内容的组件（标签名含有大写字母或连字符）必须以 `/` 结尾，修复会加上它。
  其他所有标签都不能有 `/`。已经带 `/` 的组件不会被处理。

Pug 会把 `p/ text` 渲染成 `<p/>` 加上后面的文本，并且拒绝带有嵌套行的标签使用 `/`。
所以只有当 `/` 所在行上它后面什么都没有（连空格也没有），并且标签除了非缓冲注释（`//-`）外没有其他嵌套行时，
修复才会删除它。否则会报告 `/` 但不提供修复。带有任何内容的标签（文本、代码、`.`、嵌套行，甚至行尾的空格）
永远不会被加上 `/`。

### 错误示例 {#incorrect}

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

### 正确示例 {#correct}

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

## 选项 {#options}

```js
'vue-pug/self-closing': ['warn', 'never']
```

`'never'`（默认）或 `'always-components'`。

### 使用 `["always-components"]` 时的错误示例 {#incorrect-with-always-components}

```vue
<template lang="pug">
MyIcon(name="star")
</template>
```

### 使用 `["always-components"]` 时的正确示例 {#correct-with-always-components}

```vue
<template lang="pug">
div
  MyIcon(name="star")/
  my-icon/
  MyButton Save
  img(src="logo.png")
</template>
```
