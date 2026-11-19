---
title: vue-pug/prefer-shorthand
description: "vue-pug/prefer-shorthand (eslint-plugin-pug-vue)：要求或禁止对静态 class 和 id 属性使用 .class / #id 简写。选项、示例和修复。"
---

# vue-pug/prefer-shorthand

要求或禁止对静态 class 和 id 属性使用 `.class` / `#id` 简写。

✅ 在 `configs.recommended` 中启用（级别为 `warn`）。🔧 可用 `--fix` 修复。

## 规则详情 {#rule-details}

class 和 id 分别配置，各自可以是 `always`、`never` 或 `ignore`。

- `always`（两者的默认值）：静态的 `class` 或 `id` 属性会变成简写：
  `p(class="a b")` → `p.a.b`，`p(id="x")` → `p#x`。新的简写放在已有简写之后，
  变空的属性块会被删除。
- `never`：简写会变成一个属性。class 会并入已有的静态 `class` 属性；
  否则新属性会插入到第一个属性块的最前面（或一个新块中），
  使用该块中第一个字符串值的引号风格（没有时用 `"`）。既没有名称又没有简写的标签会得到 `div`。
- `ignore`：不检查那一类。

只转换静态属性：名称恰好是 `class` 或 `id`，值是一个普通的
`'…'` 或 `"…"` 字符串，并且其中每个以空白分隔的 token 都是合法的 Pug 简写名称。
只要有一个 token 不是（`md:flex`、`w-1/2`、`-1`、`1a`），整个值就不会被处理。`id`
值必须是单个 token。绑定属性（`:class`、`v-bind:id`）永远不会被改动。同时有 id 简写和 `id` 属性的标签
（这在 Pug 中是错误）会保持它的 id 不变。

同一个标签的所有转换由一个修复一次性应用，它附加在该标签的第一条报告上。

### 错误示例 {#incorrect}

```vue
<template lang="pug">
p(class="lead") Text
</template>
```

```vue
<template lang="pug">
section(id="intro" class="hero dark")
</template>
```

### 正确示例 {#correct}

```vue
<template lang="pug">
p.lead Text
</template>
```

```vue
<template lang="pug">
section#intro.hero.dark(class="md:flex w-1/2" :class="{ active }")
</template>
```

## 选项 {#options}

```js
'vue-pug/prefer-shorthand': ['warn', { class: 'always', id: 'always' }]
```

`class` 和 `id`：`'always'`（默认）、`'never'` 或 `'ignore'`。

### 使用 `[{ "class": "never", "id": "always" }]` 时的错误示例 {#incorrect-with-class-never-id-always}

```vue
<template lang="pug">
p.lead Text
</template>
```

### 使用 `[{ "class": "never", "id": "always" }]` 时的正确示例 {#correct-with-class-never-id-always}

```vue
<template lang="pug">
p#intro(class="lead") Text
</template>
```
