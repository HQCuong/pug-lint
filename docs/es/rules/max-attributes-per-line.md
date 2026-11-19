---
title: vue-pug/max-attributes-per-line
description: "vue-pug/max-attributes-per-line (eslint-plugin-pug-vue): exige un número máximo de atributos por línea en los bloques de atributos de Pug. Opciones, ejemplos y correcciones."
---

# vue-pug/max-attributes-per-line

Exige un número máximo de atributos por línea en los bloques de atributos de Pug.

✅ Activada en `configs.recommended` (en `warn`). 🔧 Corregible con `--fix`.

Sustituye a `vue/max-attributes-per-line` dentro de las plantillas Pug.

## Detalles de la regla {#rule-details}

Los atributos se cuentan por bloque de atributos: `a(w x)(y z)` tiene dos bloques de dos atributos cada uno.

- Un bloque en una sola línea puede contener hasta `singleline` atributos (por defecto `3`). Por
  encima de eso, se informa de cada atributo posterior al primero.
- Un bloque que contiene algún salto de línea, incluido uno dentro de un valor, es multilínea. Cada
  una de sus líneas puede contener hasta `multiline` atributos (por defecto `1`); se informa de los
  sobrantes.

La corrección sustituye el espacio en blanco anterior a un atributo señalado por un salto de línea,
indentado un nivel más que la etiqueta (una coma se queda con el atributo anterior). Los saltos de
línea tras `(` y antes de `)` quedan para [`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md).
Las etiquetas dentro de una interpolación de etiqueta (`#[a(x y z w)]`) no se comprueban: forman
parte de una línea de texto.

### Incorrecto {#incorrect}

```vue
<template lang="pug">
input(type="text" name="q" placeholder="Search" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text" name="q"
  required
)
</template>
```

### Correcto {#correct}

```vue
<template lang="pug">
input(type="text" name="q" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
  placeholder="Search"
  required
)
</template>
```

## Opciones {#options}

```js
'vue-pug/max-attributes-per-line': ['warn', { singleline: 3, multiline: 1 }]
```

- `singleline` (entero ≥ 1, por defecto `3`): el máximo para un bloque en una sola línea.
- `multiline` (entero ≥ 1, por defecto `1`): el máximo por línea en un bloque multilínea.

### Incorrecto con `[{ "singleline": 1 }]` {#incorrect-with-singleline-1}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Correcto con `[{ "singleline": 1 }]` {#correct-with-singleline-1}

```vue
<template lang="pug">
a(href="/") Home
</template>
```
