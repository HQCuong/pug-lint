---
title: vue-pug/no-multi-spaces
description: "vue-pug/no-multi-spaces (eslint-plugin-pug-vue): proíbe vários espaços entre atributos em blocos de atributos do Pug. Opções, exemplos e correções."
---

# vue-pug/no-multi-spaces

Proíbe vários espaços entre atributos em blocos de atributos do Pug.

✅ Ativada em `configs.recommended` (em `warn`). 🔧 Corrigível com `--fix`.

Substitui `vue/no-multi-spaces` dentro de templates Pug.

## Detalhes da regra {#rule-details}

Uma sequência de dois ou mais espaços ou tabs em uma linha entre dois atributos do mesmo bloco é
reportada, e a correção a troca por um único espaço. Uma vírgula fica com o atributo anterior, então
só o espaço em branco depois da última vírgula do intervalo é medido.

Valores de atributos, o espaço em branco ao lado dos parênteses (veja
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md)) e o texto depois da tag nunca
são tocados.

### Incorreto {#incorrect}

```vue
<template lang="pug">
a(href="/"   target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(type="text",   name="q")
</template>
```

### Correto {#correct}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

```vue
<template lang="pug">
p(title="a   b")   spaced   text
</template>
```

## Opções {#options}

Nenhuma.
