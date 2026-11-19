---
title: vue-pug/implicit-div
description: "vue-pug/implicit-div (eslint-plugin-pug-vue): exige o prohíbe el nombre de etiqueta `div` antes de los atajos de clase e id. Opciones, ejemplos y correcciones."
---

# vue-pug/implicit-div

Exige o prohíbe el nombre de etiqueta `div` antes de los atajos de clase e id.

✅ Activada en `configs.recommended` (en `warn`). 🔧 Corregible con `--fix`.

## Detalles de la regla {#rule-details}

En Pug, una línea que empieza con un atajo `.class` o `#id` es un `div`.

- `always` (por defecto): usa la forma implícita. Se informa de un `div` explícito seguido de un
  atajo y la corrección elimina el nombre.
- `never`: escribe `div`. Se informa de una etiqueta que empieza con un atajo y la corrección
  inserta `div`.

Nunca se informa de un `div` sin atajos (`div`, `div(v-if="ok")`). Con `always`, dos casos se
informan sin corrección: un `div` dentro de una interpolación de etiqueta (`#[div.a x]`) y un `div`
cuyo primer atajo no sigue directamente al nombre (`div(a).b`), porque eliminar el nombre dejaría
una línea que empieza con `(`.

### Incorrecto {#incorrect}

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

### Correcto {#correct}

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

## Opciones {#options}

```js
'vue-pug/implicit-div': ['warn', 'always']
```

`'always'` (por defecto) o `'never'`.

### Incorrecto con `["never"]` {#incorrect-with-never}

```vue
<template lang="pug">
.card Content
</template>
```

### Correcto con `["never"]` {#correct-with-never}

```vue
<template lang="pug">
div.card Content
</template>
```
