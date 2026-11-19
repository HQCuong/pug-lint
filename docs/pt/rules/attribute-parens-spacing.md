---
title: vue-pug/attribute-parens-spacing
description: "vue-pug/attribute-parens-spacing (eslint-plugin-pug-vue): impõe espaçamento consistente dentro dos parênteses de blocos de atributos do Pug. Opções, exemplos e correções."
---

# vue-pug/attribute-parens-spacing

Impõe espaçamento consistente dentro dos parênteses de blocos de atributos do Pug.

✅ Ativada em `configs.recommended` (em `warn`). 🔧 Corrigível com `--fix`.

Substitui `vue/html-closing-bracket-spacing`, que trava em templates Pug e é desativada por
`configs.base`.

## Detalhes da regra {#rule-details}

A regra verifica o espaço em branco logo depois de `(` e logo antes de `)` na mesma linha:

- `never` (padrão): nenhum espaço em branco ali. A correção o remove.
- `always`: pelo menos um espaço ali. A correção insere um.

Um lado cujo espaço em branco contém uma quebra de linha pertence a
[`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) e é mantido como está, assim
como um bloco vazio ou só com espaço em branco.

### Incorreto {#incorrect}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```

```vue
<template lang="pug">
input( type="text" name="q")
</template>
```

### Correto {#correct}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

## Opções {#options}

```js
'vue-pug/attribute-parens-spacing': ['warn', 'never']
```

`'never'` (padrão) ou `'always'`.

### Incorreto com `["always"]` {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

### Correto com `["always"]` {#correct-with-always}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```
