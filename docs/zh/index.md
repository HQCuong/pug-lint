---
layout: home
title: 为 Vue 中的 Pug 模板提供的 ESLint 支持
description: 用 ESLint 对 Vue 单文件组件中的 Pug 模板进行 lint 和格式化。你的 vue/* rules 直接在 Pug 上运行，eslint --fix 负责格式化 Pug，每个修复都会经过检查，不会破坏模板。
# The hero and sections are written here, not with `hero`/`features` frontmatter, so the home
# page can hold the live --fix example. `markdownStyles: false` drops the .vp-doc wrapper; the
# sections opt back in with the vp-doc class where they render Markdown.
markdownStyles: false
---

<section class="pl-hero">
<div class="pl-hero-text">
<h1 class="home-heading">为 Vue 中的 Pug 模板提供的 ESLint 支持</h1>
<p class="pl-lead">让你的 <code>vue/*</code> rules 直接在 <code>&lt;template lang="pug"&gt;</code> 上运行，用 <code>eslint --fix</code> 格式化 Pug，并保证模板完好无损：每个修复在应用之前都会经过检查。</p>
<div class="pl-install vp-doc">

```sh
npm i -D eslint-plugin-pug-vue
```

</div>
<div class="pl-actions">
<a class="pl-button primary" href="/zh/guide/getting-started">快速开始</a>
<a class="pl-button" href="/zh/rules/">浏览 12 条规则</a>
</div>
</div>
<div class="pl-hero-demo">
<FixDemo />
</div>
</section>

<section class="pl-section vp-doc">
<div class="pl-row">
<div class="pl-row-text">

## 你的 `vue/*` rules，直接用在 Pug 上 {#your-vue-rules-on-pug}

eslint-plugin-vue 的 rules 以原有的名称和选项在 Pug 模板上运行：缺失的 key、
未使用的变量、属性顺序、已弃用的语法。少数无法在 Pug 上工作的 rules 会被
关闭，或只在 Pug 模板内部被屏蔽，因此它们仍会继续检查你的 HTML 模板。

[哪些 rules 会在 Pug 上运行](/zh/guide/vue-rules)

</div>
<div class="pl-row-code">

```vue
<template lang="pug">
ul
  li(v-for="todo in todos") {{ todo.title }}
</template>
```

```txt
3:3  error  Elements in iteration expect to have 'v-bind:key' directives  vue/require-v-for-key
```

</div>
</div>

<div class="pl-row">
<div class="pl-row-text">

## 用 `eslint --fix` 格式化 {#formatting-with-eslint-fix}

十二条小巧的 `vue-pug/*` rules 负责格式化 Pug 本身：缩进、属性块的间距、逗号、引号
和换行，以及 `.class` / `#id` 简写。每条 rule 都有选项，
也都可以关闭。不需要 Prettier，也不会有第二个格式化工具在保存时和 ESLint 打架。

[查看所有规则](/zh/rules/)

</div>
<div class="pl-row-code">

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

</div>
</div>

<div class="pl-row">
<div class="pl-row-text">

## 不会破坏模板的修复 {#fixes-that-cannot-break-a-template}

在 Pug 中，缩进就是结构：移动一行，树就会改变。所以在 ESLint 把修复写入 Pug 模板之前，
插件会先检查它，无论这个修复来自哪条 rule：

1. 它会解析应用了该修复之后的模板；
2. 它会把标签、嵌套关系、class、属性和每一个 JavaScript 表达式与原文比较；
3. 只有在没有任何变化时才应用修复。否则它会丢弃该修复并保留警告，让你手动修复那一行。

[fix guard 如何工作](/zh/guide/fix-guard)

</div>
<div class="pl-row-code">

```pug
//- the same template to the guard
p(class="intro lead") Hello
p.intro.lead Hello

//- a different one: a class is gone
p.intro Hello
```

<p class="pl-caption">因此 <code>vue-pug/prefer-shorthand</code> 可以把第一行改写成第二行，但丢失 class，或把某一行移到另一个父级下的修复，永远不会被应用。</p>

</div>
</div>
</section>

<section class="pl-section pl-start vp-doc">

## 两分钟上手 {#start-in-two-minutes}

它需要使用 flat config 的 ESLint 9.15 或 10、eslint-plugin-vue 10 和 vue-eslint-parser 10。
[快速开始](/zh/guide/getting-started)会带你完成安装、配置，以及在 VS Code 中设置保存时修复。
从 eslint-plugin-vue-pug 迁移过来？请阅读[迁移指南](/zh/guide/migration)。

</section>
