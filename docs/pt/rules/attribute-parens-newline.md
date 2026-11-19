---
title: vue-pug/attribute-parens-newline
description: "vue-pug/attribute-parens-newline (eslint-plugin-pug-vue): exige quebras de linha depois de `(` e antes de `)` em blocos de atributos do Pug de várias linhas. Opções, exemplos e correções."
---

# vue-pug/attribute-parens-newline

Exige quebras de linha depois de `(` e antes de `)` em blocos de atributos do Pug de várias linhas.

✅ Ativada em `configs.recommended` (em `warn`). 🔧 Corrigível com `--fix`.

Substitui `vue/first-attribute-linebreak` e `vue/html-closing-bracket-newline` dentro de templates
Pug.

## Detalhes da regra {#rule-details}

Um bloco de atributos tem várias linhas quando dois de seus atributos começam em linhas diferentes.

- `multiline: 'always'` (padrão): um bloco de várias linhas precisa de uma quebra de linha logo
  depois de `(` e logo antes de `)`. A correção insere a quebra de linha com o fim de linha e a
  unidade de indentação do próprio template (o primeiro atributo um nível abaixo da tag, `)` no
  nível da tag).
- `multiline: 'never'`: um bloco de várias linhas não deve ter essas quebras de linha.

Um bloco que não tem várias linhas (incluindo um bloco com um único atributo) também não deve
tê-las. Espaços na mesma linha ao lado dos parênteses pertencem a
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md); um bloco vazio é mantido como está.

### Incorreto {#incorrect}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```

```vue
<template lang="pug">
input(
  type="text"
)
</template>
```

### Correto {#correct}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

```vue
<template lang="pug">
input(type="text" name="q")
</template>
```

## Opções {#options}

```js
'vue-pug/attribute-parens-newline': ['warn', { multiline: 'always' }]
```

`multiline`: `'always'` (padrão) ou `'never'`.

### Incorreto com `[{ "multiline": "never" }]` {#incorrect-with-multiline-never}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

### Correto com `[{ "multiline": "never" }]` {#correct-with-multiline-never}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```
