---
title: Como funciona
description: "Como o eslint-plugin-pug-vue faz lint de Pug no Vue: um tokenizer de Pug para o vue-eslint-parser, regras vue/* e vue-pug/*, e um fix guard que verifica cada correção."
---

# Como funciona

O ESLint não lê Pug por conta própria, e o eslint-plugin-vue só conhece templates HTML. O plugin
liga as duas pontas e depois verifica cada correção antes de o ESLint gravá-la.

<HowItWorks />

## 1. Analisar {#_1-parse}

O [vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser) analisa arquivos `.vue` para o
eslint-plugin-vue. Para um template em outra linguagem, ele pede a um *tokenizer* que transforme
essa linguagem nos tokens que receberia de um HTML. O plugin registra um para `lang="pug"` e `lang="jade"`.

O tokenizer analisa o template com o [`pug-lint-parser`](/pt/parser/) e emite uma tag de abertura,
uma tag de fechamento, texto e tokens `{{ }}` para cada elemento Pug, nas posições exatas do código
Pug. O vue-eslint-parser monta com eles sua AST de template de sempre, então as regras `vue/*`
apontam para a linha e a coluna certas no seu Pug.

Um erro de sintaxe do Pug vira um erro de análise reportado por `vue/no-parsing-error`.

## 2. Lint {#_2-lint}

Dois tipos de regra rodam sobre o mesmo arquivo:

- **Regras `vue/*`** do eslint-plugin-vue leem a AST do template do Vue, como fariam em um template
  HTML: chaves ausentes, variáveis não usadas, ordem de atributos, sintaxe obsoleta.
- **Regras `vue-pug/*`** leem diretamente a árvore de sintaxe do Pug gerada pelo `pug-lint-parser`.
  Essa árvore guarda o que a AST do Vue perde: indentação, vírgulas, aspas, parênteses e os atalhos
  `.class` e `#id`. É aqui que as regras de formatação trabalham.

## 3. Verificar {#_3-check}

O plugin envolve o processor do eslint-plugin-vue, que vê todas as mensagens antes de o ESLint
usá-las:

- **Suprimir.** Algumas regras `vue/*` não funcionam no Pug: elas reportam falsos problemas, ou
  suas correções escreveriam HTML em um template Pug. Suas mensagens são descartadas quando estão
  dentro de um template Pug, e só ali, então continuam verificando seus templates HTML. As poucas
  regras que travam no Pug são desativadas. [As listas](./vue-rules).
- **Fix guard.** Toda correção que toca um template Pug é aplicada a uma cópia do arquivo, que o
  `pug-lint-parser` analisa de novo. O plugin compara a estrutura antes e depois: as tags e seu
  aninhamento, classes e ids, número de atributos, a forma do texto e cada expressão JavaScript. Se
  algo mudou, ou se a cópia deixou de ser analisável, a correção é descartada e o aviso permanece.
  [Detalhes](./fix-guard).

O ESLint então aplica as correções que sobraram, com `eslint --fix` ou com a correção ao salvar do
seu editor.

## Os dois pacotes {#the-two-packages}

| Pacote | Função |
|---|---|
| [`eslint-plugin-pug-vue`](https://www.npmjs.com/package/eslint-plugin-pug-vue) | O plugin do ESLint: o tokenizer, as regras `vue-pug/*`, o processor e as configs. O que você instala. |
| [`pug-lint-parser`](/pt/parser/) | O parser de Pug sobre o qual tudo isso é construído. Ele não sabe nada de ESLint nem de Vue, e você pode usá-lo sozinho. |
