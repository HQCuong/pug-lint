---
title: vue-pug/attribute-commas
description: "vue-pug/attribute-commas (eslint-plugin-pug-vue): Kommas zwischen Attributen in Pug-Attributblöcken vorschreiben oder verbieten. Optionen, Beispiele und Fixes."
---

# vue-pug/attribute-commas

Kommas zwischen Attributen in Pug-Attributblöcken vorschreiben oder verbieten.

✅ In `configs.recommended` aktiviert (auf `warn`). 🔧 Mit `--fix` behebbar.

## Regeldetails {#rule-details}

Pug akzeptiert Attribute, die durch Leerraum, durch Kommas oder durch beides getrennt sind. Diese
Regel macht die Wahl einheitlich:

- `never` (Standard): Jedes Komma in einem Attributblock wird gemeldet und entfernt.
- `always`: genau ein Komma zwischen je zwei Attributen. Ein fehlendes Komma wird direkt hinter dem
  Attribut davor eingefügt; überzählige Kommas in derselben Lücke werden entfernt.

Bei beiden Optionen wird ein Komma vor dem ersten oder nach dem letzten Attribut gemeldet. Würde
das Entfernen eines Kommas zwei Attribute zusammenkleben (`a(x="1",y="2")`), setzt der Fix ein
Leerzeichen an seine Stelle. Die Regel fasst nur Komma-Zeichen an: Mit `always` bleibt Leerraum vor
einem Komma (`x="1" , y="2"`) unverändert, und keine andere Regel normalisiert ihn in v1.

### Falsch {#incorrect}

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

### Richtig {#correct}

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

## Optionen {#options}

```js
'vue-pug/attribute-commas': ['warn', 'never']
```

`'never'` (Standard) oder `'always'`.

### Falsch mit `["always"]` {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Richtig mit `["always"]` {#correct-with-always}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```
