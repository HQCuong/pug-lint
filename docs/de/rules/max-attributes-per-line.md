---
title: vue-pug/max-attributes-per-line
description: "vue-pug/max-attributes-per-line (eslint-plugin-pug-vue): Eine Höchstzahl von Attributen pro Zeile in Pug-Attributblöcken vorschreiben. Optionen, Beispiele und Fixes."
---

# vue-pug/max-attributes-per-line

Eine Höchstzahl von Attributen pro Zeile in Pug-Attributblöcken vorschreiben.

✅ In `configs.recommended` aktiviert (auf `warn`). 🔧 Mit `--fix` behebbar.

Ersetzt `vue/max-attributes-per-line` innerhalb von Pug-Templates.

## Regeldetails {#rule-details}

Attribute werden pro Attributblock gezählt: `a(w x)(y z)` hat zwei Blöcke mit je zwei Attributen.

- Ein Block in einer Zeile darf bis zu `singleline` Attribute enthalten (Standard `3`). Darüber
  wird jedes Attribut nach dem ersten gemeldet.
- Ein Block, der irgendeinen Zeilenumbruch enthält, auch in einem Wert, ist mehrzeilig. Jede seiner
  Zeilen darf bis zu `multiline` Attribute enthalten (Standard `1`); die überzähligen werden gemeldet.

Der Fix ersetzt den Leerraum vor einem gemeldeten Attribut durch einen Zeilenumbruch, eine Ebene
tiefer eingerückt als das Tag (ein Komma bleibt beim Attribut davor). Zeilenumbrüche nach `(` und
vor `)` überlässt er [`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md). Tags in
einer Tag-Interpolation (`#[a(x y z w)]`) werden nicht geprüft: Sie sind Teil einer Textzeile.

### Falsch {#incorrect}

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

### Richtig {#correct}

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

## Optionen {#options}

```js
'vue-pug/max-attributes-per-line': ['warn', { singleline: 3, multiline: 1 }]
```

- `singleline` (Ganzzahl ≥ 1, Standard `3`): das Maximum für einen Block in einer Zeile.
- `multiline` (Ganzzahl ≥ 1, Standard `1`): das Maximum pro Zeile in einem mehrzeiligen Block.

### Falsch mit `[{ "singleline": 1 }]` {#incorrect-with-singleline-1}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Richtig mit `[{ "singleline": 1 }]` {#correct-with-singleline-1}

```vue
<template lang="pug">
a(href="/") Home
</template>
```
