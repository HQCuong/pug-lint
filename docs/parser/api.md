# API

```js
import { parsePug, walk, fingerprint, literalSpans } from 'pug-lint-parser'
```

The package is ESM only, has no dependencies, and ships its TypeScript types: every node type
below is exported (`import type { Tag, PugDocument } from 'pug-lint-parser'`).

**Every position is an offset into the `text` you passed in**: a UTF-16 index, the same unit as
`String.prototype.slice`. A `Range` is `[start, end)`, so `text.slice(...range)` returns the
source of a node, and `text.slice(0, start) + replacement + text.slice(end)` edits it.

## `parsePug(text, options?)`

```ts
function parsePug(text: string, options?: ParseOptions): PugDocument

interface ParseOptions {
  start?: number // default 0
  end?: number   // default text.length
}
```

Parses `text[start, end)` and returns the [document](./syntax-tree#pugdocument). It never throws:
what it cannot parse becomes an entry in `doc.errors`, and parsing goes on at the next line (see
[Errors](./errors)).

`start` and `end` let you parse part of a larger file without copying it, for example the
content of a `<template lang="pug">` block in a `.vue` file. Ranges still refer to the whole
`text`:

```js
const sfc = '<template lang="pug">\ndiv\n  p Hi\n</template>\n'
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

doc.range                 // [21, 33]
doc.children[0].name      // { value: 'div', range: [22, 25] }
```

When every line of the slice is indented by the same amount, as in a template indented under
`<template>`, that common indentation is the base: the parser treats it as column 0, as Vue does
before it compiles the template. Pug itself rejects an indented `.pug` file, so the parser is more
lenient here than the Pug compiler.

Line endings may be LF or CRLF; a lone CR is read as a line break too. A leading BOM is not
stripped: pass `start: 1` to skip it.

## `walk(doc, visit)`

```ts
function walk(
  doc: PugDocument,
  visit: (node: PugNode, parent: PugNode | PugDocument) => void,
): void
```

Calls `visit` for every node in document order (pre-order: a node before its children). It goes
into `children` and into the tag of each `#[…]` [tag interpolation](./syntax-tree#text), whose
parent is the enclosing `Text` node.

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

## `fingerprint(doc)`

```ts
function fingerprint(doc: PugDocument): string
```

A string that summarizes the **structure** of a template: two templates with the same fingerprint
render the same element tree. The ESLint plugin compares fingerprints to reject fixes that would
change a template.

What it includes:

- the tags, mixin calls, text, comments, code and control blocks, and how they nest;
- each tag's set of static classes and ids, **whatever their form**: `p(class="a b")` and `p.a.b`
  have the same fingerprint, `p.a` does not;
- the number of other attributes, and the kind of each value (none or string, expression, template
  with `${}`);
- every piece of JavaScript that Pug compiles, by its text up to indentation: expression and `${}`
  attribute values, `&attributes(…)`, mixin arguments, code, control heads and `#{…}`;
- the shape of text: where it is split into lines and interpolations.

What it ignores: whitespace and indentation width, quotes, commas, attribute order and names,
string attribute values other than `class` and `id`, tag-name casing, text content, the `/` of a
self-closing tag and the `:` of a block expansion.

```js
fingerprint(parsePug('p(class="a b") Hi')) === fingerprint(parsePug('p.a.b Hi'))  // true
fingerprint(parsePug('p.a Hi')) === fingerprint(parsePug('p.a.b Hi'))             // false
```

The string's format is not part of the API: compare fingerprints, do not parse them.

## `literalSpans(text, range)`

```ts
function literalSpans(text: string, range: [number, number]): [number, number][]
```

The ranges of the string literals (`'…'`, `"…"`) and template literals (`` `…` ``) inside a
JavaScript expression at `text[range]`. Use it to tell code from string content, for example to
avoid re-indenting the inside of a multi-line template literal. An unterminated literal runs to
the end of `range`.

```js
const e = 'f("a", `b ${c}`, d)'
literalSpans(e, [0, e.length])              // [[2, 5], [7, 15]]
                                            // '"a"' and '`b ${c}`'
```

## Types

| Type | What it is |
|---|---|
| `Range` | `[start: number, end: number]`, offsets into `text` |
| `PugDocument` | The result of `parsePug`: [tree, lines and errors](./syntax-tree#pugdocument) |
| `PugNode` | `Tag \| MixinCall \| Text \| Comment \| Code \| Control \| Filter` |
| `Tag`, `MixinCall`, `Text`, `Comment`, `Code`, `Control`, `Filter` | [The nodes](./syntax-tree#nodes) |
| `AttributeBlock`, `Attribute`, `AttributeValue` | [Attributes](./syntax-tree#attributes) |
| `TextPart` | `Raw`, `Interpolation` or `TagInterpolation` inside a `Text` |
| `ControlKeyword` | The keyword of a `Control` node |
| `PugLine` | [One source line](./syntax-tree#lines) |
| `PugParseError` | [`{ code, message, offset }`](./errors) |
| `ParseOptions` | `{ start?, end? }` |
