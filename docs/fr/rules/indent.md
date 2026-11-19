---
title: vue-pug/indent
description: "vue-pug/indent (eslint-plugin-pug-vue) : imposer une indentation cohérente dans les templates Pug. Options, exemples et corrections."
---

# vue-pug/indent

Imposer une indentation cohérente dans les templates Pug.

✅ Activée dans `configs.recommended` (au niveau `warn`). 🔧 Corrigeable avec `--fix`.

Remplace `vue/html-indent`, qui plante sur les templates Pug et est désactivée par `configs.base`.

## Détails de la règle {#rule-details}

La règle vérifie les espaces de début de chaque ligne d'un bloc `<template lang="pug">` :

- Une ligne de balise, de texte, de code ou de contrôle est indentée d'une unité par niveau
  d'imbrication.
- Dans un bloc d'attributs multiligne, les lignes d'attributs sont un niveau plus profond que la
  balise, et une ligne qui commence par le `)` fermant est au niveau de la balise.
- Les lignes d'un bloc de texte (`p.`, `pre.`, `script.`), d'un commentaire, d'un bloc de code ou
  d'un filtre, après la première, gardent leur décalage par rapport à la première ligne : l'indentation
  propre au bloc est donc préservée quand il se déplace. Quand le caractère d'indentation change
  (espaces vers tabulations ou l'inverse), une ligne indentée moins que la première ne peut pas
  garder son décalage : elle reçoit l'indentation de la première ligne, car mélanger tabulations et
  espaces est une erreur de syntaxe Pug.
- Les lignes qui commencent à l'intérieur d'une chaîne ou d'un template literal ne sont jamais
  ré-indentées : leurs espaces de début font partie de la valeur.
- Les lignes situées dans une région que le parser signale comme erreur sont ignorées.

L'indentation Pug est la structure : déplacer une ligne sans ses sœurs et ses enfants change
l'arbre. Chaque signalement d'un template porte donc la même correction, qui ré-indente toute
l'étendue d'un coup. Un seul signalement restant suffit à tous les corriger en une passe.

### Incorrect {#incorrect}

```vue
<template lang="pug">
div
   p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
      v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

### Correct {#correct}

```vue
<template lang="pug">
div
  p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
    v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

```vue
<template lang="pug">
div
  pre.
    first line
      keeps its extra indentation
  p(title=`a
      b`)
</template>
```

## Options {#options}

```js
'vue-pug/indent': ['warn', 2, { baseIndent: 0 }]
```

- Première option : l'unité d'indentation, un nombre d'espaces (`2` par défaut) ou `'tab'`.
- `baseIndent` (`0` par défaut) : le nombre d'unités ajoutées à chaque ligne, pour que les nœuds de
  premier niveau puissent être indentés par rapport à `<template>`.

### Incorrect avec `["tab"]` {#incorrect-with-tab}

```vue
<template lang="pug">
div
  p Hello
</template>
```

### Correct avec `["tab"]` {#correct-with-tab}

```vue
<template lang="pug">
div
	p Hello
</template>
```

### Correct avec `[2, { "baseIndent": 1 }]` {#correct-with-2-baseindent-1}

```vue
<template lang="pug">
  div
    p Hello
</template>
```
