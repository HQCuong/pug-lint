---
title: vue-pug/prefer-shorthand
description: "vue-pug/prefer-shorthand (eslint-plugin-pug-vue) : imposer ou interdire les raccourcis `.class` / `#id` pour les attributs class et id statiques. Options, exemples et corrections."
---

# vue-pug/prefer-shorthand

Imposer ou interdire les raccourcis `.class` / `#id` pour les attributs class et id statiques.

✅ Activée dans `configs.recommended` (au niveau `warn`). 🔧 Corrigeable avec `--fix`.

## Détails de la règle {#rule-details}

Class et id se configurent séparément, chacun avec `always`, `never` ou `ignore`.

- `always` (par défaut pour les deux) : un attribut `class` ou `id` statique devient des raccourcis :
  `p(class="a b")` → `p.a.b`, `p(id="x")` → `p#x`. Les nouveaux raccourcis vont après les
  existants, et un bloc d'attributs laissé vide est supprimé.
- `never` : les raccourcis deviennent un seul attribut. Les classes rejoignent un attribut `class`
  statique existant ; sinon le nouvel attribut est inséré en premier dans le premier bloc
  d'attributs (ou dans un nouveau bloc), avec le style de guillemets de la première valeur chaîne de
  ce bloc (`"` s'il n'y en a pas). Une balise laissée sans nom ni raccourci reçoit `div`.
- `ignore` : ce genre n'est pas vérifié.

Seuls les attributs statiques sont convertis : le nom est exactement `class` ou `id`, la valeur est
une simple chaîne `'…'` ou `"…"`, et chaque élément de celle-ci séparé par des espaces est un nom de
raccourci Pug valide. Si un élément ne l'est pas (`md:flex`, `w-1/2`, `-1`, `1a`), toute la valeur
est laissée telle quelle. Une valeur d'`id` doit être un seul élément. Les attributs liés (`:class`,
`v-bind:id`) ne sont jamais touchés. Une balise qui a à la fois un raccourci d'id et un attribut
`id` (une erreur en Pug) garde son id tel qu'il est écrit.

Toutes les conversions d'une balise sont appliquées par une seule correction, attachée au premier
signalement de la balise.

### Incorrect {#incorrect}

```vue
<template lang="pug">
p(class="lead") Text
</template>
```

```vue
<template lang="pug">
section(id="intro" class="hero dark")
</template>
```

### Correct {#correct}

```vue
<template lang="pug">
p.lead Text
</template>
```

```vue
<template lang="pug">
section#intro.hero.dark(class="md:flex w-1/2" :class="{ active }")
</template>
```

## Options {#options}

```js
'vue-pug/prefer-shorthand': ['warn', { class: 'always', id: 'always' }]
```

`class` et `id` : `'always'` (par défaut), `'never'` ou `'ignore'`.

### Incorrect avec `[{ "class": "never", "id": "always" }]` {#incorrect-with-class-never-id-always}

```vue
<template lang="pug">
p.lead Text
</template>
```

### Correct avec `[{ "class": "never", "id": "always" }]` {#correct-with-class-never-id-always}

```vue
<template lang="pug">
p#intro(class="lead") Text
</template>
```
