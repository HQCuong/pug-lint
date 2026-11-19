---
title: vue-pug/self-closing
description: "vue-pug/self-closing (eslint-plugin-pug-vue): Das selbstschließende `/` eines Tags vorschreiben oder verbieten. Optionen, Beispiele und Fixes."
---

# vue-pug/self-closing

Das selbstschließende `/` eines Tags vorschreiben oder verbieten.

✅ In `configs.recommended` aktiviert (auf `warn`). 🔧 Mit `--fix` behebbar.

Ersetzt `vue/html-self-closing` und `vue/html-end-tags` innerhalb von Pug-Templates.

## Regeldetails {#rule-details}

- `never` (Standard): Jedes `/` nach einem Tag (`img/`, `MyIcon/`) wird gemeldet.
- `always-components`: Eine Komponente (ein Tag-Name mit einem Großbuchstaben oder einem
  Bindestrich) ohne Inhalt muss mit `/` enden, und der Fix fügt es hinzu. Jedes andere Tag darf
  keines haben. Eine Komponente, die bereits `/` hat, bleibt unangetastet.

Pug rendert `p/ text` als `<p/>` gefolgt vom Text und lehnt `/` an einem Tag mit verschachtelten
Zeilen ab. Der Fix entfernt ein `/` deshalb nur, wenn in seiner Zeile nichts darauf folgt (nicht
einmal ein Leerzeichen) und das Tag keine verschachtelten Zeilen außer ungepufferten Kommentaren
(`//-`) hat. Andernfalls wird das `/` ohne Fix gemeldet. Ein Tag mit irgendeinem Inhalt (Text, Code,
`.`, verschachtelte Zeilen, selbst ein Leerzeichen am Ende) bekommt nie ein `/` hinzugefügt.

### Falsch {#incorrect}

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

### Richtig {#correct}

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

## Optionen {#options}

```js
'vue-pug/self-closing': ['warn', 'never']
```

`'never'` (Standard) oder `'always-components'`.

### Falsch mit `["always-components"]` {#incorrect-with-always-components}

```vue
<template lang="pug">
MyIcon(name="star")
</template>
```

### Richtig mit `["always-components"]` {#correct-with-always-components}

```vue
<template lang="pug">
div
  MyIcon(name="star")/
  my-icon/
  MyButton Save
  img(src="logo.png")
</template>
```
