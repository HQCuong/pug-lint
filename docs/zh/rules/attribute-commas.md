---
title: vue-pug/attribute-commas
description: "vue-pug/attribute-commas (eslint-plugin-pug-vue)：要求或禁止 Pug 属性块中属性之间使用逗号。选项、示例和修复。"
---

# vue-pug/attribute-commas

要求或禁止 Pug 属性块中属性之间使用逗号。

✅ 在 `configs.recommended` 中启用（级别为 `warn`）。🔧 可用 `--fix` 修复。

## 规则详情 {#rule-details}

Pug 接受用空白、逗号或两者一起分隔属性。这条 rule 让这个选择保持一致：

- `never`（默认）：属性块中的每个逗号都会被报告并删除。
- `always`：每对属性之间恰好有一个逗号。缺失的逗号会被插入到它前面那个属性的紧后面；同一间隔中多余的逗号会被删除。

无论使用哪个选项，第一个属性之前或最后一个属性之后的逗号都会被报告。当删除某个逗号会让两个属性粘在一起
（`a(x="1",y="2")`）时，修复会在原处放一个空格。这条 rule 只处理逗号字符：使用 `always` 时，逗号之前的空白
（`x="1" , y="2"`）保持原样，在 v1 中也没有其他 rule 会规范它。

### 错误示例 {#incorrect}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text",
  name="q"
)
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
input(
  type="text"
  name="q"
)
</template>
```

## 选项 {#options}

```js
'vue-pug/attribute-commas': ['warn', 'never']
```

`'never'`（默认）或 `'always'`。

### 使用 `["always"]` 时的错误示例 {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### 使用 `["always"]` 时的正确示例 {#correct-with-always}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```
