---
title: Árvore de sintaxe
description: "A árvore de sintaxe concreta do pug-lint-parser: todos os tipos de nó, atributos e seus valores, partes de texto e as informações por linha de que os formatadores precisam."
---

# Árvore de sintaxe

O `parsePug` devolve uma árvore de sintaxe **concreta**: além do que um template significa, ela
guarda como ele está escrito. Todo atalho, parêntese, vírgula, aspa e linha tem um [range](./api),
então uma ferramenta pode apontar para qualquer um deles, ou reescrever um sem tocar no resto.

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

`eol` e `indentUnit` dizem a um formatador qual quebra de linha e qual indentação o arquivo já usa.

## Nós {#nodes}

```ts
type PugNode = Tag | MixinCall | Text | Comment | Code | Control | Filter
```

O `range` de um nó cobre **a(s) própria(s) linha(s)** dele, não as linhas aninhadas sob ele; essas
estão em `children`. Os nós que aceitam linhas aninhadas são `Tag`, `MixinCall`, `Code` e `Control`.

### `Tag` {#tag}

`a.btn#go(href="/x" :title="t") Go` é analisado como:

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

O texto inline (`p Hi`), o código com buffer (`p= msg`), o filho de uma expansão de bloco
(`li: a`) e as linhas aninhadas vão todos para `children`.

### `MixinCall` {#mixincall}

`+card(title, 2).wide(x="1")`: como uma tag, com `name` (`card`, sem o `+`) e `args`, o range dos
argumentos com seus parênteses, `(title, 2)` (`null` sem eles). Tem `shorthands`, `attributeBlocks`,
`andAttributes` e `children` como uma tag.

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

| `form` | Código-fonte |
|---|---|
| `inline` | `p Hello` (texto depois de uma tag, na mesma linha) |
| `pipe` | `\| Hello` (um nó por linha) |
| `block` | as linhas sob `p.`, `script.`, … |
| `html` | uma linha de HTML literal, `<b>Hello</b>` |

`parts` divide o texto em texto bruto e interpolações. Para `p Hello #{name}, #[b bold] and {{ x }}`:

| Parte | Código-fonte |
|---|---|
| `{ type: 'Raw' }` | `Hello ` |
| `{ type: 'Interpolation', escaped, expression }` | `#{name}` (`!{…}` tem `escaped: false`) |
| `{ type: 'Raw' }` | `, ` |
| `{ type: 'TagInterpolation', tag }` | `#[b bold]`, com `tag` sendo um nó `Tag` completo |
| `{ type: 'Raw' }` | ` and {{ x }}` |

`{{ }}` não é dividido: pertence ao Vue e fica no texto bruto.

### `Comment`, `Code`, `Control`, `Filter` {#comment-code-control-filter}

| Nó | Código-fonte | Campos |
|---|---|---|
| `Comment` | `// shown`, `//- hidden`, e as linhas aninhadas sob eles | `buffered` (`//` é, `//-` não é), `content` |
| `Code` | `- const x = 1`, `= value`, `!= html`, e `p= value` como filho de uma tag | `buffered`, `escaped`, `expression`, `children` |
| `Control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default`, `mixin`, `block`, `append`, `prepend`, `include`, `extends`, `doctype`, `yield` | `keyword`, `head` (o resto da linha), `children` |
| `Filter` | `:markdown-it`, e suas linhas de texto | `name`, `attributeBlocks`, `children` (nós `Text`) |

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

Uma tag pode ter mais de um bloco (`a(x)(y)` é Pug válido), então `attributeBlocks` é uma lista;
normalmente ela está vazia ou tem uma entrada.

| `kind` | Quando | Exemplo |
|---|---|---|
| `string` | o valor **inteiro** é um único literal `'…'` ou `"…"` | `href="/x"` |
| `template` | o valor inteiro é um único literal `` `…` `` | ``title=`Hi ${name}` `` |
| `expression` | qualquer outra coisa: o Pug a compila como JavaScript | `href=url`, `title="a" + b` |

Para o Vue, um valor `string` é o que a diretiva ou o atributo recebe (`:title="t"` faz o bind de
`t`); um valor `expression` é avaliado pelo Pug em tempo de compilação, antes de o Vue vê-lo.

## Linhas {#lines}

`doc.lines` tem uma entrada por linha do código-fonte do trecho analisado. Ela responde "o que há
nesta linha, e com que profundidade ela deve ser indentada", o que um formatador precisa e a árvore
sozinha não diz.

```ts
interface PugLine {
  range: Range          // the line, without its line ending
  indent: Range         // its leading whitespace
  kind: 'node' | 'attribute' | 'paren-close' | 'raw' | 'continuation' | 'blank'
  depth: number
  anchor: number | null // index into lines; see below
}
```

Para este template:

```pug
ul#list
  li(
    v-for="x in xs"
    :key="x"
  ) {{ x }}
  p.
    some text
```

| Linha | `kind` | `depth` |
|---|---|---|
| `ul#list` | `node` | 0 |
| `  li(` | `node` | 1 |
| `    v-for="x in xs"` | `attribute` | 2 |
| `    :key="x"` | `attribute` | 2 |
| `  ) {{ x }}` | `paren-close` | 1 |
| `  p.` | `node` | 1 |
| `    some text` | `raw` | 2 |
| *(depois da última quebra de linha)* | `blank` | 0 |

| `kind` | Linha | `depth` |
|---|---|---|
| `node` | inicia um nó | a profundidade de aninhamento dele |
| `attribute` | dentro de um bloco de atributos de várias linhas | a profundidade da tag + 1 |
| `paren-close` | começa com o `)` que fecha um bloco | a profundidade da tag |
| `raw` | dentro de um bloco de texto, comentário, bloco de código ou filtro | a profundidade do dono + 1 |
| `continuation` | continua uma linha acima (um valor de várias linhas), ou é ignorada depois de um erro | a profundidade dessa linha + 1 |
| `blank` | vazia ou só com espaços em branco | 0 |

`anchor` é definido em linhas que devem manter sua coluna **relativa a outra linha** em vez de
seguir `depth`: as linhas de um bloco de texto depois da primeira (ancoradas a essa primeira linha)
e as linhas de continuação (ancoradas à linha que continuam). Em

```pug
p.
  one
    two
p(title=`a
  b`) x
```

a linha `two` está ancorada à linha `one`, e a segunda linha do valor de `title` à linha acima dela.
Quando um formatador move a linha-âncora, ele move estas pela mesma quantidade.
