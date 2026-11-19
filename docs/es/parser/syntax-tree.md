---
title: Árbol de sintaxis
description: "El árbol de sintaxis concreto de pug-lint-parser: cada tipo de nodo, los atributos y sus valores, las partes de texto y la información por línea que necesitan los formateadores."
---

# Árbol de sintaxis

`parsePug` devuelve un árbol de sintaxis **concreto**: además de lo que significa una plantilla,
conserva cómo está escrita. Cada atajo, paréntesis, coma, comilla y línea tiene un [rango](./api),
así que una herramienta puede señalar cualquiera de ellos, o reescribir uno sin tocar el resto.

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

`eol` e `indentUnit` indican a un formateador qué final de línea e indentación usa ya el archivo.

## Nodos {#nodes}

```ts
type PugNode = Tag | MixinCall | Text | Comment | Code | Control | Filter
```

El `range` de un nodo abarca **su(s) propia(s) línea(s)**, no las líneas anidadas bajo él; esas
están en `children`. Los nodos que admiten líneas anidadas son `Tag`, `MixinCall`, `Code` y
`Control`.

### `Tag` {#tag}

`a.btn#go(href="/x" :title="t") Go` se analiza como:

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

El texto en línea (`p Hi`), el código con salida (`p= msg`), el hijo de una expansión de bloque
(`li: a`) y las líneas anidadas van todos a `children`.

### `MixinCall` {#mixincall}

`+card(title, 2).wide(x="1")`: como una etiqueta, con `name` (`card`, sin el `+`) y `args`, el rango
de los argumentos con sus paréntesis, `(title, 2)` (`null` sin ellos). Tiene `shorthands`,
`attributeBlocks`, `andAttributes` y `children` igual que una etiqueta.

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

| `form` | Código fuente |
|---|---|
| `inline` | `p Hello` (texto tras una etiqueta en la misma línea) |
| `pipe` | `\| Hello` (un nodo por línea) |
| `block` | las líneas bajo `p.`, `script.`, … |
| `html` | una línea de HTML literal, `<b>Hello</b>` |

`parts` divide el texto en texto sin procesar e interpolaciones. Para
`p Hello #{name}, #[b bold] and {{ x }}`:

| Parte | Código fuente |
|---|---|
| `{ type: 'Raw' }` | `Hello ` |
| `{ type: 'Interpolation', escaped, expression }` | `#{name}` (`!{…}` tiene `escaped: false`) |
| `{ type: 'Raw' }` | `, ` |
| `{ type: 'TagInterpolation', tag }` | `#[b bold]`, con `tag` un nodo `Tag` completo |
| `{ type: 'Raw' }` | ` and {{ x }}` |

`{{ }}` no se divide: pertenece a Vue y permanece en el texto sin procesar.

### `Comment`, `Code`, `Control`, `Filter` {#comment-code-control-filter}

| Nodo | Código fuente | Campos |
|---|---|---|
| `Comment` | `// shown`, `//- hidden` y las líneas anidadas bajo ellos | `buffered` (`//` lo es, `//-` no), `content` |
| `Code` | `- const x = 1`, `= value`, `!= html` y `p= value` como hijo de una etiqueta | `buffered`, `escaped`, `expression`, `children` |
| `Control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default`, `mixin`, `block`, `append`, `prepend`, `include`, `extends`, `doctype`, `yield` | `keyword`, `head` (el resto de la línea), `children` |
| `Filter` | `:markdown-it` y sus líneas de texto | `name`, `attributeBlocks`, `children` (nodos `Text`) |

## Atributos {#attributes}

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

Una etiqueta puede tener más de un bloque (`a(x)(y)` es Pug válido), así que `attributeBlocks` es
una lista; normalmente está vacía o tiene una entrada.

| `kind` | Cuándo | Ejemplo |
|---|---|---|
| `string` | el valor **completo** es un único literal `'…'` o `"…"` | `href="/x"` |
| `template` | el valor completo es un único literal `` `…` `` | ``title=`Hi ${name}` `` |
| `expression` | cualquier otra cosa: Pug la compila como JavaScript | `href=url`, `title="a" + b` |

Para Vue, un valor `string` es lo que recibe la directiva o el atributo (`:title="t"` enlaza `t`);
un valor `expression` lo evalúa Pug en tiempo de compilación, antes de que Vue lo vea.

## Líneas {#lines}

`doc.lines` tiene una entrada por cada línea de código fuente del rango analizado. Responde a «qué
hay en esta línea y a qué profundidad debe indentarse», algo que un formateador necesita y que el
árbol por sí solo no dice.

```ts
interface PugLine {
  range: Range          // the line, without its line ending
  indent: Range         // its leading whitespace
  kind: 'node' | 'attribute' | 'paren-close' | 'raw' | 'continuation' | 'blank'
  depth: number
  anchor: number | null // index into lines; see below
}
```

Para esta plantilla:

```pug
ul#list
  li(
    v-for="x in xs"
    :key="x"
  ) {{ x }}
  p.
    some text
```

| Línea | `kind` | `depth` |
|---|---|---|
| `ul#list` | `node` | 0 |
| `  li(` | `node` | 1 |
| `    v-for="x in xs"` | `attribute` | 2 |
| `    :key="x"` | `attribute` | 2 |
| `  ) {{ x }}` | `paren-close` | 1 |
| `  p.` | `node` | 1 |
| `    some text` | `raw` | 2 |
| *(tras el último salto de línea)* | `blank` | 0 |

| `kind` | Línea | `depth` |
|---|---|---|
| `node` | inicia un nodo | su profundidad de anidamiento |
| `attribute` | dentro de un bloque de atributos multilínea | la profundidad de la etiqueta + 1 |
| `paren-close` | empieza con el `)` que cierra un bloque | la profundidad de la etiqueta |
| `raw` | dentro de un bloque de texto, comentario, bloque de código o filtro | la profundidad del propietario + 1 |
| `continuation` | continúa una línea anterior (un valor multilínea), o se omite tras un error | la profundidad de esa línea + 1 |
| `blank` | vacía o solo con espacios en blanco | 0 |

`anchor` se establece en las líneas que deben mantener su columna **relativa a otra línea** en lugar
de seguir `depth`: las líneas de un bloque de texto posteriores a la primera (ancladas a esa primera
línea) y las líneas de continuación (ancladas a la línea que continúan). En

```pug
p.
  one
    two
p(title=`a
  b`) x
```

la línea `two` está anclada a la línea `one`, y la segunda línea del valor de `title`, a la línea
anterior. Cuando un formateador mueve la línea ancla, mueve estas en la misma cantidad.
