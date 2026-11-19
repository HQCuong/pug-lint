---
title: Erros
description: "Códigos de erro do pug-lint-parser com exemplos, como o parser se recupera depois de um erro e como transformar um offset em linha e coluna."
---

# Erros

O `parsePug` nunca lança exceção. O que ele não consegue analisar vira uma entrada em
`doc.errors`, e o resto do template continua sendo analisado:

```ts
interface PugParseError {
  code: string     // one of the codes below
  message: string  // for people; may change between versions
  offset: number   // where the problem is, as an offset into text
}
```

Compare pelo `code`, não pelo `message`. Para mostrar linha e coluna, conte a partir do offset:

```js
const before = text.slice(0, error.offset)
const line = before.split('\n').length                    // 1-based
const column = error.offset - before.lastIndexOf('\n')    // 1-based
```

## Recuperação {#recovery}

Um erro não interrompe a análise. O parser pula até o fim da construção inválida, ou até o fim da
linha, e segue com a próxima linha. As linhas que não podem ser posicionadas depois de um erro,
como linhas aninhadas sob uma construção que não pode ter filhos, ficam em `doc.lines` com o kind
`continuation`, e nenhum nó é criado para elas.

```js
parsePug('div\n  p(class="a)\n  span ok\n  li(a=1 a=2)\n').errors
// [
//   { code: 'unterminated-string', message: 'Unterminated string', offset: 14 },
//   { code: 'duplicate-attribute', message: 'Duplicate attribute "a"', offset: 37 },
// ]
```

O plugin do ESLint não aplica nenhuma correção dentro de um template que tem erros, já que não
consegue verificá-las.

## Códigos {#codes}

| `code` | Exemplo | Mensagem |
|---|---|---|
| `unterminated-string` | `p(title="hi) x` | Unterminated string |
| `unclosed-attributes` | `p(title="hi"` | Attribute block is not closed with ")" |
| `unclosed-arguments` | `+card(1, 2` | Mixin arguments are not closed with ")" |
| `missing-attribute-value` | `p(title=) x` | Expected a value after the operator |
| `duplicate-attribute` | `p(a="1" a="2")` | Duplicate attribute "a" |
| `unexpected-character` | `p(a!b) x` | Expected "=" after "!" |
| `unbalanced-key` | `p([a="1") x` | Unclosed "[" in an attribute key |
| `bad-escape` | `p(a="\x")` | Invalid escape sequence in a JavaScript string |
| `inconsistent-indentation` | uma linha indentada com tab entre linhas indentadas com espaços | Invalid indentation, you can use tabs or spaces but not both |
| `unterminated-interpolation` | `p Hi #{name` | Interpolation is not closed with "}" |
| `unsupported-syntax` | `#{tag} x` | Unsupported syntax: "#{tag} x" |

Cada código cobre uma família de problemas; `unexpected-character`, `unbalanced-key`,
`inconsistent-indentation` e `unsupported-syntax` têm várias mensagens.

Eles correspondem ao que o compilador do Pug rejeita, com uma diferença deliberada: uma quebra de
linha dentro de um valor de atributo `'…'` ou `"…"` é `unterminated-string`, como em JavaScript. Use
crases para valores de várias linhas.

## `unsupported-syntax` {#unsupported-syntax}

Este código marca Pug válido que o parser não trata, como nomes de tag interpolados (`#{tag}`) ou
blocos de texto sem tag. Algumas formas também são analisadas sem erro, mas de maneira diferente do
Pug. As duas listas estão em [Sintaxe do Pug não suportada](/pt/guide/unsupported-syntax).
