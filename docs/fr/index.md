---
layout: home
title: ESLint pour les templates Pug dans Vue
description: Lintez et formatez les templates Pug des composants monofichiers Vue avec ESLint. Vos règles vue/* s'exécutent sur le Pug, eslint --fix le formate, et chaque correction est vérifiée pour ne jamais casser un template.
# The hero and sections are written here, not with `hero`/`features` frontmatter, so the home
# page can hold the live --fix example. `markdownStyles: false` drops the .vp-doc wrapper; the
# sections opt back in with the vp-doc class where they render Markdown.
markdownStyles: false
---

<section class="pl-hero">
<div class="pl-hero-text">
<h1 class="home-heading">ESLint pour les templates Pug dans Vue</h1>
<p class="pl-lead">Exécutez vos règles <code>vue/*</code> sur <code>&lt;template lang="pug"&gt;</code>, formatez le Pug avec <code>eslint --fix</code>, et gardez chaque template intact : chaque correction est vérifiée avant d'être appliquée.</p>
<div class="pl-install vp-doc">

```sh
npm i -D eslint-plugin-pug-vue
```

</div>
<div class="pl-actions">
<a class="pl-button primary" href="/fr/guide/getting-started">Prise en main</a>
<a class="pl-button" href="/fr/rules/">Parcourir les 12 règles</a>
</div>
</div>
<div class="pl-hero-demo">
<FixDemo />
</div>
</section>

<section class="pl-section vp-doc">
<div class="pl-row">
<div class="pl-row-text">

## Vos règles `vue/*`, sur Pug {#your-vue-rules-on-pug}

Les règles d'eslint-plugin-vue s'exécutent sur les templates Pug sous leurs noms et options
habituels : clés manquantes, variables inutilisées, ordre des attributs, syntaxe obsolète. Les
quelques règles qui ne peuvent pas fonctionner sur Pug sont désactivées, ou réduites au silence
uniquement dans les templates Pug, et continuent donc de vérifier vos templates HTML.

[Quelles règles s'exécutent sur Pug](/fr/guide/vue-rules)

</div>
<div class="pl-row-code">

```vue
<template lang="pug">
ul
  li(v-for="todo in todos") {{ todo.title }}
</template>
```

```txt
3:3  error  Elements in iteration expect to have 'v-bind:key' directives  vue/require-v-for-key
```

</div>
</div>

<div class="pl-row">
<div class="pl-row-text">

## Formater avec `eslint --fix` {#formatting-with-eslint-fix}

Douze petites règles `vue-pug/*` formatent le Pug lui-même : l'indentation, les espaces, virgules,
guillemets et sauts de ligne des blocs d'attributs, et les raccourcis `.class` / `#id`. Chacune a
des options, et vous pouvez désactiver n'importe laquelle. Pas de Prettier, et pas de second
formateur qui se bat avec ESLint à l'enregistrement.

[Voir toutes les règles](/fr/rules/)

</div>
<div class="pl-row-code">

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

</div>
</div>

<div class="pl-row">
<div class="pl-row-text">

## Des corrections qui ne peuvent pas casser un template {#fixes-that-cannot-break-a-template}

En Pug, l'indentation est la structure : déplacez une ligne et l'arbre change. Donc, avant qu'ESLint
n'écrive une correction dans un template Pug, le plugin la vérifie, quelle que soit la règle dont
elle provient :

1. il analyse le template avec la correction appliquée ;
2. il compare avec l'original les balises, leur imbrication, les classes, les attributs et chaque expression JavaScript ;
3. il n'applique la correction que si rien n'a changé. Sinon il écarte la correction et garde l'avertissement, pour que vous corrigiez cette ligne à la main.

[Comment fonctionne le fix guard](/fr/guide/fix-guard)

</div>
<div class="pl-row-code">

```pug
//- the same template to the guard
p(class="intro lead") Hello
p.intro.lead Hello

//- a different one: a class is gone
p.intro Hello
```

<p class="pl-caption">Ainsi <code>vue-pug/prefer-shorthand</code> peut réécrire la première ligne en la seconde, mais une correction qui perd une classe, ou déplace une ligne vers un autre parent, n'est jamais appliquée.</p>

</div>
</div>
</section>

<section class="pl-section pl-start vp-doc">

## Démarrer en deux minutes {#start-in-two-minutes}

Il faut ESLint 9.15 ou 10 avec une flat config, eslint-plugin-vue 10 et vue-eslint-parser 10.
[Prise en main](/fr/guide/getting-started) décrit l'installation, la config et la correction à l'enregistrement dans VS Code.
Vous venez d'eslint-plugin-vue-pug ? Lisez [le guide de migration](/fr/guide/migration).

</section>
