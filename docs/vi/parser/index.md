---
title: pug-lint-parser
description: "pug-lint-parser: một parser Pug cho các công cụ lint và format, với source range chính xác và khả năng phục hồi lỗi. Không bao giờ throw và không có dependency."
---

# pug-lint-parser

Một parser concrete syntax tree (CST) cho template Pug, xây dựng cho các công cụ lint và format.
Nó là parser đứng sau [`eslint-plugin-pug-vue`](https://github.com/HQCuong/pug-lint/tree/main/packages/eslint-plugin).

- **Không bao giờ throw.** Đầu vào không parse được trở thành một mục trong `errors`, và việc parse
  tiếp tục ở dòng kế tiếp.
- **Source range chính xác.** Mọi node, attribute, giá trị, shorthand, dấu phẩy và dòng đều có một
  range `[start, end)`: offset UTF-16 trong chuỗi bạn truyền vào, nên bạn có thể cắt nguồn hoặc dựng
  một edit tối thiểu mà không phải chỉnh vị trí.
- **Parse một đoạn tại chỗ.** `parsePug(text, { start, end })` chỉ parse `text[start, end)` (ví dụ
  nội dung của một block `<template lang="pug">`); các range vẫn tính theo toàn bộ `text`.
- **Giữ nguyên ký tự xuống dòng.** LF và CRLF đều được xử lý; `doc.eol` là ký tự xuống dòng đầu tiên
  tìm thấy.
- Không có runtime dependency. Chỉ ESM. Node.js `^20.19.0 || ^22.13.0 || >=24`.

## Cách dùng {#usage}

```js
import { parsePug, walk } from 'pug-lint-parser'

const text = 'ul#list\n  li.item(v-for="x in xs" :key="x") {{ x }}\n'
const doc = parsePug(text)

console.log(doc.errors) // []
walk(doc, (node) => {
  if (node.type === 'Tag') console.log(node.name?.value ?? 'div', text.slice(...node.range))
})
// ul ul#list
// li li.item(v-for="x in xs" :key="x") {{ x }}
```

## API {#api}

Tài liệu tham khảo đầy đủ, với mọi kiểu node, nằm trên site: [API](/vi/parser/api),
[cây cú pháp](/vi/parser/syntax-tree), [lỗi](/vi/parser/errors) và
[công thức](/vi/parser/recipes).

- `parsePug(text, options?)` → `PugDocument`. `options.start` / `options.end` giới hạn việc parse
  trong range đó của `text`.
- `walk(doc, visit)`: gọi `visit(node, parent)` cho mọi node theo thứ tự trong tài liệu, kể cả các
  tag bên trong tag interpolation (`#[…]`).
- `fingerprint(doc)` → `string`: một bản tóm tắt cấu trúc của cây (các tag và cách chúng lồng nhau,
  tập class và id, số lượng attribute, hình dạng của text và interpolation). Nó bỏ qua khoảng
  trắng, kiểu dấu nháy, thứ tự attribute, tên và giá trị attribute ngoài `class` và `id` tĩnh, kiểu
  chữ hoa/thường của tên tag, nội dung text và nội dung của code và phần đầu control, nên
  `p(class="a b")` và `p.a.b` có cùng fingerprint. Plugin ESLint so sánh fingerprint để từ chối các
  bản fix làm đổi cấu trúc của template.
- `literalSpans(text, range)` → các range của chuỗi và template literal trong một biểu thức
  JavaScript.
- Type cho mọi node: `PugDocument`, `PugNode`, `Tag`, `AttributeBlock`, `Attribute`,
  `AttributeValue`, `Text`, `Comment`, `Code`, `Control`, `MixinCall`, `Filter`, `PugLine`,
  `PugParseError` và nhiều hơn nữa (xem `src/ast.ts`).

Một `PugDocument` có `children` (cây), `errors` (`{ code, message, offset }`), `lines` (một mục cho
mỗi dòng nguồn, kèm range thụt lề, kind và độ sâu logic), `eol` và `indentUnit`.

## Cú pháp chưa hỗ trợ {#unsupported-syntax}

Một số dạng Pug được báo với mã lỗi `unsupported-syntax`, và một vài dạng được parse không báo lỗi
nhưng khác với Pug. Chúng được liệt kê trong
[docs/unsupported-syntax.md](https://github.com/HQCuong/pug-lint/blob/main/packages/pug-parser/docs/unsupported-syntax.md).

## Giấy phép {#license}

MIT
