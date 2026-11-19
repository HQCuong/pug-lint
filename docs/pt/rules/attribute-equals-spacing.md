---
title: vue-pug/attribute-equals-spacing
description: "vue-pug/attribute-equals-spacing (eslint-plugin-pug-vue): proíbe espaços ao redor de `=` e `!=` em atributos do Pug. Opções, exemplos e correções."
---

# vue-pug/attribute-equals-spacing

Proíbe espaços ao redor de `=` e `!=` em atributos do Pug.

✅ Ativada em `configs.recommended` (em `warn`). 🔧 Corrigível com `--fix`.

Substitui `vue/no-spaces-around-equal-signs-in-attribute` dentro de templates Pug.

## Detalhes da regra {#rule-details}

O espaço em branco entre o nome de um atributo e seu `=` / `!=`, e entre o operador e o valor, deve
ser vazio. A correção o remove. Um intervalo que contém uma quebra de linha é mantido como está.

### Incorreto {#incorrect}

```vue
<template lang="pug">
a(href = "/") Home
</template>
```

```vue
<template lang="pug">
input(:value= "query" @input ="update")
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
div(v-html!="html" :title="title")
</template>
```

## Opções {#options}

Nenhuma.
