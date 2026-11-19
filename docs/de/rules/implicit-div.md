---
title: vue-pug/implicit-div
description: "vue-pug/implicit-div (eslint-plugin-pug-vue): Den Tag-Namen `div` vor Klassen- und ID-Kurzschreibweisen vorschreiben oder verbieten. Optionen, Beispiele und Fixes."
---

# vue-pug/implicit-div

Den Tag-Namen `div` vor Klassen- und ID-Kurzschreibweisen vorschreiben oder verbieten.

✅ In `configs.recommended` aktiviert (auf `warn`). 🔧 Mit `--fix` behebbar.

## Regeldetails {#rule-details}

In Pug ist eine Zeile, die mit einer Kurzschreibweise `.class` oder `#id` beginnt, ein `div`.

- `always` (Standard): die implizite Form verwenden. Ein explizites `div` vor einer
  Kurzschreibweise wird gemeldet, und der Fix entfernt den Namen.
- `never`: `div` schreiben. Ein Tag, das mit einer Kurzschreibweise beginnt, wird gemeldet, und der
  Fix fügt `div` ein.

Ein `div` ohne Kurzschreibweisen (`div`, `div(v-if="ok")`) wird nie gemeldet. Zwei Fälle unter
`always` werden ohne Fix gemeldet: ein `div` in einer Tag-Interpolation (`#[div.a x]`) und ein
`div`, dessen erste Kurzschreibweise nicht direkt auf den Namen folgt (`div(a).b`), da das Entfernen
des Namens eine Zeile hinterließe, die mit `(` beginnt.

### Falsch {#incorrect}

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

### Richtig {#correct}

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

## Optionen {#options}

```js
'vue-pug/implicit-div': ['warn', 'always']
```

`'always'` (Standard) oder `'never'`.

### Falsch mit `["never"]` {#incorrect-with-never}

```vue
<template lang="pug">
.card Content
</template>
```

### Richtig mit `["never"]` {#correct-with-never}

```vue
<template lang="pug">
div.card Content
</template>
```
