---
title: Sintaxe do Pug não suportada
description: "As formas de Pug que o pug-lint-parser reporta como não suportadas ou analisa de forma diferente do compilador do Pug, e como reescrevê-las."
---

# Sintaxe reportada como `unsupported-syntax` {#syntax-reported-as-unsupported-syntax}

O parser nunca lança exceção. Uma entrada que ele não modela vira um erro `unsupported-syntax` no
primeiro offset que ele não consegue ler, e o resto dessa linha é ignorado. Este arquivo lista
todas as origens conhecidas desse erro. Qualquer outra coisa que produza `unsupported-syntax` é um bug.

"Invalid Pug" marca formas que o próprio Pug rejeita; elas estão listadas porque o parser também as
reporta com esse código.

## Linhas {#lines}

| Forma | Exemplo | Observações |
| --- | --- | --- |
| Nome de tag interpolado | `#{tag} text`, `#{tag}/` | |
| Nome de mixin interpolado | `+#{name}()` | `+ name` (espaços depois de `+`) é uma chamada de mixin. |
| Bloco de texto sem tag | uma linha só com `.`, com linhas de texto aninhadas sob ela | O Pug põe o texto no pai. Use linhas com `\|`. |
| Interpolação de tag ou mustache no início da linha | `#[b x] y`, `{{ x }}` | Use `\| #[b x] y` / `\| {{ x }}`. |
| Qualquer outra coisa que não inicie uma construção do Pug | `)`, `@x`, `.5` | |
| Linhas aninhadas sob texto com pipe | `\| a` com um `p` indentado abaixo | Invalid Pug. Reportado uma vez, na primeira linha aninhada; as linhas aninhadas são ignoradas e formam uma região de recuperação de erro (`doc.lines` kind `continuation`). Linhas aninhadas sob HTML literal (`<ul>`) são válidas: o Pug as torna irmãs, e o parser também. |
| Linhas aninhadas sob código com buffer | `= x` ou `!= x` com um `p` indentado abaixo | Invalid Pug. Reportado e recuperado como sob texto com pipe. Sob `p= x`, as linhas são filhas de `p`, como no Pug. |

## Depois do início de uma tag ou chamada de mixin {#after-a-tag-or-mixin-call-head}

| Forma | Exemplo | Observações |
| --- | --- | --- |
| Código sem buffer depois de uma tag | `p- x` | |
| `.` seguido de mais conteúdo na linha | `p. text`, `p.: a` | Invalid Pug. |
| Bloco de texto depois de uma chamada de mixin | `+m.` | |
| Expansão de bloco depois de uma chamada de mixin | `+m: p` | `MixinCall` não tem o campo `expansion`. Como filho, funciona: `li: +m`. |
| `/` depois de uma chamada de mixin | `+m/` | |
| Expansão de bloco depois de `/` | `img/: x` | Invalid Pug. |
| `:` não seguido de um espaço e de um filho | `li:`, `li(x):b`, `when 1:` | Invalid Pug. |
| Filho de expansão que não é uma tag nem uma chamada de mixin | `li: \| x`, `li: <b>x</b>`, `li: = x`, `li: // c`, `li: if x`, `when 1: each x in y` | Uma palavra-chave de controle nunca é lida como nome de tag aqui. |
| Tag seguida de um filtro inline | `p: :markdown text` | |

## Cabeçalhos de controle {#control-heads}

| Forma | Exemplo | Observações |
| --- | --- | --- |
| Expansão de bloco depois de um condicional ou laço | `else: p`, `else : p`, `if x: p`, `unless x: p`, `else if x: p`, `while x: p`, `case x: p`, `each a in b: p`, `for a in b: p` | Invalid Pug. Reportado no primeiro `:` do cabeçalho fora de strings e colchetes que não fecha um `?` de nível superior (então `if a ? b : c` e `each v in {a: 1}` são válidos). A expansão funciona depois de `when` e `default`: `when 1: p a`. |

## Filtros {#filters}

| Forma | Exemplo | Observações |
| --- | --- | --- |
| Qualquer coisa além de texto depois do cabeçalho do filtro | `:a(x):b`, `:md.x` | Filtros aninhados só são lidos como `:a:b(attrs)`, com os atributos depois do último nome. |

## Interpolação de tag `#[…]` {#tag-interpolation}

| Forma | Exemplo | Observações |
| --- | --- | --- |
| Não começa com uma tag | `#[+m]`, `#[\| x]`, `#[- x]`, `#[:cdata x]` | Chamadas de mixin, texto, código e filtros não são lidos dentro de `#[…]`. |
| Cabeçalho seguido de qualquer coisa além de texto, código `=`/`!=` ou `: filho` | `#[p.]`, `#[p- x]`, `#[img/: x]` | |

## Analisado sem erro, mas não como o Pug faz {#parsed-without-an-error-but-not-as-pug-does}

Encontrado pelo oráculo diferencial (`tests/oracle`, Task 17).

| Forma | Exemplo | Observações |
| --- | --- | --- |
| Comentário depois de um nome de bloco | `block content // c` | O Pug encerra o nome em `//` e faz do resto um comentário irmão, que também recebe as linhas aninhadas. O parser o mantém no cabeçalho do `block`. |
| Atributo ou id duplicado | `a(x=1 x=2)`, `#a#b` | O Pug os rejeita; o parser os aceita. |
| `else` vazio depois de `each` | `each x in y` … `else` sem nada aninhado | O Pug o rejeita; o parser o aceita. |
