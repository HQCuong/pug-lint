---
layout: home
title: ESLint para templates Pug no Vue
description: Lint e formatação de templates Pug em componentes Vue de arquivo único com ESLint. Suas regras vue/* rodam no Pug, o eslint --fix formata o Pug e cada correção é verificada para nunca quebrar um template.
# The hero and sections are written here, not with `hero`/`features` frontmatter, so the home
# page can hold the live --fix example. `markdownStyles: false` drops the .vp-doc wrapper; the
# sections opt back in with the vp-doc class where they render Markdown.
markdownStyles: false
---

<section class="pl-hero">
<div class="pl-hero-text">
<h1 class="home-heading">ESLint para templates Pug no Vue</h1>
<p class="pl-lead">Rode suas regras <code>vue/*</code> em <code>&lt;template lang="pug"&gt;</code>, formate o Pug com <code>eslint --fix</code> e mantenha cada template intacto: toda correção é verificada antes de ser aplicada.</p>
<div class="pl-install vp-doc">

```sh
npm i -D eslint-plugin-pug-vue
```

</div>
<div class="pl-actions">
<a class="pl-button primary" href="/pt/guide/getting-started">Primeiros passos</a>
<a class="pl-button" href="/pt/rules/">Ver as 12 regras</a>
</div>
</div>
<div class="pl-hero-demo">
<FixDemo />
</div>
</section>

<section class="pl-section vp-doc">
<div class="pl-row">
<div class="pl-row-text">

## Suas regras `vue/*`, no Pug {#your-vue-rules-on-pug}

As regras do eslint-plugin-vue rodam em templates Pug com os mesmos nomes e opções de sempre: chaves
ausentes, variáveis não usadas, ordem de atributos, sintaxe obsoleta. As poucas regras que não
funcionam no Pug ficam desativadas, ou silenciadas só dentro de templates Pug, e continuam
verificando seus templates HTML.

[Quais regras rodam no Pug](/pt/guide/vue-rules)

</div>
<div class="pl-row-code">

```vue
<template lang="pug">
ul
  li(v-for="todo in todos") {{ todo.title }}
</template>
```

```txt
3:3  error  Elements in iteration expect to have 'v-bind:key' directives  vue/require-v-for-key
```

</div>
</div>

<div class="pl-row">
<div class="pl-row-text">

## Formatação com `eslint --fix` {#formatting-with-eslint-fix}

Doze pequenas regras `vue-pug/*` formatam o próprio Pug: indentação, espaçamento, vírgulas, aspas
e quebras de linha dos blocos de atributos, e os atalhos `.class` / `#id`. Cada uma tem opções, e
você pode desativar qualquer uma. Sem Prettier e sem um segundo formatador brigando com o ESLint
ao salvar.

[Ver todas as regras](/pt/rules/)

</div>
<div class="pl-row-code">

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

</div>
</div>

<div class="pl-row">
<div class="pl-row-text">

## Correções que não quebram um template {#fixes-that-cannot-break-a-template}

No Pug, a indentação é a estrutura: mova uma linha e a árvore muda. Por isso, antes de o ESLint
gravar uma correção em um template Pug, o plugin a verifica, qualquer que seja a regra de origem:

1. ele analisa o template com a correção aplicada;
2. compara com o original as tags, o aninhamento, as classes, os atributos e cada expressão JavaScript;
3. só aplica a correção se nada mudou. Caso contrário, descarta a correção e mantém o aviso, para você corrigir aquela linha à mão.

[Como o fix guard funciona](/pt/guide/fix-guard)

</div>
<div class="pl-row-code">

```pug
//- the same template to the guard
p(class="intro lead") Hello
p.intro.lead Hello

//- a different one: a class is gone
p.intro Hello
```

<p class="pl-caption">Assim, <code>vue-pug/prefer-shorthand</code> pode reescrever a primeira linha como a segunda, mas uma correção que perde uma classe, ou move uma linha para outro pai, nunca é aplicada.</p>

</div>
</div>
</section>

<section class="pl-section pl-start vp-doc">

## Comece em dois minutos {#start-in-two-minutes}

Requer ESLint 9.15 ou 10 com flat config, eslint-plugin-vue 10 e vue-eslint-parser 10.
[Primeiros passos](/pt/guide/getting-started) mostra a instalação, a configuração e a correção ao salvar no VS Code.
Vindo do eslint-plugin-vue-pug? Leia [o guia de migração](/pt/guide/migration).

</section>
