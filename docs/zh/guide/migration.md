---
title: 从 eslint-plugin-vue-pug 迁移
description: "从 eslint-plugin-vue-pug 迁移到 eslint-plugin-pug-vue：卸载、flat config，以及发生变化的 rules。"
---

# 从 eslint-plugin-vue-pug 迁移

`eslint-plugin-vue-pug` 把自己注册在同一个 `vue-pug` key 下，所以这两个插件不能同时使用。

1. 卸载 `eslint-plugin-vue-pug` 和 `vue-eslint-parser-template-tokenizer-pug`，并从配置中移除
   `plugin:vue-pug/...` 条目。本插件需要 flat config。
2. 按[快速开始](./getting-started)安装并配置本插件。
3. 替换旧的 rules：
   - `vue-pug/no-parsing-error` → `vue/no-parsing-error`，它会报告 Pug 语法错误，
     除 `flat/base` 外的每个 eslint-plugin-vue 配置都会启用它。
   - `vue-pug/component-name-in-template-casing` → 无替代：`vue/component-name-in-template-casing`
     会在 Pug 模板上崩溃，已被关闭。
   - `vue-pug/no-pug-control-flow` 保留了原来的 id，但选项不同：旧的 rule 不接受
     任何选项，并由旧的 `strongly-recommended` 配置启用；这条则接受
     `{ allow: [...] }`，且不在任何配置中。参见
     [它的文档](/zh/rules/no-pug-control-flow#migrating-from-eslint-plugin-vue-pug)。

旧的配置会在所有地方关闭一些布局类 rules（`vue/html-indent`、
`vue/html-self-closing` 等）。在这里，它们对 HTML 模板仍然保持开启，只在 Pug
模板内部被屏蔽（[会崩溃的那几条](./vue-rules)除外），并由 `vue-pug/*` rules 取而代之。
