---
title: vue-pug/no-pug-control-flow
description: "vue-pug/no-pug-control-flow (eslint-plugin-pug-vue)：禁止 Pug 编译期结构（控制流、代码、mixin、#{} 插值、include）。选项和示例。"
---

# vue-pug/no-pug-control-flow

禁止 Pug 编译期结构（控制流、代码、mixin、`#{}` 插值、include）。

未在 `configs.recommended` 中启用。不可修复。

## 规则详情 {#rule-details}

Pug 的条件、循环、代码、mixin 和 `#{}` 插值只在模板编译时运行一次。Vue 看不到它们，所以它们不是响应式的，而且 `vue/*` rules 也看不到
Pug 自身的逻辑。这条 rule 会报告它们，让模板改用 Vue 指令和绑定。每种结构属于一个类别：

| 类别 | 报告的内容 |
|---|---|
| `control` | `if`、`else if`、`else`、`unless`、`each`、`for`、`while`、`case`、`when`、`default` |
| `code` | `- code`、`= expression`、`!= expression`、`p= expression` |
| `mixin` | mixin 定义（`mixin name`）和调用（`+name`） |
| `interpolation` | 文本中的 `#{…}` 和 `!{…}` |
| `include` | `include`、`extends`、`block`、`append`、`prepend`、`yield`、`doctype` |

### 错误示例 {#incorrect}

```vue
<template lang="pug">
ul
  each item in items
    li= item
</template>
```

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### 正确示例 {#correct}

```vue
<template lang="pug">
ul
  li(v-for="item in items" :key="item") {{ item }}
</template>
```

```vue
<template lang="pug">
p(v-if="name") Hello {{ name }}
</template>
```

## 选项 {#options}

```js
'vue-pug/no-pug-control-flow': ['warn', { allow: [] }]
```

`allow`：不报告的类别，可以是 `'control'`、`'code'`、`'mixin'`、
`'interpolation'`、`'include'` 中的任意几个（默认 `[]`）。

### 使用 `[{ "allow": ["interpolation"] }]` 时的正确示例 {#correct-with-allow-interpolation}

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### 使用 `[{ "allow": ["interpolation"] }]` 时的错误示例 {#incorrect-with-allow-interpolation}

```vue
<template lang="pug">
p= name
</template>
```

## 从 `eslint-plugin-vue-pug` 迁移 {#migrating-from-eslint-plugin-vue-pug}

`eslint-plugin-vue-pug` 中有一条 id 相同的 rule，`vue-pug/no-pug-control-flow`。差异如下：

- 它的 schema 为空：不接受任何选项，并且总是报告它所知道的每种结构。这条 rule
  接受 `{ allow: [...] }`（见上文）。你传给旧 rule 的任何选项都会被 ESLint 拒绝，
  所以没有选项的现有设置仍然有效。
- 旧 rule 由它的 `strongly-recommended` 配置启用（级别为 `warn`）。这条 rule 不在任何
  配置中：请自己启用。
