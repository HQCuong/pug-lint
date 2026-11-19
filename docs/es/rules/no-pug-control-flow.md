---
title: vue-pug/no-pug-control-flow
description: "vue-pug/no-pug-control-flow (eslint-plugin-pug-vue): prohíbe las construcciones de Pug en tiempo de compilación (control de flujo, código, mixins, interpolación `#{}`, includes). Opciones, ejemplos y correcciones."
---

# vue-pug/no-pug-control-flow

Prohíbe las construcciones de Pug en tiempo de compilación (control de flujo, código, mixins, interpolación `#{}`, includes).

No activada en `configs.recommended`. No corregible.

## Detalles de la regla {#rule-details}

Los condicionales, bucles, código, mixins e interpolación `#{}` de Pug se ejecutan una sola vez,
cuando se compila la plantilla. Vue nunca los ve, así que no son reactivos, y las reglas `vue/*` no
ven la propia lógica de Pug. Esta regla los señala para que las plantillas usen en su lugar
directivas y enlaces de Vue. Cada construcción pertenece a una categoría:

| Categoría | Informa de |
|---|---|
| `control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default` |
| `code` | `- code`, `= expression`, `!= expression`, `p= expression` |
| `mixin` | definiciones de mixin (`mixin name`) y llamadas (`+name`) |
| `interpolation` | `#{…}` y `!{…}` en el texto |
| `include` | `include`, `extends`, `block`, `append`, `prepend`, `yield`, `doctype` |

### Incorrecto {#incorrect}

```vue
<template lang="pug">
ul
  each item in items
    li= item
</template>
```

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Correcto {#correct}

```vue
<template lang="pug">
ul
  li(v-for="item in items" :key="item") {{ item }}
</template>
```

```vue
<template lang="pug">
p(v-if="name") Hello {{ name }}
</template>
```

## Opciones {#options}

```js
'vue-pug/no-pug-control-flow': ['warn', { allow: [] }]
```

`allow`: categorías de las que no se informa, cualquiera de `'control'`, `'code'`, `'mixin'`,
`'interpolation'`, `'include'` (por defecto `[]`).

### Correcto con `[{ "allow": ["interpolation"] }]` {#correct-with-allow-interpolation}

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Incorrecto con `[{ "allow": ["interpolation"] }]` {#incorrect-with-allow-interpolation}

```vue
<template lang="pug">
p= name
</template>
```

## Migrar desde `eslint-plugin-vue-pug` {#migrating-from-eslint-plugin-vue-pug}

`eslint-plugin-vue-pug` tiene una regla con el mismo id, `vue-pug/no-pug-control-flow`. Diferencias:

- Su esquema está vacío: no admite opciones e informa siempre de todas las construcciones que
  conoce. Esta regla admite `{ allow: [...] }` (véase arriba). Cualquier opción que pasaras a la
  regla antigua era rechazada por ESLint, así que una configuración existente sin opciones sigue
  funcionando.
- La regla antigua estaba activada (en `warn`) por sus configuraciones `strongly-recommended`. Esta
  regla no está en ninguna configuración: actívala tú mismo.
