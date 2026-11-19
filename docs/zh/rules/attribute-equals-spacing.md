---
title: vue-pug/attribute-equals-spacing
description: "vue-pug/attribute-equals-spacing (eslint-plugin-pug-vue)：禁止 Pug 属性的 = 和 != 两侧出现空格。选项、示例和修复。"
---

# vue-pug/attribute-equals-spacing

禁止 Pug 属性的 `=` 和 `!=` 两侧出现空格。

✅ 在 `configs.recommended` 中启用（级别为 `warn`）。🔧 可用 `--fix` 修复。

在 Pug 模板内部替代 `vue/no-spaces-around-equal-signs-in-attribute`。

## 规则详情 {#rule-details}

属性名与它的 `=` / `!=` 之间，以及运算符与值之间的空白必须为空。修复会删除这些空白。包含换行的间隔不会被处理。

### 错误示例 {#incorrect}

```vue
<template lang="pug">
a(href = "/") Home
</template>
```

```vue
<template lang="pug">
input(:value= "query" @input ="update")
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
div(v-html!="html" :title="title")
</template>
```

## 选项 {#options}

无。
