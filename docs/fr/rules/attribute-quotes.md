---
title: vue-pug/attribute-quotes
description: "vue-pug/attribute-quotes (eslint-plugin-pug-vue) : imposer un style de guillemets cohérent pour les valeurs d'attributs Pug. Options, exemples et corrections."
---

# vue-pug/attribute-quotes

Imposer un style de guillemets cohérent pour les valeurs d'attributs Pug.

✅ Activée dans `configs.recommended` (au niveau `warn`). 🔧 Corrigeable avec `--fix`.

Remplace `vue/html-quotes` dans les templates Pug. Le correcteur de cette règle échappe les
guillemets internes en `&quot;`, ce qui est faux en Pug (une valeur d'attribut est une expression
JavaScript), et elle ne sait pas que les backticks sont des guillemets valides en Pug.

## Détails de la règle {#rule-details}

Une valeur qui est une seule chaîne `'…'` ou `"…"` dans l'autre style de guillemets est signalée. La
correction échange seulement les deux caractères de guillemets, et ne ré-échappe jamais rien : quand
la valeur contient le guillemet cible ou une barre oblique inverse, elle est signalée sans
correction.

Les valeurs en backticks sont conservées par défaut. Avec `backticks: 'convert'`, une valeur en
backticks est signalée et corrigée seulement si elle tient sur une ligne et ne contient ni `${}`, ni
guillemet, ni barre oblique inverse ; les autres valeurs en backticks sont laissées telles quelles.
Les valeurs qui ne sont pas un littéral unique (`x`, `a + 'b'`, `{ a: 1 }`) ne sont jamais touchées.

### Incorrect {#incorrect}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

```vue
<template lang="pug">
p(title='Say "hi"') Hello
</template>
```

Le second exemple est signalé sans correction : échanger les guillemets exigerait un échappement.

### Correct {#correct}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

```vue
<template lang="pug">
p(:class=`card` :title="'Hi ' + name" :data-id=id) Hello
</template>
```

## Options {#options}

```js
'vue-pug/attribute-quotes': ['warn', 'double', { backticks: 'keep' }]
```

- Première option : `'double'` (par défaut) ou `'single'`.
- `backticks` : `'keep'` (par défaut) ou `'convert'`.

### Incorrect avec `["single"]` {#incorrect-with-single}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

### Correct avec `["single"]` {#correct-with-single}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

### Incorrect avec `["double", { "backticks": "convert" }]` {#incorrect-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello`) Hi
</template>
```

### Correct avec `["double", { "backticks": "convert" }]` {#correct-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello ${name}`) Hi
</template>
```
