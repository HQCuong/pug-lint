---
title: Lỗi
description: "Các mã lỗi của pug-lint-parser kèm ví dụ, cách parser phục hồi sau lỗi, và cách đổi một offset thành dòng và cột."
---

# Lỗi

`parsePug` không bao giờ throw. Những gì không parse được trở thành một mục trong `doc.errors`, và
phần còn lại của template vẫn được parse:

```ts
interface PugParseError {
  code: string     // one of the codes below
  message: string  // for people; may change between versions
  offset: number   // where the problem is, as an offset into text
}
```

Hãy so khớp theo `code`, không theo `message`. Để hiện dòng và cột, đếm từ offset:

```js
const before = text.slice(0, error.offset)
const line = before.split('\n').length                    // 1-based
const column = error.offset - before.lastIndexOf('\n')    // 1-based
```

## Phục hồi {#recovery}

Một lỗi không dừng việc parse. Parser bỏ qua đến hết construct hỏng, hoặc đến hết dòng, rồi tiếp
tục với dòng kế tiếp. Những dòng không thể xếp vào đâu sau một lỗi, như các dòng lồng dưới một
construct không thể có node con, được giữ trong `doc.lines` với kind `continuation`, và không có
node nào được dựng cho chúng.

```js
parsePug('div\n  p(class="a)\n  span ok\n  li(a=1 a=2)\n').errors
// [
//   { code: 'unterminated-string', message: 'Unterminated string', offset: 14 },
//   { code: 'duplicate-attribute', message: 'Duplicate attribute "a"', offset: 37 },
// ]
```

Plugin ESLint không áp dụng bản fix nào bên trong template có lỗi, vì nó không thể kiểm tra chúng.

## Các mã {#codes}

| `code` | Ví dụ | Message |
|---|---|---|
| `unterminated-string` | `p(title="hi) x` | Unterminated string |
| `unclosed-attributes` | `p(title="hi"` | Attribute block is not closed with ")" |
| `unclosed-arguments` | `+card(1, 2` | Mixin arguments are not closed with ")" |
| `missing-attribute-value` | `p(title=) x` | Expected a value after the operator |
| `duplicate-attribute` | `p(a="1" a="2")` | Duplicate attribute "a" |
| `unexpected-character` | `p(a!b) x` | Expected "=" after "!" |
| `unbalanced-key` | `p([a="1") x` | Unclosed "[" in an attribute key |
| `bad-escape` | `p(a="\x")` | Invalid escape sequence in a JavaScript string |
| `inconsistent-indentation` | một dòng thụt lề bằng tab giữa các dòng thụt lề bằng space | Invalid indentation, you can use tabs or spaces but not both |
| `unterminated-interpolation` | `p Hi #{name` | Interpolation is not closed with "}" |
| `unsupported-syntax` | `#{tag} x` | Unsupported syntax: "#{tag} x" |

Mỗi mã bao trùm một nhóm vấn đề; `unexpected-character`, `unbalanced-key`,
`inconsistent-indentation` và `unsupported-syntax` có nhiều message.

Chúng khớp với những gì trình biên dịch Pug từ chối, với một khác biệt có chủ ý: xuống dòng bên
trong giá trị attribute `'…'` hoặc `"…"` là `unterminated-string`, như trong JavaScript. Hãy dùng
backtick cho giá trị nhiều dòng.

## `unsupported-syntax` {#unsupported-syntax}

Mã này đánh dấu Pug hợp lệ mà parser không xử lý, như tên tag có interpolation (`#{tag}`) hoặc text
block không có tag. Một vài dạng cũng được parse không báo lỗi nhưng khác với Pug. Cả hai danh sách
nằm trong [Cú pháp Pug chưa hỗ trợ](/vi/guide/unsupported-syntax).
