---
title: Cây cú pháp
description: "Cây cú pháp cụ thể của pug-lint-parser: mọi loại node, attribute và giá trị của chúng, các phần của text, và thông tin theo từng dòng mà formatter cần."
---

# Cây cú pháp

`parsePug` trả về một cây cú pháp **cụ thể** (concrete): ngoài ý nghĩa của template, nó còn giữ
cách template được viết. Mọi shorthand, dấu ngoặc, dấu phẩy, dấu nháy và dòng đều có một
[range](./api), nên một công cụ có thể chỉ vào bất kỳ thứ nào trong số đó, hoặc viết lại một thứ
mà không đụng đến phần còn lại.

## `PugDocument` {#pugdocument}

```ts
interface PugDocument {
  type: 'Document'
  text: string             // the text passed to parsePug
  range: Range             // [start, end) that was parsed
  children: PugNode[]      // the top-level nodes
  errors: PugParseError[]  // see Errors
  lines: PugLine[]         // one entry per source line, see Lines
  eol: '\n' | '\r\n'       // the first line ending found; '\n' if there is none
  indentUnit: string       // the indentation of the first nested line, relative to its parent; '  ' if none
}
```

`eol` và `indentUnit` cho formatter biết file đang dùng ký tự xuống dòng và kiểu thụt lề nào.

## Node {#nodes}

```ts
type PugNode = Tag | MixinCall | Text | Comment | Code | Control | Filter
```

`range` của một node bao trùm **dòng của chính nó**, không gồm các dòng lồng bên dưới; những dòng
đó nằm trong `children`. Các node nhận dòng lồng là `Tag`, `MixinCall`, `Code` và `Control`.

### `Tag` {#tag}

`a.btn#go(href="/x" :title="t") Go` được parse thành:

```js
{
  type: 'Tag',
  range: [0, 33],                                   // the whole head line
  name: { value: 'a', range: [0, 1] },              // null for an implicit div: .card
  shorthands: [
    { kind: 'class', value: 'btn', range: [1, 5] }, // range includes the '.'
    { kind: 'id', value: 'go', range: [5, 8] },     // and the '#'
  ],
  attributeBlocks: [{ range: [8, 30], attributes: [/* see Attributes */], commas: [] }],
  andAttributes: [],                                // &attributes(obj): { range, expression }
  selfClose: null,                                  // the '/' of img/
  dot: null,                                        // the '.' of p. (text block)
  expansion: null,                                  // the ':' of li: a
  children: [{ type: 'Text', form: 'inline', range: [31, 33], content: [31, 33], parts: [/* … */] }],
}
```

Text inline (`p Hi`), buffered code (`p= msg`), node con của block expansion (`li: a`) và các dòng
lồng bên dưới đều nằm trong `children`.

### `MixinCall` {#mixincall}

`+card(title, 2).wide(x="1")`: giống tag, với `name` (`card`, không có `+`) và `args`, range của
các đối số kèm dấu ngoặc, `(title, 2)` (`null` nếu không có). Nó có `shorthands`,
`attributeBlocks`, `andAttributes` và `children` như tag.

### `Text` {#text}

```ts
interface Text {
  type: 'Text'
  form: 'inline' | 'pipe' | 'block' | 'html'
  range: Range
  content: Range       // the text itself, after `| ` or the tag
  parts: TextPart[]
}
```

| `form` | Nguồn |
|---|---|
| `inline` | `p Hello` (text sau tag trên cùng dòng) |
| `pipe` | `\| Hello` (một node cho mỗi dòng) |
| `block` | các dòng dưới `p.`, `script.`, … |
| `html` | một dòng HTML nguyên văn, `<b>Hello</b>` |

`parts` tách text thành text thô và các interpolation. Với `p Hello #{name}, #[b bold] and {{ x }}`:

| Phần | Nguồn |
|---|---|
| `{ type: 'Raw' }` | `Hello ` |
| `{ type: 'Interpolation', escaped, expression }` | `#{name}` (`!{…}` có `escaped: false`) |
| `{ type: 'Raw' }` | `, ` |
| `{ type: 'TagInterpolation', tag }` | `#[b bold]`, với `tag` là một node `Tag` đầy đủ |
| `{ type: 'Raw' }` | ` and {{ x }}` |

`{{ }}` không bị tách: nó thuộc về Vue, và nằm lại trong text thô.

### `Comment`, `Code`, `Control`, `Filter` {#comment-code-control-filter}

| Node | Nguồn | Trường |
|---|---|---|
| `Comment` | `// shown`, `//- hidden`, và các dòng lồng bên dưới chúng | `buffered` (`//` có, `//-` không), `content` |
| `Code` | `- const x = 1`, `= value`, `!= html`, và `p= value` như node con của tag | `buffered`, `escaped`, `expression`, `children` |
| `Control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default`, `mixin`, `block`, `append`, `prepend`, `include`, `extends`, `doctype`, `yield` | `keyword`, `head` (phần còn lại của dòng), `children` |
| `Filter` | `:markdown-it`, và các dòng text của nó | `name`, `attributeBlocks`, `children` (các node `Text`) |

## Attribute {#attributes}

```ts
interface AttributeBlock {
  range: Range        // includes '(' and ')'
  attributes: Attribute[]
  commas: Range[]     // the commas between attributes, if any
}

interface Attribute {
  range: Range
  key: { raw: string; range: Range }                  // href, :title, @click, v-model.trim
  operator: { value: '=' | '!='; range: Range } | null // null for a boolean attribute: disabled
  value: AttributeValue | null
}

interface AttributeValue {
  range: Range
  raw: string
  kind: 'string' | 'template' | 'expression'
  quote: '"' | "'" | '`' | null
  inner: Range | null       // between the quotes; null for an expression
  hasSubstitution: boolean  // a template literal with ${…}
}
```

Một tag có thể có nhiều hơn một block (`a(x)(y)` là Pug hợp lệ), nên `attributeBlocks` là một
danh sách; thường nó rỗng hoặc có một mục.

| `kind` | Khi nào | Ví dụ |
|---|---|---|
| `string` | **toàn bộ** giá trị là một literal `'…'` hoặc `"…"` | `href="/x"` |
| `template` | toàn bộ giá trị là một literal `` `…` `` | ``title=`Hi ${name}` `` |
| `expression` | mọi trường hợp khác: Pug compile nó như JavaScript | `href=url`, `title="a" + b` |

Với Vue, giá trị `string` là thứ mà directive hoặc attribute nhận được (`:title="t"` bind `t`); giá
trị `expression` được Pug tính ở thời điểm compile, trước khi Vue nhìn thấy nó.

## Dòng {#lines}

`doc.lines` có một mục cho mỗi dòng nguồn của range đã parse. Nó trả lời "dòng này có gì, và nên
thụt lề sâu bao nhiêu", điều mà formatter cần còn riêng cây thì không cho biết.

```ts
interface PugLine {
  range: Range          // the line, without its line ending
  indent: Range         // its leading whitespace
  kind: 'node' | 'attribute' | 'paren-close' | 'raw' | 'continuation' | 'blank'
  depth: number
  anchor: number | null // index into lines; see below
}
```

Với template này:

```pug
ul#list
  li(
    v-for="x in xs"
    :key="x"
  ) {{ x }}
  p.
    some text
```

| Dòng | `kind` | `depth` |
|---|---|---|
| `ul#list` | `node` | 0 |
| `  li(` | `node` | 1 |
| `    v-for="x in xs"` | `attribute` | 2 |
| `    :key="x"` | `attribute` | 2 |
| `  ) {{ x }}` | `paren-close` | 1 |
| `  p.` | `node` | 1 |
| `    some text` | `raw` | 2 |
| *(sau lần xuống dòng cuối)* | `blank` | 0 |

| `kind` | Dòng | `depth` |
|---|---|---|
| `node` | mở đầu một node | độ sâu lồng của nó |
| `attribute` | bên trong một attribute block nhiều dòng | độ sâu của tag + 1 |
| `paren-close` | bắt đầu bằng `)` đóng một block | độ sâu của tag |
| `raw` | bên trong text block, comment, code block hoặc filter | độ sâu của chủ + 1 |
| `continuation` | nối tiếp dòng phía trên (giá trị nhiều dòng), hoặc bị bỏ qua sau một lỗi | độ sâu của dòng đó + 1 |
| `blank` | rỗng hoặc chỉ có khoảng trắng | 0 |

`anchor` được đặt trên những dòng phải giữ cột **tương đối so với một dòng khác** thay vì theo
`depth`: các dòng của text block sau dòng đầu tiên (neo vào dòng đầu đó), và các dòng continuation
(neo vào dòng mà chúng nối tiếp). Trong

```pug
p.
  one
    two
p(title=`a
  b`) x
```

dòng `two` được neo vào dòng `one`, và dòng thứ hai của giá trị `title` được neo vào dòng phía
trên nó. Khi formatter dời dòng neo, nó dời các dòng này đi cùng một lượng.
