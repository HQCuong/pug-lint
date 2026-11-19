---
title: vue-pug/attribute-quotes
description: "vue-pug/attribute-quotes (eslint-plugin-pug-vue)：统一 Pug 属性值的引号风格。选项、示例和修复。"
---

# vue-pug/attribute-quotes

统一 Pug 属性值的引号风格。

✅ 在 `configs.recommended` 中启用（级别为 `warn`）。🔧 可用 `--fix` 修复。

在 Pug 模板内部替代 `vue/html-quotes`。那条 rule 的修复器会把内部的引号转义成
`&quot;`，这在 Pug 中是错的（属性值是 JavaScript 表达式），而且它不知道反引号也是合法的 Pug 引号。

## 规则详情 {#rule-details}

使用了另一种引号风格的、由单个 `'…'` 或 `"…"` 字符串构成的值会被报告。修复只会交换这两个引号字符，不会重新转义任何内容：当值中包含目标引号或反斜杠时，会报告问题但不提供修复。

默认保留反引号值。使用 `backticks: 'convert'` 时，只有在反引号值位于一行之内，且不含 `${}`、引号和反斜杠时，才会被报告并修复；其他反引号值不会被处理。不是单个字面量的值（`x`、`a + 'b'`、`{ a: 1 }`）
永远不会被改动。

### 错误示例 {#incorrect}

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

第二个示例会被报告但没有修复：交换引号需要转义。

### 正确示例 {#correct}

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

## 选项 {#options}

```js
'vue-pug/attribute-quotes': ['warn', 'double', { backticks: 'keep' }]
```

- 第一个选项：`'double'`（默认）或 `'single'`。
- `backticks`：`'keep'`（默认）或 `'convert'`。

### 使用 `["single"]` 时的错误示例 {#incorrect-with-single}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

### 使用 `["single"]` 时的正确示例 {#correct-with-single}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

### 使用 `["double", { "backticks": "convert" }]` 时的错误示例 {#incorrect-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello`) Hi
</template>
```

### 使用 `["double", { "backticks": "convert" }]` 时的正确示例 {#correct-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello ${name}`) Hi
</template>
```
