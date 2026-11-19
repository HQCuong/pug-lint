---
title: vue-pug/attribute-parens-newline
description: "vue-pug/attribute-parens-newline (eslint-plugin-pug-vue): exige saltos de línea tras `(` y antes de `)` en los bloques de atributos multilínea de Pug. Opciones, ejemplos y correcciones."
---

# vue-pug/attribute-parens-newline

Exige saltos de línea tras `(` y antes de `)` en los bloques de atributos multilínea de Pug.

✅ Activada en `configs.recommended` (en `warn`). 🔧 Corregible con `--fix`.

Sustituye a `vue/first-attribute-linebreak` y `vue/html-closing-bracket-newline` dentro de las
plantillas Pug.

## Detalles de la regla {#rule-details}

Un bloque de atributos es multilínea cuando dos de sus atributos empiezan en líneas distintas.

- `multiline: 'always'` (por defecto): un bloque multilínea necesita un salto de línea justo después
  de `(` y justo antes de `)`. La corrección inserta el salto de línea con el final de línea y la
  unidad de indentación propios de la plantilla (el primer atributo un nivel más profundo que la
  etiqueta, `)` al nivel de la etiqueta).
- `multiline: 'never'`: un bloque multilínea no debe tener esos saltos de línea.

Un bloque que no es multilínea (incluido un bloque con un solo atributo) tampoco debe tenerlos. Los
espacios en la misma línea junto a los paréntesis corresponden a
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md); un bloque vacío se deja como
está.

### Incorrecto {#incorrect}

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

### Correcto {#correct}

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

## Opciones {#options}

```js
'vue-pug/attribute-parens-newline': ['warn', { multiline: 'always' }]
```

`multiline`: `'always'` (por defecto) o `'never'`.

### Incorrecto con `[{ "multiline": "never" }]` {#incorrect-with-multiline-never}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

### Correcto con `[{ "multiline": "never" }]` {#correct-with-multiline-never}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```
