---
title: vue-pug/attribute-commas
description: "vue-pug/attribute-commas (eslint-plugin-pug-vue) : exiger ou interdire les virgules entre les attributs dans les blocs d'attributs Pug. Options, exemples et corrections."
---

# vue-pug/attribute-commas

Exiger ou interdire les virgules entre les attributs dans les blocs d'attributs Pug.

✅ Activée dans `configs.recommended` (au niveau `warn`). 🔧 Corrigeable avec `--fix`.

## Détails de la règle {#rule-details}

Pug accepte des attributs séparés par des espaces, par des virgules, ou les deux. Cette règle rend
le choix cohérent :

- `never` (par défaut) : chaque virgule d'un bloc d'attributs est signalée et supprimée.
- `always` : exactement une virgule entre chaque paire d'attributs. Une virgule manquante est
  insérée juste après l'attribut qui la précède ; les virgules en trop dans le même intervalle sont
  supprimées.

Avec l'une ou l'autre option, une virgule avant le premier attribut ou après le dernier est
signalée. Quand supprimer une virgule collerait deux attributs ensemble (`a(x="1",y="2")`), la
correction met un espace à sa place. La règle ne touche qu'aux virgules : avec `always`, les espaces
avant une virgule (`x="1" , y="2"`) sont laissés tels quels, et aucune autre règle ne les normalise
en v1.

### Incorrect {#incorrect}

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

### Correct {#correct}

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

## Options {#options}

```js
'vue-pug/attribute-commas': ['warn', 'never']
```

`'never'` (par défaut) ou `'always'`.

### Incorrect avec `["always"]` {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Correct avec `["always"]` {#correct-with-always}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```
