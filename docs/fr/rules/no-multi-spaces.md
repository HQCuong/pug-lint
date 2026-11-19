---
title: vue-pug/no-multi-spaces
description: "vue-pug/no-multi-spaces (eslint-plugin-pug-vue) : interdire les espaces multiples entre les attributs dans les blocs d'attributs Pug. Options, exemples et corrections."
---

# vue-pug/no-multi-spaces

Interdire les espaces multiples entre les attributs dans les blocs d'attributs Pug.

✅ Activée dans `configs.recommended` (au niveau `warn`). 🔧 Corrigeable avec `--fix`.

Remplace `vue/no-multi-spaces` dans les templates Pug.

## Détails de la règle {#rule-details}

Une suite de deux espaces ou tabulations ou plus sur une ligne, entre deux attributs d'un même bloc,
est signalée, et la correction la remplace par un seul espace. Une virgule reste avec l'attribut qui
la précède : seul l'espace après la dernière virgule de l'intervalle est donc mesuré.

Les valeurs d'attributs, les espaces à côté des parenthèses (voir
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md)) et le texte après la balise ne
sont jamais touchés.

### Incorrect {#incorrect}

```vue
<template lang="pug">
a(href="/"   target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(type="text",   name="q")
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
p(title="a   b")   spaced   text
</template>
```

## Options {#options}

Aucune.
