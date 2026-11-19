---
title: vue-pug/attribute-parens-spacing
description: "vue-pug/attribute-parens-spacing (eslint-plugin-pug-vue): Einheitliche Abstände innerhalb der Klammern von Pug-Attributblöcken vorschreiben. Optionen, Beispiele und Fixes."
---

# vue-pug/attribute-parens-spacing

Einheitliche Abstände innerhalb der Klammern von Pug-Attributblöcken vorschreiben.

✅ In `configs.recommended` aktiviert (auf `warn`). 🔧 Mit `--fix` behebbar.

Ersetzt `vue/html-closing-bracket-spacing`, das auf Pug-Templates abstürzt und von `configs.base`
abgeschaltet wird.

## Regeldetails {#rule-details}

Die Regel prüft den Leerraum direkt nach `(` und direkt vor `)` in derselben Zeile:

- `never` (Standard): kein Leerraum dort. Der Fix entfernt ihn.
- `always`: mindestens ein Leerzeichen dort. Der Fix fügt eines ein.

Eine Seite, deren Leerraum einen Zeilenumbruch enthält, gehört zu
[`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) und bleibt unangetastet, ebenso
ein leerer oder nur aus Leerraum bestehender Block.

### Falsch {#incorrect}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```

```vue
<template lang="pug">
input( type="text" name="q")
</template>
```

### Richtig {#correct}

```vue
<template lang="pug">
a(href="/") Home
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
'vue-pug/attribute-parens-spacing': ['warn', 'never']
```

`'never'` (Standard) oder `'always'`.

### Falsch mit `["always"]` {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

### Richtig mit `["always"]` {#correct-with-always}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```
