---
title: Hạn chế đã biết
description: "Các hạn chế đã biết của eslint-plugin-pug-vue: giá trị attribute nhiều dòng, shorthand, khác biệt AST so với template HTML, và chi phí của fix guard."
---

# Hạn chế đã biết

- **Giá trị attribute nhiều dòng cần backtick.** Xuống dòng bên trong giá trị `'…'` hoặc `"…"` là
  lỗi cú pháp Pug (chính Pug cũng không compile được), được báo qua `vue/no-parsing-error`.
  Khi template còn lỗi parse, không bản fix nào được áp dụng bên trong nó.
- **Shorthand không phải attribute đối với rule `vue/*`.** Shorthand `.class` và `#id` không được
  lộ ra như attribute, nên các rule như `vue/no-restricted-class` không thấy class viết bằng
  shorthand.
- **AST của Vue khác AST của template HTML** ở vài chỗ mà rule `vue/*` có thể nhận ra: mỗi dòng
  text dạng pipe (`| text`) là một text node riêng; text nằm ngay ở root của template không có
  text node; giá trị attribute dạng chuỗi được truyền nguyên dạng, nên dấu nháy escape bên trong
  một chuỗi directive (`:x="f(\"a\")"`) có thể gây ra lỗi parse Vue giả.
- **Giá trị attribute không có nháy và `${}`** (`a(href=url)`, ``a(title=`${x}`)``) là biểu thức
  compile-time của Pug, không phải Vue binding. Chúng được truyền cho rule `vue/*` như giá trị
  attribute thuần, và fix guard bỏ mọi bản fix viết lại chúng.
- **Giá trị bắt đầu bằng dấu nháy phải là một chuỗi duy nhất.** `a(title="x" + y)` là Pug hợp lệ
  nhưng bị báo là lỗi parse (`vue/no-parsing-error`), theo thiết kế: hãy viết `a(title=("x" + y))`
  hoặc `a(:title="'x' + y")`.
- **Ngắt dòng chỉ có CR.** Trong template mà các dòng kết thúc bằng một `\r` đơn (kiểu Mac cũ), các
  rule `vue-pug/*` báo vấn đề nhưng không fix, và tokenizer báo lỗi parse. Hãy chuyển file sang LF
  hoặc CRLF.
- **Một số cú pháp Pug bị parser báo là chưa hỗ trợ**, hoặc được parse khác với Pug:
  xem [Cú pháp Pug chưa hỗ trợ](./unsupported-syntax).
- **Chi phí của fix guard và tập fix áp dụng một phần:** xem [Fix guard](./fix-guard#cost).
