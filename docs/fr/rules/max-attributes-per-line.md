---
title: vue-pug/max-attributes-per-line
description: "vue-pug/max-attributes-per-line (eslint-plugin-pug-vue) : imposer un nombre maximal d'attributs par ligne dans les blocs d'attributs Pug. Options, exemples et corrections."
---

# vue-pug/max-attributes-per-line

Imposer un nombre maximal d'attributs par ligne dans les blocs d'attributs Pug.

✅ Activée dans `configs.recommended` (au niveau `warn`). 🔧 Corrigeable avec `--fix`.

Remplace `vue/max-attributes-per-line` dans les templates Pug.

## Détails de la règle {#rule-details}

Les attributs sont comptés par bloc d'attributs : `a(w x)(y z)` a deux blocs de deux attributs
chacun.

- Un bloc sur une seule ligne peut contenir jusqu'à `singleline` attributs (`3` par défaut). Au-delà,
  chaque attribut après le premier est signalé.
- Un bloc qui contient un saut de ligne, y compris à l'intérieur d'une valeur, est multiligne.
  Chacune de ses lignes peut contenir jusqu'à `multiline` attributs (`1` par défaut) ; les attributs
  en trop sont signalés.

La correction remplace l'espace avant un attribut signalé par un saut de ligne, indenté un niveau
plus profond que la balise (une virgule reste avec l'attribut qui la précède). Les sauts de ligne
après `(` et avant `)` relèvent de [`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md).
Les balises dans une interpolation de balise (`#[a(x y z w)]`) ne sont pas vérifiées : elles font
partie d'une ligne de texte.

### Incorrect {#incorrect}

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

### Correct {#correct}

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

## Options {#options}

```js
'vue-pug/max-attributes-per-line': ['warn', { singleline: 3, multiline: 1 }]
```

- `singleline` (entier ≥ 1, `3` par défaut) : le maximum pour un bloc sur une seule ligne.
- `multiline` (entier ≥ 1, `1` par défaut) : le maximum par ligne dans un bloc multiligne.

### Incorrect avec `[{ "singleline": 1 }]` {#incorrect-with-singleline-1}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Correct avec `[{ "singleline": 1 }]` {#correct-with-singleline-1}

```vue
<template lang="pug">
a(href="/") Home
</template>
```
