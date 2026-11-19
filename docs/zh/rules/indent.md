---
title: vue-pug/indent
description: "vue-pug/indent (eslint-plugin-pug-vue)：统一 Pug 模板的缩进。选项、示例和修复。"
---

# vue-pug/indent

统一 Pug 模板的缩进。

✅ 在 `configs.recommended` 中启用（级别为 `warn`）。🔧 可用 `--fix` 修复。

替代 `vue/html-indent`，后者会在 Pug 模板上崩溃，已被 `configs.base` 关闭。

## 规则详情 {#rule-details}

这条 rule 检查 `<template lang="pug">` 块中每一行的前导空白：

- 标签、文本、代码或控制语句行，每一层嵌套缩进一个单位。
- 在多行属性块中，属性行比标签深一级，以闭合的 `)` 开头的行与标签同级。
- 文本块（`p.`、`pre.`、`script.`）、注释、代码块或 filter 中第一行之后的各行，
  保持它们相对于第一行的偏移量，所以该块自身的缩进在块移动时得以保留。当缩进字符改变
  （空格变 Tab 或反过来）时，缩进比第一行更浅的行无法保持偏移：它会得到第一行的缩进，
  因为混用 Tab 和空格是 Pug 语法错误。
- 开始于字符串或模板字面量内部的行永远不会被重新缩进：它们的前导空白是值的一部分。
- 位于解析器报告为错误的区域内的行会被跳过。

Pug 的缩进就是结构：只移动一行而不带上它的同级和子节点，会改变语法树。
所以同一个模板的每条报告都带有相同的修复，它会一次性重新缩进整个范围。只要有一条报告保留下来，就足以在一次运行中修复全部。

### 错误示例 {#incorrect}

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

### 正确示例 {#correct}

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

## 选项 {#options}

```js
'vue-pug/indent': ['warn', 2, { baseIndent: 0 }]
```

- 第一个选项：缩进单位，可以是空格数（默认 `2`）或 `'tab'`。
- `baseIndent`（默认 `0`）：加到每一行上的单位数，这样顶层节点就可以相对于 `<template>` 缩进。

### 使用 `["tab"]` 时的错误示例 {#incorrect-with-tab}

```vue
<template lang="pug">
div
  p Hello
</template>
```

### 使用 `["tab"]` 时的正确示例 {#correct-with-tab}

```vue
<template lang="pug">
div
	p Hello
</template>
```

### 使用 `[2, { "baseIndent": 1 }]` 时的正确示例 {#correct-with-2-baseindent-1}

```vue
<template lang="pug">
  div
    p Hello
</template>
```
