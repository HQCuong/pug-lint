---
title: O fix guard
description: "Como o fix guard impede que o eslint --fix quebre templates Pug: cada correção é analisada de novo e sua estrutura é comparada antes de o ESLint aplicá-la."
---

# O fix guard

Uma correção automática que quebra um template é pior do que nenhuma. O Pug facilita isso: a
indentação é a estrutura, e mover uma linha sem seus filhos muda a árvore. Por isso, toda correção
que toca um template Pug é verificada antes de o ESLint aplicá-la.

## O que é verificado {#what-is-checked}

Para cada template Pug, uma correção só é aplicada se o template ainda for analisado com sucesso
depois dela e sua estrutura continuar a mesma:

- as tags e seu aninhamento;
- o conjunto de classes e ids de cada tag e o número de atributos (então `p(class="a b")` e `p.a.b`
  são iguais, mas perder uma classe não é);
- a forma do texto e das interpolações;
- cada trecho de JavaScript que o Pug compila (valores de atributo sem aspas e com `${}`,
  `&attributes`, argumentos de mixin, código, cabeçalhos de controle, `#{}`), exceto pela
  indentação.

O parser reporta o que o próprio Pug rejeita (por exemplo, mistura de tabs e espaços ou um atributo
repetido), então uma correção que introduziria isso também é descartada.

## Como as correções são aplicadas {#how-fixes-are-applied}

1. Cada correção é verificada isoladamente.
2. As correções que sobraram são verificadas de novo como o conjunto combinado que o ESLint vai aplicar.
3. Uma correção que falha é descartada, e seu problema continua sendo reportado, para você corrigi-lo à mão.

Isso vale para toda regra que corrige arquivos `.vue`, incluindo regras `vue/*` e regras de
terceiros. Enquanto um template tem um erro de sintaxe do Pug, nenhuma correção é aplicada dentro dele.

## Custo {#cost}

O guard analisa o template de novo a cada correção distinta, então seu custo cresce com o número de
correções vezes o tamanho do template. Um template normal leva milissegundos; um template de 3000
linhas totalmente mal formatado pode levar vários segundos. O custo só aparece enquanto o template
tem problemas a corrigir.

## Conjuntos parciais de correções {#partial-fix-sets}

O guard verifica o conjunto completo das correções que sobraram. Se o ESLint aplicar só algumas
delas (`--fix-type`, ou um predicado `fix` personalizado na API do Node.js), esse subconjunto não
foi verificado como conjunto.
