---
title: vue-pug/no-multi-spaces
description: "vue-pug/no-multi-spaces (eslint-plugin-pug-vue): prohíbe los espacios múltiples entre atributos en los bloques de atributos de Pug. Opciones, ejemplos y correcciones."
---

# vue-pug/no-multi-spaces

Prohíbe los espacios múltiples entre atributos en los bloques de atributos de Pug.

✅ Activada en `configs.recommended` (en `warn`). 🔧 Corregible con `--fix`.

Sustituye a `vue/no-multi-spaces` dentro de las plantillas Pug.

## Detalles de la regla {#rule-details}

Se informa de una secuencia de dos o más espacios o tabuladores en una línea entre dos atributos del
mismo bloque, y la corrección la sustituye por un solo espacio. Una coma se queda con el atributo
anterior, así que solo se mide el espacio en blanco posterior a la última coma del hueco.

Los valores de atributo, el espacio en blanco junto a los paréntesis (consulta
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md)) y el texto tras la etiqueta
nunca se tocan.

### Incorrecto {#incorrect}

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

### Correcto {#correct}

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

## Opciones {#options}

Ninguna.
