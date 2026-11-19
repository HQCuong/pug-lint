---
title: Pug 上的 vue/* rules
description: "哪些 eslint-plugin-vue rules 会在 Pug 模板上运行，哪些因为会崩溃而被关闭，哪些只在 Pug 模板内部被屏蔽。"
---

# Pug 上的 `vue/*` rules {#vue-rules-on-pug}

大多数 eslint-plugin-vue rules 在 Pug 模板上的表现和在 HTML 上一样。其余的由一个兼容性测试工具测量，它会在 Pug 模板及其 HTML 等价版本上运行每一条 rule；完整
结果见[兼容性表](./vue-compatibility)。

## 会崩溃的 rules：全局关闭 {#crashing-rules-off-everywhere}

在 Pug 模板上会**崩溃**的 rules 会被 `configs.base` 关闭。Pug 元素没有写出来的
结束标签，所以它的结束标签宽度为零，这会破坏这些 rules 对 vue-eslint-parser 的 token
store 的使用。

崩溃无法事后过滤，而且配置只能选择文件，不能选择模板，所以它们对**每个** `.vue` 文件都是关闭的，
HTML 模板也包括在内。在同时混用 HTML 和 Pug
模板的项目中，这些 rules 也不再检查 HTML 模板。对应的 `vue-pug/*` 替代 rules
覆盖 Pug 模板。

## 被屏蔽的 rules：只在 Pug 内部静默 {#suppressed-rules-silenced-inside-pug-only}

在 Pug 上**误报**，或者**修复会破坏或重新格式化** Pug 的 rules，不会被关闭。
processor 只会在它们的消息位于 Pug 模板内部时才丢弃，所以它们在
HTML 模板和 `<script>` 中仍然有效。如果你仍想保留其中某条，请参阅
[保留被屏蔽的 rule](./configuration#keeping-a-suppressed-rule)。

## 列表 {#the-lists}

<!-- begin auto-generated vue rule lists -->

Turned off for every `.vue` file by `configs.base`, because they crash on Pug templates:

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

Suppressed inside Pug templates only (they keep working on HTML templates and in `<script>`):

- `vue/array-bracket-newline`
- `vue/array-element-newline`
- `vue/brace-style`
- `vue/first-attribute-linebreak` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-comment-content-newline`
- `vue/html-comment-content-spacing`
- `vue/html-end-tags` (Pug replacement: `vue-pug/self-closing`)
- `vue/html-quotes` (Pug replacement: `vue-pug/attribute-quotes`)
- `vue/html-self-closing` (Pug replacement: `vue-pug/self-closing`)
- `vue/max-attributes-per-line` (Pug replacement: `vue-pug/max-attributes-per-line`)
- `vue/multiline-html-element-content-newline`
- `vue/multiline-ternary`
- `vue/no-multi-spaces` (Pug replacement: `vue-pug/no-multi-spaces`)
- `vue/no-spaces-around-equal-signs-in-attribute` (Pug replacement: `vue-pug/attribute-equals-spacing`)
- `vue/no-unsupported-features`
- `vue/object-curly-newline`
- `vue/object-property-newline`
- `vue/padding-line-between-tags`
- `vue/singleline-html-element-content-newline`
- `vue/static-class-names-order`
- `vue/v-if-else-key`

<!-- end auto-generated vue rule lists -->
