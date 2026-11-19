---
title: API
description: "Tài liệu tham khảo API của pug-lint-parser: parsePug và các option của nó, walk, fingerprint, literalSpans và các type được export."
---

# API

```js
import { parsePug, walk, fingerprint, literalSpans } from 'pug-lint-parser'
```

Package chỉ có ESM, không có dependency, và đi kèm type TypeScript: mọi type node bên dưới đều
được export (`import type { Tag, PugDocument } from 'pug-lint-parser'`).

**Mọi vị trí là một offset trong `text` bạn đã truyền vào**: một chỉ số UTF-16, cùng đơn vị với
`String.prototype.slice`. Một `Range` là `[start, end)`, nên `text.slice(...range)` trả về mã nguồn
của một node, và `text.slice(0, start) + replacement + text.slice(end)` sửa nó.

## `parsePug(text, options?)` {#parsepug-text-options}

```ts
function parsePug(text: string, options?: ParseOptions): PugDocument

interface ParseOptions {
  start?: number // default 0
  end?: number   // default text.length
}
```

Parse `text[start, end)` và trả về [document](./syntax-tree#pugdocument). Nó không bao giờ throw:
những gì không parse được trở thành một mục trong `doc.errors`, và việc parse tiếp tục ở dòng kế
tiếp (xem [Lỗi](./errors)).

`start` và `end` cho phép bạn parse một phần của file lớn hơn mà không cần sao chép nó, ví dụ nội
dung của một block `<template lang="pug">` trong file `.vue`. Các range vẫn tính theo toàn bộ
`text`:

```js
const sfc = '<template lang="pug">\ndiv\n  p Hi\n</template>\n'
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

doc.range                 // [21, 33]
doc.children[0].name      // { value: 'div', range: [22, 25] }
```

Khi mọi dòng của đoạn được thụt lề cùng một lượng, như trong template thụt lề dưới `<template>`,
phần thụt lề chung đó là gốc: parser coi nó là cột 0, như Vue làm trước khi compile template. Chính
Pug từ chối một file `.pug` bị thụt lề, nên ở đây parser dễ tính hơn trình biên dịch Pug.

Ký tự xuống dòng có thể là LF hoặc CRLF; một CR đơn cũng được đọc là ngắt dòng. BOM ở đầu không bị
cắt: hãy truyền `start: 1` để bỏ qua nó.

## `walk(doc, visit)` {#walk-doc-visit}

```ts
function walk(
  doc: PugDocument,
  visit: (node: PugNode, parent: PugNode | PugDocument) => void,
): void
```

Gọi `visit` cho mọi node theo thứ tự trong tài liệu (pre-order: node đứng trước các node con của
nó). Nó đi vào `children` và vào tag của mỗi [tag interpolation](./syntax-tree#text) `#[…]`, có
node cha là node `Text` bao quanh.

```js
walk(parsePug('if ok\n  p a\nelse\n  +card(1)\n- const x = 1\n//- note\n'), (node, parent) => {
  console.log(node.type, '<', parent.type)
})
// Control < Document     (if)
// Tag < Control
// Text < Tag
// Control < Document     (else)
// MixinCall < Control
// Code < Document
// Comment < Document
```

## `fingerprint(doc)` {#fingerprint-doc}

```ts
function fingerprint(doc: PugDocument): string
```

Một chuỗi tóm tắt **cấu trúc** của template: hai template có cùng fingerprint sẽ render ra cùng một
cây element. Plugin ESLint so sánh fingerprint để từ chối các bản fix làm thay đổi template.

Những gì nó bao gồm:

- các tag, lời gọi mixin, text, comment, code và control block, và cách chúng lồng nhau;
- tập class và id tĩnh của mỗi tag, **dù viết dưới dạng nào**: `p(class="a b")` và `p.a.b` có cùng
  fingerprint, còn `p.a` thì không;
- số lượng các attribute khác, và loại của mỗi giá trị (không có hoặc chuỗi, biểu thức, template
  với `${}`);
- mọi đoạn JavaScript mà Pug compile, theo nội dung của nó không tính thụt lề: giá trị attribute
  dạng biểu thức và `${}`, `&attributes(…)`, đối số mixin, code, phần đầu control và `#{…}`;
- hình dạng của text: nơi nó được tách thành các dòng và interpolation.

Những gì nó bỏ qua: khoảng trắng và độ rộng thụt lề, dấu nháy, dấu phẩy, thứ tự và tên attribute,
giá trị attribute dạng chuỗi ngoài `class` và `id`, kiểu chữ hoa/thường của tên tag, nội dung text,
dấu `/` của tag tự đóng và dấu `:` của block expansion.

```js
fingerprint(parsePug('p(class="a b") Hi')) === fingerprint(parsePug('p.a.b Hi'))  // true
fingerprint(parsePug('p.a Hi')) === fingerprint(parsePug('p.a.b Hi'))             // false
```

Định dạng của chuỗi không thuộc API: hãy so sánh fingerprint, đừng parse chúng.

## `literalSpans(text, range)` {#literalspans-text-range}

```ts
function literalSpans(text: string, range: [number, number]): [number, number][]
```

Các range của string literal (`'…'`, `"…"`) và template literal (`` `…` ``) bên trong một biểu thức
JavaScript tại `text[range]`. Dùng nó để phân biệt code với nội dung chuỗi, ví dụ để tránh thụt lề
lại phần bên trong một template literal nhiều dòng. Một literal không kết thúc sẽ chạy đến hết
`range`.

```js
const e = 'f("a", `b ${c}`, d)'
literalSpans(e, [0, e.length])              // [[2, 5], [7, 15]]
                                            // '"a"' and '`b ${c}`'
```

## Type {#types}

| Type | Nó là gì |
|---|---|
| `Range` | `[start: number, end: number]`, offset trong `text` |
| `PugDocument` | Kết quả của `parsePug`: [cây, dòng và lỗi](./syntax-tree#pugdocument) |
| `PugNode` | `Tag \| MixinCall \| Text \| Comment \| Code \| Control \| Filter` |
| `Tag`, `MixinCall`, `Text`, `Comment`, `Code`, `Control`, `Filter` | [Các node](./syntax-tree#nodes) |
| `AttributeBlock`, `Attribute`, `AttributeValue` | [Attribute](./syntax-tree#attributes) |
| `TextPart` | `Raw`, `Interpolation` hoặc `TagInterpolation` bên trong một `Text` |
| `ControlKeyword` | Từ khóa của một node `Control` |
| `PugLine` | [Một dòng nguồn](./syntax-tree#lines) |
| `PugParseError` | [`{ code, message, offset }`](./errors) |
| `ParseOptions` | `{ start?, end? }` |
