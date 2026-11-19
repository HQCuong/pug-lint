---
title: vue-pug/attribute-equals-spacing
description: "vue-pug/attribute-equals-spacing (eslint-plugin-pug-vue): prohíbe espacios alrededor de `=` y `!=` en los atributos de Pug. Opciones, ejemplos y correcciones."
---

# vue-pug/attribute-equals-spacing

Prohíbe espacios alrededor de `=` y `!=` en los atributos de Pug.

✅ Activada en `configs.recommended` (en `warn`). 🔧 Corregible con `--fix`.

Sustituye a `vue/no-spaces-around-equal-signs-in-attribute` dentro de las plantillas Pug.

## Detalles de la regla {#rule-details}

El espacio en blanco entre el nombre de un atributo y su `=` / `!=`, y entre el operador y el
valor, debe estar vacío. La corrección lo elimina. Un hueco que contiene un salto de línea se deja
como está.

### Incorrecto {#incorrect}

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

### Correcto {#correct}

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

## Opciones {#options}

Ninguna.
