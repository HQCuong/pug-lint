---
title: vue-pug/attribute-parens-newline
description: "vue-pug/attribute-parens-newline (eslint-plugin-pug-vue) : imposer des sauts de ligne après `(` et avant `)` dans les blocs d'attributs Pug multilignes. Options, exemples et corrections."
---

# vue-pug/attribute-parens-newline

Imposer des sauts de ligne après `(` et avant `)` dans les blocs d'attributs Pug multilignes.

✅ Activée dans `configs.recommended` (au niveau `warn`). 🔧 Corrigeable avec `--fix`.

Remplace `vue/first-attribute-linebreak` et `vue/html-closing-bracket-newline` dans les templates
Pug.

## Détails de la règle {#rule-details}

Un bloc d'attributs est multiligne quand deux de ses attributs commencent sur des lignes
différentes.

- `multiline: 'always'` (par défaut) : un bloc multiligne exige un saut de ligne juste après `(` et
  juste avant `)`. La correction insère le saut de ligne avec la fin de ligne et l'unité
  d'indentation propres au template (le premier attribut un niveau plus profond que la balise, `)`
  au niveau de la balise).
- `multiline: 'never'` : un bloc multiligne ne doit pas avoir ces sauts de ligne.

Un bloc qui n'est pas multiligne (y compris un bloc avec un seul attribut) ne doit pas les avoir
non plus. Les espaces sur la même ligne à côté des parenthèses relèvent de
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md) ; un bloc vide est laissé tel
quel.

### Incorrect {#incorrect}

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

### Correct {#correct}

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

## Options {#options}

```js
'vue-pug/attribute-parens-newline': ['warn', { multiline: 'always' }]
```

`multiline` : `'always'` (par défaut) ou `'never'`.

### Incorrect avec `[{ "multiline": "never" }]` {#incorrect-with-multiline-never}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

### Correct avec `[{ "multiline": "never" }]` {#correct-with-multiline-never}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```
