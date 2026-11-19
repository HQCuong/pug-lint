---
title: API
description: "Referência da API do pug-lint-parser: parsePug e suas opções, walk, fingerprint, literalSpans e os tipos exportados."
---

# API

```js
import { parsePug, walk, fingerprint, literalSpans } from 'pug-lint-parser'
```

O pacote é somente ESM, não tem dependências e traz seus tipos TypeScript: todos os tipos de nó
abaixo são exportados (`import type { Tag, PugDocument } from 'pug-lint-parser'`).

**Toda posição é um offset no `text` que você passou**: um índice UTF-16, a mesma unidade de
`String.prototype.slice`. Um `Range` é `[start, end)`, então `text.slice(...range)` devolve o
código-fonte de um nó, e `text.slice(0, start) + replacement + text.slice(end)` o edita.

## `parsePug(text, options?)` {#parsepug-text-options}

```ts
function parsePug(text: string, options?: ParseOptions): PugDocument

interface ParseOptions {
  start?: number // default 0
  end?: number   // default text.length
}
```

Analisa `text[start, end)` e devolve o [documento](./syntax-tree#pugdocument). Nunca lança exceção:
o que ele não consegue analisar vira uma entrada em `doc.errors`, e a análise continua na próxima
linha (veja [Erros](./errors)).

`start` e `end` permitem analisar parte de um arquivo maior sem copiá-lo, por exemplo o conteúdo de
um bloco `<template lang="pug">` em um arquivo `.vue`. Os ranges continuam se referindo ao `text`
inteiro:

```js
const sfc = '<template lang="pug">\ndiv\n  p Hi\n</template>\n'
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

doc.range                 // [21, 33]
doc.children[0].name      // { value: 'div', range: [22, 25] }
```

Quando toda linha do trecho tem a mesma indentação, como em um template indentado sob `<template>`,
essa indentação comum é a base: o parser a trata como coluna 0, como o Vue faz antes de compilar o
template. O próprio Pug rejeita um arquivo `.pug` indentado, então o parser é mais tolerante aqui
do que o compilador do Pug.

As quebras de linha podem ser LF ou CRLF; um CR isolado também é lido como quebra de linha. Um BOM
no início não é removido: passe `start: 1` para pulá-lo.

## `walk(doc, visit)` {#walk-doc-visit}

```ts
function walk(
  doc: PugDocument,
  visit: (node: PugNode, parent: PugNode | PugDocument) => void,
): void
```

Chama `visit` para cada nó em ordem de documento (pré-ordem: um nó antes de seus filhos). Ele entra
em `children` e na tag de cada [interpolação de tag](./syntax-tree#text) `#[…]`, cujo pai é o nó
`Text` que a contém.

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

## `fingerprint(doc)` {#fingerprint-doc}

```ts
function fingerprint(doc: PugDocument): string
```

Uma string que resume a **estrutura** de um template: dois templates com o mesmo fingerprint
renderizam a mesma árvore de elementos. O plugin do ESLint compara fingerprints para rejeitar
correções que mudariam um template.

O que ele inclui:

- as tags, chamadas de mixin, textos, comentários, códigos e blocos de controle, e como se aninham;
- o conjunto de classes e ids estáticos de cada tag, **qualquer que seja a forma**: `p(class="a b")`
  e `p.a.b` têm o mesmo fingerprint, `p.a` não;
- o número de outros atributos e o tipo de cada valor (nenhum ou string, expressão, template com `${}`);
- cada trecho de JavaScript que o Pug compila, pelo seu texto exceto a indentação: valores de
  atributo de expressão e com `${}`, `&attributes(…)`, argumentos de mixin, código, cabeçalhos de
  controle e `#{…}`;
- a forma do texto: onde ele é dividido em linhas e interpolações.

O que ele ignora: espaços em branco e largura da indentação, aspas, vírgulas, ordem e nomes dos
atributos, valores de atributo string que não sejam `class` e `id`, maiúsculas e minúsculas do nome
da tag, o conteúdo do texto, a `/` de uma tag autofechada e o `:` de uma expansão de bloco.

```js
fingerprint(parsePug('p(class="a b") Hi')) === fingerprint(parsePug('p.a.b Hi'))  // true
fingerprint(parsePug('p.a Hi')) === fingerprint(parsePug('p.a.b Hi'))             // false
```

O formato da string não faz parte da API: compare fingerprints, não os analise.

## `literalSpans(text, range)` {#literalspans-text-range}

```ts
function literalSpans(text: string, range: [number, number]): [number, number][]
```

Os ranges dos literais de string (`'…'`, `"…"`) e de template (`` `…` ``) dentro de uma expressão
JavaScript em `text[range]`. Use-o para distinguir código de conteúdo de string, por exemplo para
evitar reindentar o interior de um template literal de várias linhas. Um literal sem terminador vai
até o fim de `range`.

```js
const e = 'f("a", `b ${c}`, d)'
literalSpans(e, [0, e.length])              // [[2, 5], [7, 15]]
                                            // '"a"' and '`b ${c}`'
```

## Tipos {#types}

| Tipo | O que é |
|---|---|
| `Range` | `[start: number, end: number]`, offsets em `text` |
| `PugDocument` | O resultado de `parsePug`: [árvore, linhas e erros](./syntax-tree#pugdocument) |
| `PugNode` | `Tag \| MixinCall \| Text \| Comment \| Code \| Control \| Filter` |
| `Tag`, `MixinCall`, `Text`, `Comment`, `Code`, `Control`, `Filter` | [Os nós](./syntax-tree#nodes) |
| `AttributeBlock`, `Attribute`, `AttributeValue` | [Atributos](./syntax-tree#attributes) |
| `TextPart` | `Raw`, `Interpolation` ou `TagInterpolation` dentro de um `Text` |
| `ControlKeyword` | A palavra-chave de um nó `Control` |
| `PugLine` | [Uma linha do código-fonte](./syntax-tree#lines) |
| `PugParseError` | [`{ code, message, offset }`](./errors) |
| `ParseOptions` | `{ start?, end? }` |
