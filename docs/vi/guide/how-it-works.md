---
title: Cách hoạt động
description: "Cách eslint-plugin-pug-vue lint Pug trong Vue: một tokenizer Pug cho vue-eslint-parser, các rule vue/* và vue-pug/*, và một fix guard kiểm tra mọi bản fix."
---

# Cách hoạt động

ESLint tự nó không đọc được Pug, còn eslint-plugin-vue chỉ biết template HTML. Plugin nối hai bên
lại với nhau, rồi kiểm tra mọi bản fix trước khi ESLint ghi.

<HowItWorks />

## 1. Parse {#_1-parse}

[vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser) parse file `.vue` cho
eslint-plugin-vue. Với template viết bằng ngôn ngữ khác, nó nhờ một *tokenizer* biến ngôn ngữ đó
thành các token mà nó sẽ nhận được từ HTML. Plugin đăng ký một tokenizer cho `lang="pug"` và
`lang="jade"`.

Tokenizer parse template bằng [`pug-lint-parser`](/vi/parser/), rồi phát ra token thẻ mở, thẻ đóng,
text và `{{ }}` cho mỗi element Pug, tại đúng vị trí trong mã nguồn Pug. vue-eslint-parser dựng AST
template quen thuộc của nó từ các token đó, nên các rule `vue/*` chỉ đúng dòng và cột trong Pug của
bạn.

Một lỗi cú pháp Pug trở thành lỗi parse mà `vue/no-parsing-error` báo.

## 2. Lint {#_2-lint}

Hai loại rule chạy trên cùng một file:

- **Rule `vue/*`** của eslint-plugin-vue đọc AST template của Vue, như trên một template HTML:
  thiếu key, biến không dùng, thứ tự attribute, cú pháp deprecated.
- **Rule `vue-pug/*`** đọc trực tiếp cây cú pháp Pug từ `pug-lint-parser`. Cây đó giữ lại những gì
  AST của Vue làm mất: thụt lề, dấu phẩy, dấu nháy, dấu ngoặc, shorthand `.class` và `#id`. Đây là
  nơi các rule format làm việc.

## 3. Kiểm tra {#_3-check}

Plugin bao quanh processor của eslint-plugin-vue, thứ nhìn thấy mọi message trước khi ESLint dùng:

- **Suppress.** Một vài rule `vue/*` không thể hoạt động trên Pug: chúng báo sai, hoặc bản fix của
  chúng sẽ ghi HTML vào template Pug. Message của chúng bị bỏ khi nằm bên trong template Pug, và
  chỉ ở đó, nên chúng vẫn kiểm tra các template HTML của bạn. Những rule crash trên Pug thì bị tắt.
  [Các danh sách](./vue-rules).
- **Fix guard.** Mọi bản fix đụng đến template Pug được áp lên một bản sao của file, rồi
  `pug-lint-parser` parse lại bản sao đó. Plugin so sánh cấu trúc trước và sau: các tag và cách
  chúng lồng nhau, class và id, số lượng attribute, hình dạng của text và mọi biểu thức JavaScript.
  Nếu có gì đổi, hoặc bản sao không parse được nữa, bản fix bị bỏ và cảnh báo của nó vẫn còn.
  [Chi tiết](./fix-guard).

Sau đó ESLint áp dụng các bản fix còn lại, bằng `eslint --fix` hoặc fix-on-save của editor.

## Hai package {#the-two-packages}

| Package | Vai trò |
|---|---|
| [`eslint-plugin-pug-vue`](https://www.npmjs.com/package/eslint-plugin-pug-vue) | Plugin ESLint: tokenizer, các rule `vue-pug/*`, processor và các config. Là package bạn cài. |
| [`pug-lint-parser`](/vi/parser/) | Parser Pug mà mọi thứ ở trên được xây dựng trên đó. Nó không biết gì về ESLint hay Vue, và bạn có thể dùng riêng nó. |
