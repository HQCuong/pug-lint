---
title: "Arbre syntaxique"
description: "L'arbre syntaxique concret de pug-lint-parser : chaque type de nœud, les attributs et leurs valeurs, les parties de texte, et les informations par ligne dont les formateurs ont besoin."
---

# Arbre syntaxique

`parsePug` renvoie un arbre syntaxique **concret** : outre ce qu'un template signifie, il conserve
la façon dont il est écrit. Chaque raccourci, parenthèse, virgule, guillemet et ligne a une
[plage](./api), de sorte qu'un outil peut les pointer ou en réécrire un sans toucher au reste.

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

`eol` et `indentUnit` indiquent à un formateur quelle fin de ligne et quelle indentation le fichier
utilise déjà.

## Nœuds {#nodes}

```ts
type PugNode = Tag | MixinCall | Text | Comment | Code | Control | Filter
```

La `range` d'un nœud couvre sa **ou ses propres lignes**, pas les lignes imbriquées dessous ; celles-ci
sont dans `children`. Les nœuds qui acceptent des lignes imbriquées sont `Tag`, `MixinCall`, `Code`
et `Control`.

### `Tag` {#tag}

`a.btn#go(href="/x" :title="t") Go` donne :

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

Le texte en ligne (`p Hi`), le code avec sortie (`p= msg`), l'enfant d'une expansion de bloc
(`li: a`) et les lignes imbriquées vont tous dans `children`.

### `MixinCall` {#mixincall}

`+card(title, 2).wide(x="1")` : comme une balise, avec `name` (`card`, sans le `+`) et `args`, la
plage des arguments avec leurs parenthèses, `(title, 2)` (`null` sans elles). Il a `shorthands`,
`attributeBlocks`, `andAttributes` et `children` comme une balise.

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

| `form` | Source |
|---|---|
| `inline` | `p Hello` (texte après une balise, sur la même ligne) |
| `pipe` | `\| Hello` (un nœud par ligne) |
| `block` | les lignes sous `p.`, `script.`, … |
| `html` | une ligne de HTML littéral, `<b>Hello</b>` |

`parts` découpe le texte en texte brut et interpolations. Pour `p Hello #{name}, #[b bold] and {{ x }}` :

| Partie | Source |
|---|---|
| `{ type: 'Raw' }` | `Hello ` |
| `{ type: 'Interpolation', escaped, expression }` | `#{name}` (`!{…}` a `escaped: false`) |
| `{ type: 'Raw' }` | `, ` |
| `{ type: 'TagInterpolation', tag }` | `#[b bold]`, avec `tag` un nœud `Tag` complet |
| `{ type: 'Raw' }` | ` and {{ x }}` |

`{{ }}` n'est pas découpé : il appartient à Vue et reste dans le texte brut.

### `Comment`, `Code`, `Control`, `Filter` {#comment-code-control-filter}

| Nœud | Source | Champs |
|---|---|---|
| `Comment` | `// shown`, `//- hidden`, et les lignes imbriquées dessous | `buffered` (`//` l'est, `//-` non), `content` |
| `Code` | `- const x = 1`, `= value`, `!= html`, et `p= value` comme enfant d'une balise | `buffered`, `escaped`, `expression`, `children` |
| `Control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default`, `mixin`, `block`, `append`, `prepend`, `include`, `extends`, `doctype`, `yield` | `keyword`, `head` (le reste de la ligne), `children` |
| `Filter` | `:markdown-it`, et ses lignes de texte | `name`, `attributeBlocks`, `children` (nœuds `Text`) |

## Attributs {#attributes}

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

Une balise peut avoir plus d'un bloc (`a(x)(y)` est du Pug valide) : `attributeBlocks` est donc une
liste ; elle est en général vide ou a une seule entrée.

| `kind` | Quand | Exemple |
|---|---|---|
| `string` | la valeur **entière** est un seul littéral `'…'` ou `"…"` | `href="/x"` |
| `template` | la valeur entière est un seul littéral `` `…` `` | ``title=`Hi ${name}` `` |
| `expression` | tout le reste : Pug le compile comme du JavaScript | `href=url`, `title="a" + b` |

Pour Vue, une valeur `string` est ce que la directive ou l'attribut reçoit (`:title="t"` lie `t`) ;
une valeur `expression` est évaluée par Pug à la compilation, avant que Vue ne la voie.

## Lignes {#lines}

`doc.lines` a une entrée par ligne source de la plage analysée. Elle répond à « qu'y a-t-il sur
cette ligne, et à quelle profondeur doit-elle être indentée », dont un formateur a besoin et que
l'arbre seul ne dit pas.

```ts
interface PugLine {
  range: Range          // the line, without its line ending
  indent: Range         // its leading whitespace
  kind: 'node' | 'attribute' | 'paren-close' | 'raw' | 'continuation' | 'blank'
  depth: number
  anchor: number | null // index into lines; see below
}
```

Pour ce template :

```pug
ul#list
  li(
    v-for="x in xs"
    :key="x"
  ) {{ x }}
  p.
    some text
```

| Ligne | `kind` | `depth` |
|---|---|---|
| `ul#list` | `node` | 0 |
| `  li(` | `node` | 1 |
| `    v-for="x in xs"` | `attribute` | 2 |
| `    :key="x"` | `attribute` | 2 |
| `  ) {{ x }}` | `paren-close` | 1 |
| `  p.` | `node` | 1 |
| `    some text` | `raw` | 2 |
| *(après le dernier saut de ligne)* | `blank` | 0 |

| `kind` | Ligne | `depth` |
|---|---|---|
| `node` | commence un nœud | sa profondeur d'imbrication |
| `attribute` | à l'intérieur d'un bloc d'attributs multiligne | la profondeur de la balise + 1 |
| `paren-close` | commence par le `)` qui ferme un bloc | la profondeur de la balise |
| `raw` | dans un bloc de texte, un commentaire, un bloc de code ou un filtre | la profondeur du propriétaire + 1 |
| `continuation` | prolonge une ligne au-dessus (une valeur multiligne), ou est ignorée après une erreur | la profondeur de cette ligne + 1 |
| `blank` | vide ou uniquement des espaces | 0 |

`anchor` est défini sur les lignes qui doivent garder leur colonne **relativement à une autre
ligne** plutôt que de suivre `depth` : les lignes d'un bloc de texte après la première (ancrées à
cette première ligne), et les lignes de continuation (ancrées à la ligne qu'elles prolongent). Dans

```pug
p.
  one
    two
p(title=`a
  b`) x
```

la ligne `two` est ancrée à la ligne `one`, et la deuxième ligne de la valeur `title` à la ligne
au-dessus. Quand un formateur déplace la ligne d'ancrage, il déplace celles-ci du même montant.
