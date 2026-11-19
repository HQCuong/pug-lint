---
title: pug-lint-parser
description: "pug-lint-parser: um parser de Pug para ferramentas de lint e formatação, com ranges exatos no código-fonte e recuperação de erros. Nunca lança exceção e não tem dependências."
---

# pug-lint-parser

Um parser de árvore de sintaxe concreta (CST) para templates Pug, feito para ferramentas de lint e
formatação. É o parser por trás do [`eslint-plugin-pug-vue`](https://github.com/HQCuong/pug-lint/tree/main/packages/eslint-plugin).

- **Nunca lança exceção.** Uma entrada que ele não consegue analisar vira uma entrada em `errors`, e
  a análise continua na próxima linha.
- **Ranges exatos no código-fonte.** Todo nó, atributo, valor, atalho, vírgula e linha tem um range
  `[start, end)`: offsets UTF-16 no texto que você passa, então você pode fatiar o código-fonte ou
  montar uma edição mínima sem ajustar posições.
- **Analisa um trecho no lugar.** `parsePug(text, { start, end })` analisa só `text[start, end)` (por
  exemplo o conteúdo de um bloco `<template lang="pug">`); os ranges continuam se referindo ao
  `text` inteiro.
- **Preserva as quebras de linha.** LF e CRLF são tratados; `doc.eol` é a primeira quebra de linha encontrada.
- Sem dependências em tempo de execução. Somente ESM. Node.js `^20.19.0 || ^22.13.0 || >=24`.

## Uso {#usage}

```js
import { parsePug, walk } from 'pug-lint-parser'

const text = 'ul#list\n  li.item(v-for="x in xs" :key="x") {{ x }}\n'
const doc = parsePug(text)

console.log(doc.errors) // []
walk(doc, (node) => {
  if (node.type === 'Tag') console.log(node.name?.value ?? 'div', text.slice(...node.range))
})
// ul ul#list
// li li.item(v-for="x in xs" :key="x") {{ x }}
```

## API {#api}

A referência completa, com todos os tipos de nó, está no site: [API](https://pug-lint.dev/pt/parser/api),
[árvore de sintaxe](https://pug-lint.dev/pt/parser/syntax-tree), [erros](https://pug-lint.dev/pt/parser/errors) e
[receitas](https://pug-lint.dev/pt/parser/recipes).

- `parsePug(text, options?)` → `PugDocument`. `options.start` / `options.end` limitam a análise a
  esse range de `text`.
- `walk(doc, visit)`: chama `visit(node, parent)` para cada nó em ordem de documento, incluindo as
  tags dentro de interpolações de tag (`#[…]`).
- `fingerprint(doc)` → `string`: um resumo estrutural da árvore (tags e seu aninhamento, conjuntos
  de classes e ids, número de atributos, a forma do texto e das interpolações). Ele ignora espaços
  em branco, aspas, ordem dos atributos, nomes e valores de atributos que não sejam `class` e `id`
  estáticos, maiúsculas e minúsculas do nome da tag, o conteúdo do texto e o conteúdo de código e
  cabeçalhos de controle, então `p(class="a b")` e `p.a.b` têm o mesmo fingerprint. O plugin do
  ESLint compara fingerprints para rejeitar correções que mudam a estrutura de um template.
- `literalSpans(text, range)` → os ranges dos literais de string e de template em uma expressão
  JavaScript.
- Tipos para todos os nós: `PugDocument`, `PugNode`, `Tag`, `AttributeBlock`, `Attribute`,
  `AttributeValue`, `Text`, `Comment`, `Code`, `Control`, `MixinCall`, `Filter`, `PugLine`,
  `PugParseError` e mais (veja `src/ast.ts`).

Um `PugDocument` tem `children` (a árvore), `errors` (`{ code, message, offset }`), `lines` (uma
entrada por linha do código-fonte, com seu range de indentação, kind e profundidade lógica), `eol`
e `indentUnit`.

## Sintaxe não suportada {#unsupported-syntax}

Algumas formas de Pug são reportadas com o código de erro `unsupported-syntax`, e algumas são
analisadas sem erro, mas de forma diferente do Pug. Elas estão listadas em
[docs/unsupported-syntax.md](https://github.com/HQCuong/pug-lint/blob/main/packages/pug-parser/docs/unsupported-syntax.md).

## Licença {#license}

MIT
