---
title: vue-pug/indent
description: "vue-pug/indent (eslint-plugin-pug-vue): exige una indentación coherente en las plantillas Pug. Opciones, ejemplos y correcciones."
---

# vue-pug/indent

Exige una indentación coherente en las plantillas Pug.

✅ Activada en `configs.recommended` (en `warn`). 🔧 Corregible con `--fix`.

Sustituye a `vue/html-indent`, que falla con las plantillas Pug y está desactivada por `configs.base`.

## Detalles de la regla {#rule-details}

La regla comprueba el espacio en blanco inicial de cada línea de un bloque `<template lang="pug">`:

- Una línea de etiqueta, texto, código o control se indenta con una unidad por nivel de anidamiento.
- En un bloque de atributos multilínea, las líneas de atributos están un nivel más profundas que la
  etiqueta, y una línea que empieza con el `)` de cierre está al nivel de la etiqueta.
- Las líneas de un bloque de texto (`p.`, `pre.`, `script.`), comentario, bloque de código o filtro
  posteriores a la primera conservan su desplazamiento respecto a la primera línea, de modo que la
  indentación propia del bloque se preserva cuando este se mueve. Cuando cambia el carácter de
  indentación (de espacios a tabuladores o al revés), una línea indentada menos que la primera no
  puede conservar su desplazamiento: recibe la indentación de la primera línea, ya que mezclar
  tabuladores y espacios es un error de sintaxis de Pug.
- Las líneas que empiezan dentro de una cadena o de un literal de plantilla nunca se reindentan: su
  espacio en blanco inicial forma parte del valor.
- Las líneas de una región que el parser informa como error se omiten.

La indentación de Pug es estructura: mover una línea sin sus hermanas e hijas cambia el árbol. Por
eso cada informe de una plantilla lleva la misma corrección, que reindenta todo el tramo de una
vez. Un solo informe que sobreviva basta para corregirlos todos en una pasada.

### Incorrecto {#incorrect}

```vue
<template lang="pug">
div
   p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
      v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

### Correcto {#correct}

```vue
<template lang="pug">
div
  p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
    v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

```vue
<template lang="pug">
div
  pre.
    first line
      keeps its extra indentation
  p(title=`a
      b`)
</template>
```

## Opciones {#options}

```js
'vue-pug/indent': ['warn', 2, { baseIndent: 0 }]
```

- Primera opción: la unidad de indentación, un número de espacios (por defecto `2`) o `'tab'`.
- `baseIndent` (por defecto `0`): el número de unidades que se añaden a cada línea, de modo que los
  nodos de primer nivel puedan indentarse respecto a `<template>`.

### Incorrecto con `["tab"]` {#incorrect-with-tab}

```vue
<template lang="pug">
div
  p Hello
</template>
```

### Correcto con `["tab"]` {#correct-with-tab}

```vue
<template lang="pug">
div
	p Hello
</template>
```

### Correcto con `[2, { "baseIndent": 1 }]` {#correct-with-2-baseindent-1}

```vue
<template lang="pug">
  div
    p Hello
</template>
```
