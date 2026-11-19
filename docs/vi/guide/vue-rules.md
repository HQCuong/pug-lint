---
title: Rule vue/* trên Pug
description: "Những rule eslint-plugin-vue nào chạy trên template Pug, rule nào bị tắt vì crash, và rule nào chỉ bị suppress bên trong template Pug."
---

# Rule `vue/*` trên Pug

Hầu hết rule eslint-plugin-vue chạy trên template Pug như trên HTML. Phần còn lại được đo bằng một
harness tương thích, chạy mọi rule trên template Pug và trên bản HTML tương đương; kết quả đầy đủ
nằm trong [bảng tương thích](./vue-compatibility).

## Rule bị crash: tắt ở mọi nơi {#crashing-rules-off-everywhere}

Các rule **crash** trên template Pug bị `configs.base` tắt. Một element Pug không có thẻ đóng viết
ra, nên thẻ đóng của nó có độ rộng bằng không, điều này làm hỏng cách các rule đó dùng token store
của vue-eslint-parser.

Một lần crash không thể lọc sau đó, và một config chỉ chọn được file chứ không chọn được template,
nên các rule này bị tắt cho **mọi** file `.vue`, kể cả template HTML. Trong dự án trộn template
HTML và Pug, các rule này cũng không còn kiểm tra template HTML. Các rule `vue-pug/*` thay thế lo
phần template Pug.

## Rule bị suppress: chỉ im lặng bên trong Pug {#suppressed-rules-silenced-inside-pug-only}

Các rule **báo sai** trên Pug, hoặc có **bản fix làm hỏng hay format lại** Pug, không bị tắt.
Processor chỉ bỏ message của chúng khi chúng nằm bên trong một template Pug, nên chúng vẫn hoạt
động trên template HTML và trong `<script>`. Để vẫn giữ một rule, xem
[Giữ lại một rule bị suppress](./configuration#keeping-a-suppressed-rule).

## Các danh sách {#the-lists}

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
