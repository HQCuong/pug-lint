---
title: vue-pug/attribute-equals-spacing
description: "vue-pug/attribute-equals-spacing (eslint-plugin-pug-vue) : interdire les espaces autour de `=` et `!=` dans les attributs Pug. Options, exemples et corrections."
---

# vue-pug/attribute-equals-spacing

Interdire les espaces autour de `=` et `!=` dans les attributs Pug.

✅ Activée dans `configs.recommended` (au niveau `warn`). 🔧 Corrigeable avec `--fix`.

Remplace `vue/no-spaces-around-equal-signs-in-attribute` dans les templates Pug.

## Détails de la règle {#rule-details}

L'espace entre le nom d'un attribut et son `=` / `!=`, et entre l'opérateur et la valeur, doit être
vide. La correction le supprime. Un intervalle qui contient un saut de ligne est laissé tel quel.

### Incorrect {#incorrect}

```vue
<template lang="pug">
a(href = "/") Home
</template>
```

```vue
<template lang="pug">
input(:value= "query" @input ="update")
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
div(v-html!="html" :title="title")
</template>
```

## Options {#options}

Aucune.
