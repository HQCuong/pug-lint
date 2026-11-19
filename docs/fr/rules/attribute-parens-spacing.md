---
title: vue-pug/attribute-parens-spacing
description: "vue-pug/attribute-parens-spacing (eslint-plugin-pug-vue) : imposer un espacement cohérent à l'intérieur des parenthèses des blocs d'attributs Pug. Options, exemples et corrections."
---

# vue-pug/attribute-parens-spacing

Imposer un espacement cohérent à l'intérieur des parenthèses des blocs d'attributs Pug.

✅ Activée dans `configs.recommended` (au niveau `warn`). 🔧 Corrigeable avec `--fix`.

Remplace `vue/html-closing-bracket-spacing`, qui plante sur les templates Pug et est désactivée par
`configs.base`.

## Détails de la règle {#rule-details}

La règle vérifie les espaces directement après `(` et directement avant `)` sur la même ligne :

- `never` (par défaut) : aucun espace à cet endroit. La correction le supprime.
- `always` : au moins un espace à cet endroit. La correction en insère un.

Un côté dont l'espace contient un saut de ligne relève de
[`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) et est laissé tel quel, de même
qu'un bloc vide ou composé uniquement d'espaces.

### Incorrect {#incorrect}

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

### Correct {#correct}

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

## Options {#options}

```js
'vue-pug/attribute-parens-spacing': ['warn', 'never']
```

`'never'` (par défaut) ou `'always'`.

### Incorrect avec `["always"]` {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

### Correct avec `["always"]` {#correct-with-always}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```
