---
layout: home
title: ESLint cho template Pug trong Vue
description: "Lint và format template Pug trong Vue single-file component bằng ESLint. Các rule vue/* chạy được trên Pug, eslint --fix format lại Pug, và mọi bản fix đều được kiểm tra để không làm hỏng template."
# The hero and sections are written here, not with `hero`/`features` frontmatter, so the home
# page can hold the live --fix example. `markdownStyles: false` drops the .vp-doc wrapper; the
# sections opt back in with the vp-doc class where they render Markdown.
markdownStyles: false
---

<section class="pl-hero">
<div class="pl-hero-text">
<h1 class="home-heading">ESLint cho template Pug trong Vue</h1>
<p class="pl-lead">Chạy các rule <code>vue/*</code> của bạn trên <code>&lt;template lang="pug"&gt;</code>, format Pug bằng <code>eslint --fix</code>, và giữ nguyên mọi template: mỗi bản fix đều được kiểm tra trước khi áp dụng.</p>
<div class="pl-install vp-doc">

```sh
npm i -D eslint-plugin-pug-vue
```

</div>
<div class="pl-actions">
<a class="pl-button primary" href="/vi/guide/getting-started">Bắt đầu</a>
<a class="pl-button" href="/vi/rules/">Xem 12 rule</a>
</div>
</div>
<div class="pl-hero-demo">
<FixDemo />
</div>
</section>

<section class="pl-section vp-doc">
<div class="pl-row">
<div class="pl-row-text">

## Rule `vue/*` của bạn, trên Pug {#your-vue-rules-on-pug}

Các rule của eslint-plugin-vue chạy trên template Pug với tên và option quen thuộc: thiếu key,
biến không dùng, thứ tự attribute, cú pháp deprecated. Vài rule không thể hoạt động trên Pug thì
bị tắt, hoặc chỉ bị im lặng bên trong template Pug, nên chúng vẫn kiểm tra các template HTML của
bạn.

[Những rule nào chạy trên Pug](/vi/guide/vue-rules)

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

## Format bằng `eslint --fix` {#formatting-with-eslint-fix}

Mười hai rule `vue-pug/*` nhỏ format chính phần Pug: thụt lề, khoảng trắng, dấu phẩy, dấu nháy
và ngắt dòng của attribute block, cùng shorthand `.class` / `#id`. Mỗi rule có option riêng,
và bạn có thể tắt bất kỳ rule nào. Không Prettier, và không có formatter thứ hai tranh với ESLint
khi lưu file.

[Xem mọi rule](/vi/rules/)

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

## Bản fix không thể làm hỏng template {#fixes-that-cannot-break-a-template}

Trong Pug, thụt lề là cấu trúc: dời một dòng là cây đổi theo. Vì vậy trước khi ESLint ghi một bản
fix vào template Pug, plugin kiểm tra nó, bất kể bản fix đến từ rule nào:

1. nó parse template với bản fix đã áp dụng;
2. nó so sánh các tag, cách chúng lồng nhau, class, attribute và mọi biểu thức JavaScript với bản gốc;
3. nó chỉ áp dụng bản fix nếu không có gì thay đổi. Nếu không, nó bỏ bản fix và giữ cảnh báo, để bạn tự sửa dòng đó bằng tay.

[Cách fix guard hoạt động](/vi/guide/fix-guard)

</div>
<div class="pl-row-code">

```pug
//- the same template to the guard
p(class="intro lead") Hello
p.intro.lead Hello

//- a different one: a class is gone
p.intro Hello
```

<p class="pl-caption">Vì vậy <code>vue-pug/prefer-shorthand</code> có thể viết lại dòng đầu thành dòng thứ hai, nhưng một bản fix làm mất class, hoặc chuyển một dòng sang node cha khác, sẽ không bao giờ được áp dụng.</p>

</div>
</div>
</section>

<section class="pl-section pl-start vp-doc">

## Bắt đầu trong hai phút {#start-in-two-minutes}

Cần ESLint 9.15 hoặc 10 với flat config, eslint-plugin-vue 10 và vue-eslint-parser 10.
[Bắt đầu](/vi/guide/getting-started) hướng dẫn từ cài đặt, config đến fix-on-save trong VS Code.
Đang dùng eslint-plugin-vue-pug? Đọc [hướng dẫn chuyển đổi](/vi/guide/migration).

</section>
