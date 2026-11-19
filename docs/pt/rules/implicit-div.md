---
title: vue-pug/implicit-div
description: "vue-pug/implicit-div (eslint-plugin-pug-vue): exige ou proíbe o nome de tag `div` antes dos atalhos de classe e id. Opções, exemplos e correções."
---

# vue-pug/implicit-div

Exige ou proíbe o nome de tag `div` antes dos atalhos de classe e id.

✅ Ativada em `configs.recommended` (em `warn`). 🔧 Corrigível com `--fix`.

## Detalhes da regra {#rule-details}

No Pug, uma linha que começa com um atalho `.class` ou `#id` é um `div`.

- `always` (padrão): use a forma implícita. Um `div` explícito seguido de um atalho é reportado e a
  correção remove o nome.
- `never`: escreva `div`. Uma tag que começa com um atalho é reportada e a correção insere `div`.

Um `div` sem atalhos (`div`, `div(v-if="ok")`) nunca é reportado. Dois casos em `always` são
reportados sem correção: um `div` dentro de uma interpolação de tag (`#[div.a x]`) e um `div` cujo
primeiro atalho não vem logo depois do nome (`div(a).b`), porque remover o nome deixaria uma linha
que começa com `(`.

### Incorreto {#incorrect}

```vue
<template lang="pug">
div.card Content
</template>
```

```vue
<template lang="pug">
div#app.container
  p Hello
</template>
```

### Correto {#correct}

```vue
<template lang="pug">
.card Content
</template>
```

```vue
<template lang="pug">
#app.container
  div(v-if="ready") Hello
</template>
```

## Opções {#options}

```js
'vue-pug/implicit-div': ['warn', 'always']
```

`'always'` (padrão) ou `'never'`.

### Incorreto com `["never"]` {#incorrect-with-never}

```vue
<template lang="pug">
.card Content
</template>
```

### Correto com `["never"]` {#correct-with-never}

```vue
<template lang="pug">
div.card Content
</template>
```
