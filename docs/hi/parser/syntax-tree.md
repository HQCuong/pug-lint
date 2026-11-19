---
description: "pug-lint-parser का concrete syntax tree: हर node type, attributes और उनके values, text के हिस्से, और formatters को चाहिए प्रति-line जानकारी।"
---

# Syntax tree

`parsePug` एक **concrete** syntax tree लौटाता है: template का मतलब ही नहीं, वह यह भी रखता है कि वह कैसे
लिखा गया है। हर shorthand, parenthesis, comma, quote और line की एक [range](./api) होती है, इसलिए कोई tool
उनमें से किसी की ओर इशारा कर सकता है, या बाकी को छुए बिना एक को दोबारा लिख सकता है।

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

`eol` और `indentUnit` formatter को बताते हैं कि फ़ाइल पहले से कौन-सी line ending और indentation उपयोग करती है।

## Nodes {#nodes}

```ts
type PugNode = Tag | MixinCall | Text | Comment | Code | Control | Filter
```

Node की `range` उसकी **अपनी line(s)** को कवर करती है, उसके नीचे nested lines को नहीं; वे
`children` में हैं। nested lines लेने वाले nodes `Tag`, `MixinCall`, `Code` और `Control` हैं।

### `Tag` {#tag}

`a.btn#go(href="/x" :title="t") Go` इस रूप में parse होता है:

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

Inline text (`p Hi`), buffered code (`p= msg`), block expansion का child (`li: a`) और
nested lines सब `children` में जाते हैं।

### `MixinCall` {#mixincall}

`+card(title, 2).wide(x="1")`: tag जैसा, `name` (`card`, `+` के बिना) और `args` के साथ, यानी
arguments की range parentheses समेत, `(title, 2)` (उनके बिना `null`)। इसमें tag की तरह `shorthands`,
`attributeBlocks`, `andAttributes` और `children` होते हैं।

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

| `form` | स्रोत |
|---|---|
| `inline` | `p Hello` (उसी line पर tag के बाद text) |
| `pipe` | `\| Hello` (हर line के लिए एक node) |
| `block` | `p.`, `script.`, … के नीचे की lines |
| `html` | literal HTML की एक line, `<b>Hello</b>` |

`parts` text को raw text और interpolations में बाँटता है। `p Hello #{name}, #[b bold] and {{ x }}` के लिए:

| Part | स्रोत |
|---|---|
| `{ type: 'Raw' }` | `Hello ` |
| `{ type: 'Interpolation', escaped, expression }` | `#{name}` (`!{…}` में `escaped: false` है) |
| `{ type: 'Raw' }` | `, ` |
| `{ type: 'TagInterpolation', tag }` | `#[b bold]`, जहाँ `tag` एक पूरा `Tag` node है |
| `{ type: 'Raw' }` | ` and {{ x }}` |

`{{ }}` को बाँटा नहीं जाता: वह Vue का है, और raw text में ही रहता है।

### `Comment`, `Code`, `Control`, `Filter` {#comment-code-control-filter}

| Node | स्रोत | Fields |
|---|---|---|
| `Comment` | `// shown`, `//- hidden`, और उनके नीचे nested lines | `buffered` (`//` है, `//-` नहीं), `content` |
| `Code` | `- const x = 1`, `= value`, `!= html`, और tag के child के रूप में `p= value` | `buffered`, `escaped`, `expression`, `children` |
| `Control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default`, `mixin`, `block`, `append`, `prepend`, `include`, `extends`, `doctype`, `yield` | `keyword`, `head` (line का बाकी हिस्सा), `children` |
| `Filter` | `:markdown-it`, और उसकी text lines | `name`, `attributeBlocks`, `children` (`Text` nodes) |

## Attributes {#attributes}

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

Tag में एक से अधिक block हो सकते हैं (`a(x)(y)` वैध Pug है), इसलिए `attributeBlocks` एक सूची है; वह
आमतौर पर खाली होती है या उसमें एक entry होती है।

| `kind` | कब | उदाहरण |
|---|---|---|
| `string` | **पूरा** value एक `'…'` या `"…"` literal है | `href="/x"` |
| `template` | पूरा value एक `` `…` `` literal है | ``title=`Hi ${name}` `` |
| `expression` | और कुछ भी: Pug उसे JavaScript के रूप में compile करता है | `href=url`, `title="a" + b` |

Vue के लिए, `string` value वही है जो directive या attribute को मिलता है (`:title="t"` `t` को bind करता है);
`expression` value को Pug compile time पर, Vue के देखने से पहले, evaluate करता है।

## Lines {#lines}

`doc.lines` में parse की गई range की हर source line के लिए एक entry होती है। वह इसका उत्तर देती है कि "इस line पर
क्या है, और उसे कितना गहरा indent होना चाहिए", जो formatter को चाहिए और अकेला tree नहीं बताता।

```ts
interface PugLine {
  range: Range          // the line, without its line ending
  indent: Range         // its leading whitespace
  kind: 'node' | 'attribute' | 'paren-close' | 'raw' | 'continuation' | 'blank'
  depth: number
  anchor: number | null // index into lines; see below
}
```

इस template के लिए:

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
| *(आखिरी line break के बाद)* | `blank` | 0 |

| `kind` | Line | `depth` |
|---|---|---|
| `node` | node शुरू करती है | उसकी nesting depth |
| `attribute` | multi-line attribute block के अंदर | tag की depth + 1 |
| `paren-close` | block को बंद करने वाले `)` से शुरू होती है | tag की depth |
| `raw` | text block, comment, code block या filter के अंदर | मालिक की depth + 1 |
| `continuation` | ऊपर की line को जारी रखती है (multi-line value), या error के बाद छोड़ी गई है | उस line की depth + 1 |
| `blank` | खाली या केवल whitespace | 0 |

`anchor` उन lines पर सेट होता है जिन्हें `depth` का पालन करने के बजाय **किसी दूसरी line के सापेक्ष** अपना column रखना होता है:
text block की पहली line के बाद की lines (उसी पहली line से anchored), और
continuation lines (उस line से anchored जिसे वे जारी रखती हैं)। इस template में

```pug
p.
  one
    two
p(title=`a
  b`) x
```

`two` वाली line `one` वाली line से anchored है, और `title` value की दूसरी line उसके ऊपर की line से। जब कोई
formatter anchor line को हिलाता है, तो वह इन्हें भी उतना ही हिलाता है।
