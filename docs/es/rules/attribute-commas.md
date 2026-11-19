---
title: vue-pug/attribute-commas
description: "vue-pug/attribute-commas (eslint-plugin-pug-vue): exige o prohíbe comas entre atributos en los bloques de atributos de Pug. Opciones, ejemplos y correcciones."
---

# vue-pug/attribute-commas

Exige o prohíbe comas entre atributos en los bloques de atributos de Pug.

✅ Activada en `configs.recommended` (en `warn`). 🔧 Corregible con `--fix`.

## Detalles de la regla {#rule-details}

Pug admite atributos separados por espacios en blanco, por comas o por ambos. Esta regla hace que la
elección sea coherente:

- `never` (por defecto): se informa de cada coma de un bloque de atributos y se elimina.
- `always`: exactamente una coma entre cada par de atributos. Una coma que falta se inserta justo
  después del atributo anterior; las comas sobrantes en el mismo hueco se eliminan.

Con cualquiera de las dos opciones, se informa de una coma antes del primer atributo o después del
último. Cuando eliminar una coma pegaría dos atributos (`a(x="1",y="2")`), la corrección pone un
espacio en su lugar. La regla solo toca los caracteres de coma: con `always`, el espacio en blanco
antes de una coma (`x="1" , y="2"`) se deja como está, y ninguna otra regla lo normaliza en la v1.

### Incorrecto {#incorrect}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text",
  name="q"
)
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
input(
  type="text"
  name="q"
)
</template>
```

## Opciones {#options}

```js
'vue-pug/attribute-commas': ['warn', 'never']
```

`'never'` (por defecto) o `'always'`.

### Incorrecto con `["always"]` {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Correcto con `["always"]` {#correct-with-always}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```
