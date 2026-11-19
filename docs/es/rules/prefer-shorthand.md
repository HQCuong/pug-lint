---
title: vue-pug/prefer-shorthand
description: "vue-pug/prefer-shorthand (eslint-plugin-pug-vue): exige o prohíbe los atajos `.class` / `#id` para los atributos class e id estáticos. Opciones, ejemplos y correcciones."
---

# vue-pug/prefer-shorthand

Exige o prohíbe los atajos `.class` / `#id` para los atributos class e id estáticos.

✅ Activada en `configs.recommended` (en `warn`). 🔧 Corregible con `--fix`.

## Detalles de la regla {#rule-details}

Class e id se configuran por separado, cada uno con `always`, `never` o `ignore`.

- `always` (por defecto para ambos): un atributo `class` o `id` estático se convierte en atajos:
  `p(class="a b")` → `p.a.b`, `p(id="x")` → `p#x`. Los atajos nuevos van después de los existentes
  y un bloque de atributos que queda vacío se elimina.
- `never`: los atajos se convierten en un atributo. Las clases se unen a un atributo `class`
  estático existente; si no, el atributo nuevo se inserta el primero en el primer bloque de
  atributos (o en un bloque nuevo), con el estilo de comillas del primer valor de cadena de ese
  bloque (`"` si no hay ninguno). Una etiqueta que se queda sin nombre y sin atajo recibe `div`.
- `ignore`: ese tipo no se comprueba.

Solo se convierten los atributos estáticos: el nombre es exactamente `class` o `id`, el valor es una
única cadena simple `'…'` o `"…"`, y cada token separado por espacios en blanco es un nombre de
atajo válido de Pug. Si algún token no lo es (`md:flex`, `w-1/2`, `-1`, `1a`), todo el valor se
deja como está. Un valor de `id` debe ser un único token. Los atributos enlazados (`:class`,
`v-bind:id`) nunca se tocan. Una etiqueta que tiene a la vez un atajo de id y un atributo `id` (un
error en Pug) conserva su id tal como está escrito.

Todas las conversiones de una etiqueta se aplican con una sola corrección, asociada al primer informe de la etiqueta.

### Incorrecto {#incorrect}

```vue
<template lang="pug">
p(class="lead") Text
</template>
```

```vue
<template lang="pug">
section(id="intro" class="hero dark")
</template>
```

### Correcto {#correct}

```vue
<template lang="pug">
p.lead Text
</template>
```

```vue
<template lang="pug">
section#intro.hero.dark(class="md:flex w-1/2" :class="{ active }")
</template>
```

## Opciones {#options}

```js
'vue-pug/prefer-shorthand': ['warn', { class: 'always', id: 'always' }]
```

`class` e `id`: `'always'` (por defecto), `'never'` o `'ignore'`.

### Incorrecto con `[{ "class": "never", "id": "always" }]` {#incorrect-with-class-never-id-always}

```vue
<template lang="pug">
p.lead Text
</template>
```

### Correcto con `[{ "class": "never", "id": "always" }]` {#correct-with-class-never-id-always}

```vue
<template lang="pug">
p#intro(class="lead") Text
</template>
```
