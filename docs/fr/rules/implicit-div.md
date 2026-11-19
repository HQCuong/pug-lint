---
title: vue-pug/implicit-div
description: "vue-pug/implicit-div (eslint-plugin-pug-vue) : imposer ou interdire le nom de balise `div` avant les raccourcis de classe et d'id. Options, exemples et corrections."
---

# vue-pug/implicit-div

Imposer ou interdire le nom de balise `div` avant les raccourcis de classe et d'id.

✅ Activée dans `configs.recommended` (au niveau `warn`). 🔧 Corrigeable avec `--fix`.

## Détails de la règle {#rule-details}

En Pug, une ligne qui commence par un raccourci `.class` ou `#id` est un `div`.

- `always` (par défaut) : utilisez la forme implicite. Un `div` explicite suivi d'un raccourci est
  signalé et la correction supprime le nom.
- `never` : écrivez `div`. Une balise qui commence par un raccourci est signalée et la correction
  insère `div`.

Un `div` sans raccourci (`div`, `div(v-if="ok")`) n'est jamais signalé. Deux cas sous `always` sont
signalés sans correction : un `div` dans une interpolation de balise (`#[div.a x]`), et un `div`
dont le premier raccourci ne suit pas directement le nom (`div(a).b`), car supprimer le nom
laisserait une ligne qui commence par `(`.

### Incorrect {#incorrect}

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

### Correct {#correct}

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

## Options {#options}

```js
'vue-pug/implicit-div': ['warn', 'always']
```

`'always'` (par défaut) ou `'never'`.

### Incorrect avec `["never"]` {#incorrect-with-never}

```vue
<template lang="pug">
.card Content
</template>
```

### Correct avec `["never"]` {#correct-with-never}

```vue
<template lang="pug">
div.card Content
</template>
```
