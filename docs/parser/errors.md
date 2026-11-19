---
description: "pug-lint-parser error codes with examples, how the parser recovers after an error, and how to turn an offset into a line and column."
---

# Errors

`parsePug` never throws. What it cannot parse becomes an entry in `doc.errors`, and the rest of
the template is still parsed:

```ts
interface PugParseError {
  code: string     // one of the codes below
  message: string  // for people; may change between versions
  offset: number   // where the problem is, as an offset into text
}
```

Match on `code`, not on `message`. To show a line and column, count from the offset:

```js
const before = text.slice(0, error.offset)
const line = before.split('\n').length                    // 1-based
const column = error.offset - before.lastIndexOf('\n')    // 1-based
```

## Recovery

An error does not stop the parse. The parser skips to the end of the bad construct, or to the end
of the line, and goes on with the next line. Lines that cannot be placed after an error, such as
lines nested under a construct that cannot have children, are kept in `doc.lines` with the kind
`continuation`, and no node is built for them.

```js
parsePug('div\n  p(class="a)\n  span ok\n  li(a=1 a=2)\n').errors
// [
//   { code: 'unterminated-string', message: 'Unterminated string', offset: 14 },
//   { code: 'duplicate-attribute', message: 'Duplicate attribute "a"', offset: 37 },
// ]
```

The ESLint plugin applies no fix inside a template that has errors, since it cannot check them.

## Codes

| `code` | Example | Message |
|---|---|---|
| `unterminated-string` | `p(title="hi) x` | Unterminated string |
| `unclosed-attributes` | `p(title="hi"` | Attribute block is not closed with ")" |
| `unclosed-arguments` | `+card(1, 2` | Mixin arguments are not closed with ")" |
| `missing-attribute-value` | `p(title=) x` | Expected a value after the operator |
| `duplicate-attribute` | `p(a="1" a="2")` | Duplicate attribute "a" |
| `unexpected-character` | `p(a!b) x` | Expected "=" after "!" |
| `unbalanced-key` | `p([a="1") x` | Unclosed "[" in an attribute key |
| `bad-escape` | `p(a="\x")` | Invalid escape sequence in a JavaScript string |
| `inconsistent-indentation` | a tab-indented line among space-indented ones | Invalid indentation, you can use tabs or spaces but not both |
| `unterminated-interpolation` | `p Hi #{name` | Interpolation is not closed with "}" |
| `unsupported-syntax` | `#{tag} x` | Unsupported syntax: "#{tag} x" |

Each code covers a family of problems; `unexpected-character`, `unbalanced-key`,
`inconsistent-indentation` and `unsupported-syntax` have several messages.

These match what the Pug compiler rejects, with one deliberate difference: a line break inside a
`'…'` or `"…"` attribute value is `unterminated-string`, as in JavaScript. Use backticks for
multi-line values.

## `unsupported-syntax`

This code marks valid Pug that the parser does not handle, such as interpolated tag names
(`#{tag}`) or text blocks without a tag. A few forms are also parsed without an error but
differently from Pug. Both lists are in [Unsupported Pug syntax](/guide/unsupported-syntax).
