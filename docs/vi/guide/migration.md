---
title: Chuyển từ eslint-plugin-vue-pug
description: "Chuyển từ eslint-plugin-vue-pug sang eslint-plugin-pug-vue: gỡ cài đặt, flat config, và các rule đã thay đổi."
---

# Chuyển từ eslint-plugin-vue-pug

`eslint-plugin-vue-pug` tự đăng ký dưới cùng key `vue-pug`, nên hai plugin không thể dùng chung.

1. Gỡ `eslint-plugin-vue-pug` và `vue-eslint-parser-template-tokenizer-pug`, và xóa các mục
   `plugin:vue-pug/...` khỏi config của bạn. Plugin này cần flat config.
2. Cài và cấu hình plugin này như trong [Bắt đầu](./getting-started).
3. Thay các rule cũ:
   - `vue-pug/no-parsing-error` → `vue/no-parsing-error`, rule báo lỗi cú pháp Pug và được bật bởi
     mọi config của eslint-plugin-vue trừ `flat/base`.
   - `vue-pug/component-name-in-template-casing` → không có: `vue/component-name-in-template-casing`
     bị crash trên template Pug và bị tắt.
   - `vue-pug/no-pug-control-flow` giữ nguyên id, nhưng option khác: rule cũ không nhận option và
     được bật bởi các config `strongly-recommended` cũ; rule này nhận `{ allow: [...] }` và không
     nằm trong config nào. Xem
     [tài liệu của nó](/vi/rules/no-pug-control-flow#migrating-from-eslint-plugin-vue-pug).

Các config cũ tắt một số rule về bố cục ở mọi nơi (`vue/html-indent`, `vue/html-self-closing`, …).
Ở đây chúng vẫn bật cho template HTML và chỉ bị suppress bên trong template Pug (trừ
[các rule bị crash](./vue-rules)), còn các rule `vue-pug/*` thế chỗ chúng.
