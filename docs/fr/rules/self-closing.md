---
title: vue-pug/self-closing
description: "vue-pug/self-closing (eslint-plugin-pug-vue) : imposer ou interdire le `/` d'auto-fermeture d'une balise. Options, exemples et corrections."
---

# vue-pug/self-closing

Imposer ou interdire le `/` d'auto-fermeture d'une balise.

✅ Activée dans `configs.recommended` (au niveau `warn`). 🔧 Corrigeable avec `--fix`.

Remplace `vue/html-self-closing` et `vue/html-end-tags` dans les templates Pug.

## Détails de la règle {#rule-details}

- `never` (par défaut) : chaque `/` après une balise (`img/`, `MyIcon/`) est signalé.
- `always-components` : un composant (un nom de balise avec une majuscule ou un tiret) sans contenu
  doit se terminer par `/`, et la correction l'ajoute. Toute autre balise ne doit pas en avoir. Un
  composant qui a déjà `/` est laissé tel quel.

Pug rend `p/ text` comme `<p/>` suivi du texte, et rejette `/` sur une balise qui a des lignes
imbriquées. La correction ne supprime donc un `/` que si rien ne le suit sur sa ligne (pas même un
espace) et que la balise n'a pas de lignes imbriquées autres que des commentaires sans sortie
(`//-`). Sinon le `/` est signalé sans correction. Une balise qui a un contenu quelconque (texte,
code, `.`, lignes imbriquées, même un espace final) ne reçoit jamais de `/`.

### Incorrect {#incorrect}

```vue
<template lang="pug">
img(src="logo.png")/
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")/
</template>
```

### Correct {#correct}

```vue
<template lang="pug">
img(src="logo.png")
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")
  br
</template>
```

## Options {#options}

```js
'vue-pug/self-closing': ['warn', 'never']
```

`'never'` (par défaut) ou `'always-components'`.

### Incorrect avec `["always-components"]` {#incorrect-with-always-components}

```vue
<template lang="pug">
MyIcon(name="star")
</template>
```

### Correct avec `["always-components"]` {#correct-with-always-components}

```vue
<template lang="pug">
div
  MyIcon(name="star")/
  my-icon/
  MyButton Save
  img(src="logo.png")
</template>
```
