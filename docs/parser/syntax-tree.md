# Syntax tree

`parsePug` returns a **concrete** syntax tree: besides what a template means, it keeps how it is
written. Every shorthand, parenthesis, comma, quote and line has a [range](./api), so a tool can
point at any of them, or rewrite one without touching the rest.

## `PugDocument`

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

`eol` and `indentUnit` tell a formatter which line ending and indentation the file already uses.

## Nodes

```ts
type PugNode = Tag | MixinCall | Text | Comment | Code | Control | Filter
```

A node's `range` covers its **own line(s)**, not the lines nested under it; those are in
`children`. Nodes that take nested lines are `Tag`, `MixinCall`, `Code` and `Control`.

### `Tag`

`a.btn#go(href="/x" :title="t") Go` parses to:

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

Inline text (`p Hi`), buffered code (`p= msg`), the child of a block expansion (`li: a`) and the
nested lines all go into `children`.

### `MixinCall`

`+card(title, 2).wide(x="1")`: like a tag, with `name` (`card`, without the `+`) and `args`, the
range of the arguments with their parentheses, `(title, 2)` (`null` without them). It has `shorthands`,
`attributeBlocks`, `andAttributes` and `children` as a tag does.

### `Text`

```ts
interface Text {
  type: 'Text'
  form: 'inline' | 'pipe' | 'block' | 'html'
  range: Range
  content: Range       // the text itself, after `| ` or the tag
  parts: TextPart[]
}
```

| `form` | Source |
|---|---|
| `inline` | `p Hello` (text after a tag on the same line) |
| `pipe` | `\| Hello` (one node per line) |
| `block` | the lines under `p.`, `script.`, … |
| `html` | a line of literal HTML, `<b>Hello</b>` |

`parts` splits the text into raw text and interpolations. For `p Hello #{name}, #[b bold] and {{ x }}`:

| Part | Source |
|---|---|
| `{ type: 'Raw' }` | `Hello ` |
| `{ type: 'Interpolation', escaped, expression }` | `#{name}` (`!{…}` has `escaped: false`) |
| `{ type: 'Raw' }` | `, ` |
| `{ type: 'TagInterpolation', tag }` | `#[b bold]`, with `tag` a full `Tag` node |
| `{ type: 'Raw' }` | ` and {{ x }}` |

`{{ }}` is not split: it belongs to Vue, and stays in the raw text.

### `Comment`, `Code`, `Control`, `Filter`

| Node | Source | Fields |
|---|---|---|
| `Comment` | `// shown`, `//- hidden`, and the lines nested under them | `buffered` (`//` is, `//-` is not), `content` |
| `Code` | `- const x = 1`, `= value`, `!= html`, and `p= value` as a tag's child | `buffered`, `escaped`, `expression`, `children` |
| `Control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default`, `mixin`, `block`, `append`, `prepend`, `include`, `extends`, `doctype`, `yield` | `keyword`, `head` (the rest of the line), `children` |
| `Filter` | `:markdown-it`, and its text lines | `name`, `attributeBlocks`, `children` (`Text` nodes) |

## Attributes

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

A tag can have more than one block (`a(x)(y)` is valid Pug), so `attributeBlocks` is a list; it is
usually empty or has one entry.

| `kind` | When | Example |
|---|---|---|
| `string` | the **whole** value is one `'…'` or `"…"` literal | `href="/x"` |
| `template` | the whole value is one `` `…` `` literal | ``title=`Hi ${name}` `` |
| `expression` | anything else: Pug compiles it as JavaScript | `href=url`, `title="a" + b` |

For Vue, a `string` value is what the directive or attribute receives (`:title="t"` binds `t`); an
`expression` value is evaluated by Pug at compile time, before Vue sees it.

## Lines

`doc.lines` has one entry per source line of the parsed range. It answers "what is on this line,
and how deep should it be indented", which a formatter needs and the tree alone does not say.

```ts
interface PugLine {
  range: Range          // the line, without its line ending
  indent: Range         // its leading whitespace
  kind: 'node' | 'attribute' | 'paren-close' | 'raw' | 'continuation' | 'blank'
  depth: number
  anchor: number | null // index into lines; see below
}
```

For this template:

```pug
ul#list
  li(
    v-for="x in xs"
    :key="x"
  ) {{ x }}
  p.
    some text
```

| Line | `kind` | `depth` |
|---|---|---|
| `ul#list` | `node` | 0 |
| `  li(` | `node` | 1 |
| `    v-for="x in xs"` | `attribute` | 2 |
| `    :key="x"` | `attribute` | 2 |
| `  ) {{ x }}` | `paren-close` | 1 |
| `  p.` | `node` | 1 |
| `    some text` | `raw` | 2 |
| *(after the last line break)* | `blank` | 0 |

| `kind` | Line | `depth` |
|---|---|---|
| `node` | starts a node | its nesting depth |
| `attribute` | inside a multi-line attribute block | the tag's depth + 1 |
| `paren-close` | starts with the `)` that closes a block | the tag's depth |
| `raw` | inside a text block, comment, code block or filter | the owner's depth + 1 |
| `continuation` | continues a line above (a multi-line value), or is skipped after an error | that line's depth + 1 |
| `blank` | empty or only whitespace | 0 |

`anchor` is set on lines that must keep their column **relative to another line** rather than
follow `depth`: the lines of a text block after its first one (anchored to that first line), and
continuation lines (anchored to the line they continue). In

```pug
p.
  one
    two
p(title=`a
  b`) x
```

the `two` line is anchored to the `one` line, and the second line of the `title` value to the line above it. When a
formatter moves the anchor line, it moves these by the same amount.
