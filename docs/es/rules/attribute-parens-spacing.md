---
title: vue-pug/attribute-parens-spacing
description: "vue-pug/attribute-parens-spacing (eslint-plugin-pug-vue): exige un espaciado coherente dentro de los paréntesis de los bloques de atributos de Pug. Opciones, ejemplos y correcciones."
---

# vue-pug/attribute-parens-spacing

Exige un espaciado coherente dentro de los paréntesis de los bloques de atributos de Pug.

✅ Activada en `configs.recommended` (en `warn`). 🔧 Corregible con `--fix`.

Sustituye a `vue/html-closing-bracket-spacing`, que falla con las plantillas Pug y está desactivada
por `configs.base`.

## Detalles de la regla {#rule-details}

La regla comprueba el espacio en blanco justo después de `(` y justo antes de `)` en la misma línea:

- `never` (por defecto): sin espacio en blanco ahí. La corrección lo elimina.
- `always`: al menos un espacio ahí. La corrección inserta uno.

Un lado cuyo espacio en blanco contiene un salto de línea corresponde a
[`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) y se deja como está, igual que
un bloque vacío o formado solo por espacios en blanco.

### Incorrecto {#incorrect}

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

### Correcto {#correct}

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

## Opciones {#options}

```js
'vue-pug/attribute-parens-spacing': ['warn', 'never']
```

`'never'` (por defecto) o `'always'`.

### Incorrecto con `["always"]` {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

### Correcto con `["always"]` {#correct-with-always}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```
