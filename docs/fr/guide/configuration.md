---
title: "Configuration"
description: "Configurer eslint-plugin-pug-vue : les configs base et recommended, les templates indentés sous <template>, conserver une règle vue/* supprimée, et la clé du plugin."
---

# Configuration

## Les deux configs {#the-two-configs}

Les deux configs s'appliquent à `**/*.vue`.

| Config | Ce qu'elle définit |
|---|---|
| `configs.base` | Le tokenizer de templates Pug pour vue-eslint-parser, le processor (suppression de messages et [fix guard](./fix-guard)), et la désactivation des [règles `vue/*` qui plantent](./vue-rules). Aucune règle `vue-pug/*` n'est activée. |
| `configs.recommended` | `base` plus toutes les règles `vue-pug/*` recommandées au niveau `warn`. |

Utilisez `base` si vous voulez choisir vous-même les règles `vue-pug/*` :

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.base,
  {
    files: ['**/*.vue'],
    rules: {
      'vue-pug/indent': 'error',
      'vue-pug/attribute-quotes': ['error', 'single'],
    },
  },
]
```

Vos propres `languageOptions.parserOptions` (par exemple `parser` pour TypeScript dans `<script>`)
sont fusionnées avec celles du plugin, elles continuent donc de fonctionner.

## Templates indentés sous `<template>` {#templates-indented-under-template}

`vue-pug/indent` place les nœuds de premier niveau à la colonne 0 (`baseIndent: 0`, comme dans les
fichiers `.pug`). Si vos templates sont écrits un niveau sous `<template>`, définissez
`baseIndent: 1`, sinon la règle les ramène à la colonne 0 :

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  { files: ['**/*.vue'], rules: { 'vue-pug/indent': ['warn', 2, { baseIndent: 1 }] } },
]
```

Voir [`vue-pug/indent`](/fr/rules/indent) pour toutes les options.

## Conserver une règle supprimée {#keeping-a-suppressed-rule}

Certaines règles `vue/*` [sont supprimées dans les templates Pug](./vue-rules). Pour qu'une d'elles
continue de signaler des problèmes, construisez les configs avec `configure()` et utilisez-les à la
place de `vuePug.configs` :

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configure({ keepVueRules: ['vue/html-self-closing'] }).recommended,
]
```

C'est à vos risques. Une règle de la liste des règles supprimées peut signaler de faux problèmes, et
ses corrections peuvent être instables sur Pug : par exemple, `vue/singleline-html-element-content-newline`
ajoute une ligne vide de plus à chaque passe. `keepVueRules` ne s'applique pas aux règles qui
plantent, qui restent désactivées.

## Clé du plugin {#plugin-key}

Le plugin est enregistré sous la clé `vue-pug`. Tous les identifiants de règles (`vue-pug/indent`, …)
et les configs l'utilisent. Enregistrer le plugin sous une autre clé n'est pas pris en charge.

## Espaces en fin de ligne, lignes vides, saut de ligne final {#trailing-spaces-blank-lines-final-newline}

Les règles `vue-pug/*` ne s'en occupent pas. Utilisez les règles [`@stylistic`](https://eslint.style/)
`@stylistic/no-trailing-spaces`, `@stylistic/no-multiple-empty-lines` et `@stylistic/eol-last` :
elles travaillent sur tout le fichier `.vue`, templates Pug compris, et le fix guard vérifie leurs
corrections comme toutes les autres.
