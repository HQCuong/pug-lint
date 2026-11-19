---
title: Syntaxbaum
description: "Der konkrete Syntaxbaum von pug-lint-parser: jeder Knotentyp, Attribute und ihre Werte, Textteile und die Zeileninformationen, die Formatter brauchen."
---

# Syntaxbaum

`parsePug` gibt einen **konkreten** Syntaxbaum zurück: Neben dem, was ein Template bedeutet, behält
er, wie es geschrieben ist. Jede Kurzschreibweise, Klammer, jedes Komma, Anführungszeichen und jede
Zeile hat einen [Bereich](./api), sodass ein Werkzeug auf jedes davon zeigen oder eines umschreiben
kann, ohne den Rest anzufassen.

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

`eol` und `indentUnit` sagen einem Formatter, welches Zeilenende und welche Einrückung die Datei
bereits verwendet.

## Knoten {#nodes}

```ts
type PugNode = Tag | MixinCall | Text | Comment | Code | Control | Filter
```

Der `range` eines Knotens umfasst **seine eigene(n) Zeile(n)**, nicht die darunter verschachtelten
Zeilen; diese stehen in `children`. Knoten, die verschachtelte Zeilen aufnehmen, sind `Tag`,
`MixinCall`, `Code` und `Control`.

### `Tag` {#tag}

`a.btn#go(href="/x" :title="t") Go` wird zu:

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

Inline-Text (`p Hi`), gepufferter Code (`p= msg`), das Kind einer Block-Expansion (`li: a`) und die
verschachtelten Zeilen landen alle in `children`.

### `MixinCall` {#mixincall}

`+card(title, 2).wide(x="1")`: wie ein Tag, mit `name` (`card`, ohne das `+`) und `args`, dem Bereich
der Argumente samt Klammern, `(title, 2)` (`null` ohne sie). Er hat `shorthands`,
`attributeBlocks`, `andAttributes` und `children` wie ein Tag.

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

| `form` | Quelle |
|---|---|
| `inline` | `p Hello` (Text nach einem Tag in derselben Zeile) |
| `pipe` | `\| Hello` (ein Knoten pro Zeile) |
| `block` | die Zeilen unter `p.`, `script.`, … |
| `html` | eine Zeile literales HTML, `<b>Hello</b>` |

`parts` teilt den Text in rohen Text und Interpolationen. Für `p Hello #{name}, #[b bold] and {{ x }}`:

| Teil | Quelle |
|---|---|
| `{ type: 'Raw' }` | `Hello ` |
| `{ type: 'Interpolation', escaped, expression }` | `#{name}` (`!{…}` hat `escaped: false`) |
| `{ type: 'Raw' }` | `, ` |
| `{ type: 'TagInterpolation', tag }` | `#[b bold]`, wobei `tag` ein vollständiger `Tag`-Knoten ist |
| `{ type: 'Raw' }` | ` and {{ x }}` |

`{{ }}` wird nicht geteilt: Es gehört zu Vue und bleibt im rohen Text.

### `Comment`, `Code`, `Control`, `Filter` {#comment-code-control-filter}

| Knoten | Quelle | Felder |
|---|---|---|
| `Comment` | `// shown`, `//- hidden` und die darunter verschachtelten Zeilen | `buffered` (`//` ist es, `//-` nicht), `content` |
| `Code` | `- const x = 1`, `= value`, `!= html` und `p= value` als Kind eines Tags | `buffered`, `escaped`, `expression`, `children` |
| `Control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default`, `mixin`, `block`, `append`, `prepend`, `include`, `extends`, `doctype`, `yield` | `keyword`, `head` (der Rest der Zeile), `children` |
| `Filter` | `:markdown-it` und seine Textzeilen | `name`, `attributeBlocks`, `children` (`Text`-Knoten) |

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

Ein Tag kann mehr als einen Block haben (`a(x)(y)` ist gültiges Pug), daher ist `attributeBlocks` eine
Liste; meist ist sie leer oder hat einen Eintrag.

| `kind` | Wann | Beispiel |
|---|---|---|
| `string` | der **ganze** Wert ist ein einziges `'…'`- oder `"…"`-Literal | `href="/x"` |
| `template` | der ganze Wert ist ein einziges `` `…` ``-Literal | ``title=`Hi ${name}` `` |
| `expression` | alles andere: Pug kompiliert es als JavaScript | `href=url`, `title="a" + b` |

Für Vue ist ein `string`-Wert das, was die Direktive oder das Attribut erhält (`:title="t"` bindet
`t`); ein `expression`-Wert wird von Pug zur Kompilierzeit ausgewertet, bevor Vue ihn sieht.

## Zeilen {#lines}

`doc.lines` hat einen Eintrag pro Quellzeile des geparsten Bereichs. Er beantwortet „was steht in
dieser Zeile und wie tief soll sie eingerückt sein", was ein Formatter braucht und der Baum allein
nicht sagt.

```ts
interface PugLine {
  range: Range          // the line, without its line ending
  indent: Range         // its leading whitespace
  kind: 'node' | 'attribute' | 'paren-close' | 'raw' | 'continuation' | 'blank'
  depth: number
  anchor: number | null // index into lines; see below
}
```

Für dieses Template:

```pug
ul#list
  li(
    v-for="x in xs"
    :key="x"
  ) {{ x }}
  p.
    some text
```

| Zeile | `kind` | `depth` |
|---|---|---|
| `ul#list` | `node` | 0 |
| `  li(` | `node` | 1 |
| `    v-for="x in xs"` | `attribute` | 2 |
| `    :key="x"` | `attribute` | 2 |
| `  ) {{ x }}` | `paren-close` | 1 |
| `  p.` | `node` | 1 |
| `    some text` | `raw` | 2 |
| *(nach dem letzten Zeilenumbruch)* | `blank` | 0 |

| `kind` | Zeile | `depth` |
|---|---|---|
| `node` | beginnt einen Knoten | seine Verschachtelungstiefe |
| `attribute` | innerhalb eines mehrzeiligen Attributblocks | Tiefe des Tags + 1 |
| `paren-close` | beginnt mit der `)`, die einen Block schließt | Tiefe des Tags |
| `raw` | innerhalb eines Textblocks, Kommentars, Codeblocks oder Filters | Tiefe des Besitzers + 1 |
| `continuation` | setzt eine Zeile darüber fort (ein mehrzeiliger Wert) oder wird nach einem Fehler übersprungen | Tiefe dieser Zeile + 1 |
| `blank` | leer oder nur Leerraum | 0 |

`anchor` ist bei Zeilen gesetzt, die ihre Spalte **relativ zu einer anderen Zeile** behalten müssen,
statt `depth` zu folgen: die Zeilen eines Textblocks nach seiner ersten (verankert an dieser ersten
Zeile) und Fortsetzungszeilen (verankert an der Zeile, die sie fortsetzen). In

```pug
p.
  one
    two
p(title=`a
  b`) x
```

ist die Zeile `two` an die Zeile `one` verankert und die zweite Zeile des `title`-Werts an die
Zeile darüber. Verschiebt ein Formatter die Anker-Zeile, verschiebt er diese um denselben Betrag mit.
