---
title: vue-pug/attribute-parens-newline
description: "vue-pug/attribute-parens-newline (eslint-plugin-pug-vue): Zeilenumbrüche nach `(` und vor `)` mehrzeiliger Pug-Attributblöcke vorschreiben. Optionen, Beispiele und Fixes."
---

# vue-pug/attribute-parens-newline

Zeilenumbrüche nach `(` und vor `)` mehrzeiliger Pug-Attributblöcke vorschreiben.

✅ In `configs.recommended` aktiviert (auf `warn`). 🔧 Mit `--fix` behebbar.

Ersetzt `vue/first-attribute-linebreak` und `vue/html-closing-bracket-newline` innerhalb von
Pug-Templates.

## Regeldetails {#rule-details}

Ein Attributblock ist mehrzeilig, wenn zwei seiner Attribute in verschiedenen Zeilen beginnen.

- `multiline: 'always'` (Standard): Ein mehrzeiliger Block braucht einen Zeilenumbruch direkt nach
  `(` und direkt vor `)`. Der Fix fügt den Zeilenumbruch mit dem Zeilenende und der
  Einrückungseinheit des Templates ein (das erste Attribut eine Ebene tiefer als das Tag, `)` auf
  der Ebene des Tags).
- `multiline: 'never'`: Ein mehrzeiliger Block darf diese Zeilenumbrüche nicht haben.

Ein Block, der nicht mehrzeilig ist (auch ein Block mit einem einzigen Attribut), darf sie
ebenfalls nicht haben. Leerzeichen in derselben Zeile neben den Klammern gehören zu
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md); ein leerer Block bleibt
unangetastet.

### Falsch {#incorrect}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```

```vue
<template lang="pug">
input(
  type="text"
)
</template>
```

### Richtig {#correct}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

```vue
<template lang="pug">
input(type="text" name="q")
</template>
```

## Optionen {#options}

```js
'vue-pug/attribute-parens-newline': ['warn', { multiline: 'always' }]
```

`multiline`: `'always'` (Standard) oder `'never'`.

### Falsch mit `[{ "multiline": "never" }]` {#incorrect-with-multiline-never}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

### Richtig mit `[{ "multiline": "never" }]` {#correct-with-multiline-never}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```
