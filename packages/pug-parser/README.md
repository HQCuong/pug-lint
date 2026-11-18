# @pug-lint/parser

A concrete syntax tree (CST) parser for Pug templates, built for linting and formatting tools.
It is the parser behind [`@pug-lint/eslint-plugin`](https://github.com/HQCuong/pug-lint/tree/main/packages/eslint-plugin).

- **Never throws.** Input it cannot parse becomes an entry in `errors`, and parsing continues on
  the next line.
- **Exact source ranges.** Every node, attribute, value, shorthand, comma and line has a
  `[start, end)` range: UTF-16 offsets into the text you pass in, so you can slice the source or
  build a minimal edit without adjusting positions.
- **Parses a slice in place.** `parsePug(text, { start, end })` parses only `text[start, end)` (for
  example the content of a `<template lang="pug">` block); ranges still refer to the whole `text`.
- **Keeps line endings.** LF and CRLF are both handled; `doc.eol` is the first line ending found.
- No runtime dependencies. ESM only. Node.js `^20.19.0 || ^22.13.0 || >=24`.

## Usage

```js
import { parsePug, walk } from '@pug-lint/parser'

const text = 'ul#list\n  li.item(v-for="x in xs" :key="x") {{ x }}\n'
const doc = parsePug(text)

console.log(doc.errors) // []
walk(doc, (node) => {
  if (node.type === 'Tag') console.log(node.name?.value ?? 'div', text.slice(...node.range))
})
// ul ul#list
// li li.item(v-for="x in xs" :key="x") {{ x }}
```

## API

- `parsePug(text, options?)` → `PugDocument`. `options.start` / `options.end` limit parsing to
  that range of `text`.
- `walk(doc, visit)`: calls `visit(node, parent)` for every node in document order, including the
  tags inside tag interpolations (`#[…]`).
- `fingerprint(doc)` → `string`: a structural summary of the tree (tags and their nesting,
  class and id sets, attribute counts, the shape of text and interpolation). It ignores
  whitespace, quoting, attribute order, attribute names and values other than static `class` and
  `id`, tag-name casing, text content and the content of code and control heads, so `p(class="a b")` and `p.a.b` have the same
  fingerprint. The ESLint plugin compares fingerprints to reject fixes that change a template's structure.
- `literalSpans(text, range)` → the ranges of the string and template literals in a JavaScript
  expression.
- Types for every node: `PugDocument`, `PugNode`, `Tag`, `AttributeBlock`, `Attribute`,
  `AttributeValue`, `Text`, `Comment`, `Code`, `Control`, `MixinCall`, `Filter`, `PugLine`,
  `PugParseError` and more (see `src/ast.ts`).

A `PugDocument` has `children` (the tree), `errors` (`{ code, message, offset }`), `lines` (one
entry per source line with its indentation range, kind and logical depth), `eol` and `indentUnit`.

## Unsupported syntax

Some Pug forms are reported with the error code `unsupported-syntax`, and a few are parsed
without an error but differently from Pug. They are listed in
[docs/unsupported-syntax.md](https://github.com/HQCuong/pug-lint/blob/main/packages/pug-parser/docs/unsupported-syntax.md).

## License

MIT
