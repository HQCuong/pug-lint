---
title: vue-pug/no-pug-control-flow
description: "vue-pug/no-pug-control-flow (eslint-plugin-pug-vue) : interdire les constructions Pug évaluées à la compilation (flux de contrôle, code, mixins, interpolation `#{}`, includes). Options, exemples et corrections."
---

# vue-pug/no-pug-control-flow

Interdire les constructions Pug évaluées à la compilation (flux de contrôle, code, mixins,
interpolation `#{}`, includes).

Non activée dans `configs.recommended`. Non corrigeable.

## Détails de la règle {#rule-details}

Les conditions, boucles, le code, les mixins et l'interpolation `#{}` de Pug s'exécutent une seule
fois, à la compilation du template. Vue ne les voit jamais : ils ne sont donc pas réactifs, et les
règles `vue/*` ne voient pas la logique Pug elle-même. Cette règle les signale pour que les
templates utilisent à la place les directives et les liaisons de Vue. Chaque construction appartient
à une catégorie :

| Catégorie | Signale |
|---|---|
| `control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default` |
| `code` | `- code`, `= expression`, `!= expression`, `p= expression` |
| `mixin` | les définitions de mixin (`mixin name`) et les appels (`+name`) |
| `interpolation` | `#{…}` et `!{…}` dans le texte |
| `include` | `include`, `extends`, `block`, `append`, `prepend`, `yield`, `doctype` |

### Incorrect {#incorrect}

```vue
<template lang="pug">
ul
  each item in items
    li= item
</template>
```

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Correct {#correct}

```vue
<template lang="pug">
ul
  li(v-for="item in items" :key="item") {{ item }}
</template>
```

```vue
<template lang="pug">
p(v-if="name") Hello {{ name }}
</template>
```

## Options {#options}

```js
'vue-pug/no-pug-control-flow': ['warn', { allow: [] }]
```

`allow` : les catégories qui ne sont pas signalées, parmi `'control'`, `'code'`, `'mixin'`,
`'interpolation'`, `'include'` (`[]` par défaut).

### Correct avec `[{ "allow": ["interpolation"] }]` {#correct-with-allow-interpolation}

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Incorrect avec `[{ "allow": ["interpolation"] }]` {#incorrect-with-allow-interpolation}

```vue
<template lang="pug">
p= name
</template>
```

## Migrer depuis `eslint-plugin-vue-pug` {#migrating-from-eslint-plugin-vue-pug}

`eslint-plugin-vue-pug` a une règle de même identifiant, `vue-pug/no-pug-control-flow`. Différences :

- Son schéma est vide : elle ne prend aucune option et signale toujours toutes les constructions
  qu'elle connaît. Cette règle prend `{ allow: [...] }` (voir plus haut). Toute option passée à
  l'ancienne règle était rejetée par ESLint : une configuration existante sans options continue
  donc de fonctionner.
- L'ancienne règle était activée (au niveau `warn`) par ses configs `strongly-recommended`. Cette
  règle ne fait partie d'aucune config : activez-la vous-même.
