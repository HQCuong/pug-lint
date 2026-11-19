---
title: Cú pháp Pug chưa hỗ trợ
description: "Các dạng Pug mà pug-lint-parser báo là chưa hỗ trợ hoặc parse khác với trình biên dịch Pug, và cách viết lại chúng."
---

# Cú pháp được báo là `unsupported-syntax`

Parser không bao giờ throw. Đầu vào mà nó không mô hình hóa sẽ trở thành một lỗi `unsupported-syntax`
tại offset đầu tiên nó không đọc được, và phần còn lại của dòng đó bị bỏ qua.
File này liệt kê mọi nguồn đã biết của lỗi đó. Bất kỳ trường hợp nào khác sinh ra
`unsupported-syntax` đều là bug.

"Invalid Pug" đánh dấu các dạng mà chính Pug từ chối; chúng được liệt kê vì
parser cũng báo chúng bằng mã này.

## Các dòng {#lines}

| Dạng | Ví dụ | Ghi chú |
| --- | --- | --- |
| Tên tag có interpolation | `#{tag} text`, `#{tag}/` | |
| Tên mixin có interpolation | `+#{name}()` | `+ name` (có khoảng trắng sau `+`) là một lời gọi mixin. |
| Text block không có tag | một dòng chỉ có `.`, với các dòng text lồng bên dưới | Pug đặt text vào node cha. Hãy dùng các dòng `\|`. |
| Tag interpolation hoặc mustache ở đầu dòng | `#[b x] y`, `{{ x }}` | Dùng `\| #[b x] y` / `\| {{ x }}`. |
| Mọi thứ khác không mở đầu một construct của Pug | `)`, `@x`, `.5` | |
| Các dòng lồng dưới text dạng pipe | `\| a` với một `p` thụt lề bên dưới | Invalid Pug. Báo một lần, tại dòng lồng đầu tiên; các dòng lồng bị bỏ qua và tạo thành một vùng error-recovery (`doc.lines` kind `continuation`). Các dòng lồng dưới HTML nguyên văn (`<ul>`) là hợp lệ: Pug coi chúng là anh em, và parser cũng vậy. |
| Các dòng lồng dưới buffered code | `= x` hoặc `!= x` với một `p` thụt lề bên dưới | Invalid Pug. Được báo và recover như với text dạng pipe. Dưới `p= x` các dòng là con của `p`, như trong Pug. |

## Sau phần đầu của tag hoặc lời gọi mixin {#after-a-tag-or-mixin-call-head}

| Dạng | Ví dụ | Ghi chú |
| --- | --- | --- |
| Unbuffered code sau một tag | `p- x` | |
| `.` theo sau là thêm nội dung trên dòng | `p. text`, `p.: a` | Invalid Pug. |
| Text block sau lời gọi mixin | `+m.` | |
| Block expansion sau lời gọi mixin | `+m: p` | `MixinCall` không có trường `expansion`. Khi nó là node con thì được: `li: +m`. |
| `/` sau lời gọi mixin | `+m/` | |
| Block expansion sau `/` | `img/: x` | Invalid Pug. |
| `:` không theo sau bởi một khoảng trắng và một node con | `li:`, `li(x):b`, `when 1:` | Invalid Pug. |
| Node con của expansion không phải tag hoặc lời gọi mixin | `li: \| x`, `li: <b>x</b>`, `li: = x`, `li: // c`, `li: if x`, `when 1: each x in y` | Từ khóa control không bao giờ được đọc như tên tag ở đây. |
| Tag theo sau bởi một inline filter | `p: :markdown text` | |

## Phần đầu của control {#control-heads}

| Dạng | Ví dụ | Ghi chú |
| --- | --- | --- |
| Block expansion sau một conditional hoặc vòng lặp | `else: p`, `else : p`, `if x: p`, `unless x: p`, `else if x: p`, `while x: p`, `case x: p`, `each a in b: p`, `for a in b: p` | Invalid Pug. Báo tại dấu `:` đầu tiên của phần đầu nằm ngoài chuỗi và ngoặc và không đóng một `?` cấp cao nhất (nên `if a ? b : c` và `each v in {a: 1}` vẫn ổn). Expansion hoạt động sau `when` và `default`: `when 1: p a`. |

## Filter {#filters}

| Dạng | Ví dụ | Ghi chú |
| --- | --- | --- |
| Bất cứ thứ gì ngoài text sau phần đầu của filter | `:a(x):b`, `:md.x` | Filter lồng nhau chỉ được đọc dưới dạng `:a:b(attrs)`, với attribute đặt sau tên cuối cùng. |

## Tag interpolation `#[…]` {#tag-interpolation}

| Dạng | Ví dụ | Ghi chú |
| --- | --- | --- |
| Không bắt đầu bằng tag | `#[+m]`, `#[\| x]`, `#[- x]`, `#[:cdata x]` | Lời gọi mixin, text, code và filter không được đọc bên trong `#[…]`. |
| Phần đầu theo sau bởi thứ gì ngoài text, code `=`/`!=` hoặc `: child` | `#[p.]`, `#[p- x]`, `#[img/: x]` | |

## Parse không báo lỗi, nhưng không giống Pug {#parsed-without-an-error-but-not-as-pug-does}

Tìm thấy nhờ differential oracle (`tests/oracle`, Task 17).

| Dạng | Ví dụ | Ghi chú |
| --- | --- | --- |
| Comment sau tên block | `block content // c` | Pug kết thúc tên ở `//` và biến phần còn lại thành một comment anh em, comment đó cũng nhận các dòng lồng bên dưới. Parser giữ nó trong phần đầu của `block`. |
| Attribute hoặc id trùng lặp | `a(x=1 x=2)`, `#a#b` | Pug từ chối chúng; parser chấp nhận. |
| `else` rỗng sau `each` | `each x in y` … `else` không có gì lồng bên trong | Pug từ chối; parser chấp nhận. |
