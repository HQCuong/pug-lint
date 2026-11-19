---
title: vue-pug/no-multi-spaces
description: "vue-pug/no-multi-spaces (eslint-plugin-pug-vue)：禁止 Pug 属性块中属性之间出现多个空格。选项、示例和修复。"
---

# vue-pug/no-multi-spaces

禁止 Pug 属性块中属性之间出现多个空格。

✅ 在 `configs.recommended` 中启用（级别为 `warn`）。🔧 可用 `--fix` 修复。

在 Pug 模板内部替代 `vue/no-multi-spaces`。

## 规则详情 {#rule-details}

同一个块中两个属性之间、位于同一行的连续两个或更多空格或 Tab 会被报告，修复会把它们替换成一个空格。逗号跟随它前面的属性，所以只测量间隔中最后一个逗号之后的空白。

属性值、括号旁边的空白（参见
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md)）以及标签之后的文本，
永远不会被改动。

### 错误示例 {#incorrect}

```vue
<template lang="pug">
a(href="/"   target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(type="text",   name="q")
</template>
```

### 正确示例 {#correct}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

```vue
<template lang="pug">
p(title="a   b")   spaced   text
</template>
```

## 选项 {#options}

无。
