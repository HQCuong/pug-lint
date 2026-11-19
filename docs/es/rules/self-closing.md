---
title: vue-pug/self-closing
description: "vue-pug/self-closing (eslint-plugin-pug-vue): exige o prohíbe la `/` de autocierre de una etiqueta. Opciones, ejemplos y correcciones."
---

# vue-pug/self-closing

Exige o prohíbe la `/` de autocierre de una etiqueta.

✅ Activada en `configs.recommended` (en `warn`). 🔧 Corregible con `--fix`.

Sustituye a `vue/html-self-closing` y `vue/html-end-tags` dentro de las plantillas Pug.

## Detalles de la regla {#rule-details}

- `never` (por defecto): se informa de cada `/` tras una etiqueta (`img/`, `MyIcon/`).
- `always-components`: un componente (un nombre de etiqueta con una letra mayúscula o un guion) que
  no tiene contenido debe terminar con `/`, y la corrección la añade. Ninguna otra etiqueta debe
  tenerla. Un componente que ya tiene `/` se deja como está.

Pug renderiza `p/ text` como `<p/>` seguido del texto, y rechaza `/` en una etiqueta con líneas
anidadas. Por eso la corrección elimina una `/` solo cuando nada la sigue en su línea (ni siquiera
un espacio) y la etiqueta no tiene líneas anidadas aparte de comentarios sin salida (`//-`). En
caso contrario, la `/` se informa sin corrección. A una etiqueta con cualquier contenido (texto,
código, `.`, líneas anidadas, incluso un espacio al final) nunca se le añade una `/`.

### Incorrecto {#incorrect}

```vue
<template lang="pug">
img(src="logo.png")/
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")/
</template>
```

### Correcto {#correct}

```vue
<template lang="pug">
img(src="logo.png")
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")
  br
</template>
```

## Opciones {#options}

```js
'vue-pug/self-closing': ['warn', 'never']
```

`'never'` (por defecto) o `'always-components'`.

### Incorrecto con `["always-components"]` {#incorrect-with-always-components}

```vue
<template lang="pug">
MyIcon(name="star")
</template>
```

### Correcto con `["always-components"]` {#correct-with-always-components}

```vue
<template lang="pug">
div
  MyIcon(name="star")/
  my-icon/
  MyButton Save
  img(src="logo.png")
</template>
```
