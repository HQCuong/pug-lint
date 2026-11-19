---
title: vue-pug/attribute-quotes
description: "vue-pug/attribute-quotes (eslint-plugin-pug-vue): exige un estilo de comillas coherente en los valores de atributo de Pug. Opciones, ejemplos y correcciones."
---

# vue-pug/attribute-quotes

Exige un estilo de comillas coherente en los valores de atributo de Pug.

✅ Activada en `configs.recommended` (en `warn`). 🔧 Corregible con `--fix`.

Sustituye a `vue/html-quotes` dentro de las plantillas Pug. El corrector de esa regla escapa las
comillas interiores como `&quot;`, lo cual es incorrecto en Pug (un valor de atributo es una
expresión JavaScript), y no sabe que los acentos graves son comillas válidas en Pug.

## Detalles de la regla {#rule-details}

Se informa de un valor que es una única cadena `'…'` o `"…"` con el otro estilo de comillas. La
corrección solo intercambia los dos caracteres de comillas y nunca vuelve a escapar nada: cuando el
valor contiene las comillas de destino o una barra invertida, se informa sin corrección.

Los valores con acentos graves se conservan por defecto. Con `backticks: 'convert'`, un valor con
acentos graves se informa y se corrige solo cuando está en una línea y no contiene `${}`, ni
comillas, ni barras invertidas; los demás valores con acentos graves se dejan como están. Los
valores que no son un único literal (`x`, `a + 'b'`, `{ a: 1 }`) nunca se tocan.

### Incorrecto {#incorrect}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

```vue
<template lang="pug">
p(title='Say "hi"') Hello
</template>
```

El segundo ejemplo se informa sin corrección: intercambiar las comillas exigiría escapar.

### Correcto {#correct}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

```vue
<template lang="pug">
p(:class=`card` :title="'Hi ' + name" :data-id=id) Hello
</template>
```

## Opciones {#options}

```js
'vue-pug/attribute-quotes': ['warn', 'double', { backticks: 'keep' }]
```

- Primera opción: `'double'` (por defecto) o `'single'`.
- `backticks`: `'keep'` (por defecto) o `'convert'`.

### Incorrecto con `["single"]` {#incorrect-with-single}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

### Correcto con `["single"]` {#correct-with-single}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

### Incorrecto con `["double", { "backticks": "convert" }]` {#incorrect-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello`) Hi
</template>
```

### Correcto con `["double", { "backticks": "convert" }]` {#correct-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello ${name}`) Hi
</template>
```
