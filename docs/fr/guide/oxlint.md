---
title: "Utilisation avec oxlint"
description: "Utiliser eslint-plugin-pug-vue dans un projet qui utilise oxlint : oxlint pour les scripts, ESLint pour les templates Vue, avec eslint-plugin-oxlint pour éviter les doublons."
---

# Utilisation avec oxlint

[Oxlint](https://oxc.rs/docs/guide/usage/linter) est un linter bien plus rapide, écrit en Rust. Dans
un fichier `.vue`, il ne lint que les blocs `<script>` : il ne lint pas `<template>`, ni HTML ni
Pug, et ne peut pas charger ce plugin, qui a besoin de vue-eslint-parser pour lire le template.

Dans un projet qui utilise oxlint, lancez donc les deux :

- **oxlint** pour JavaScript et TypeScript, y compris le `<script>` des fichiers `.vue` ;
- **ESLint** pour ce qu'oxlint ne sait pas encore faire : les templates, avec eslint-plugin-vue et
  `eslint-plugin-pug-vue`.

[`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) désactive, dans
ESLint, toutes les règles que votre config oxlint exécute déjà : aucun problème n'est signalé deux
fois et ESLint travaille moins.

## Installation {#install}

```sh
npm install --save-dev oxlint eslint-plugin-oxlint \
  eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

## Configurer oxlint {#configure-oxlint}

Créez `.oxlintrc.json` avec `npx oxlint --init`, et ajoutez `vue` à ses plugins pour qu'oxlint
exécute aussi ses règles Vue sur les blocs `<script>` :

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "vue"],
  "categories": {
    "correctness": "error"
  }
}
```

## Configurer ESLint {#configure-eslint}

Placez la config oxlint **en dernier**, après `vuePug.configs.recommended` :

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'
import oxlint from 'eslint-plugin-oxlint'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  // Last: turn off the rules that .oxlintrc.json already runs.
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
]
```

Les règles qu'elle désactive sont des règles de script (`no-debugger`, `vue/no-dupe-keys`,
`vue/valid-define-props`, …). Elle ne désactive aucune règle de template ni aucune règle
`vue-pug/*` : les templates Pug sont donc lintés et formatés exactement comme sans oxlint.

## Les lancer {#run-them}

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint:fix": "oxlint --fix && eslint . --fix"
  }
}
```

Oxlint passe en premier : il prend quelques millisecondes, et ses erreurs apparaissent avant le
démarrage d'ESLint. Oxlint ignore les fichiers listés dans votre `.gitignore` ; ajoutez-y donc
`node_modules` s'il n'y est pas déjà.

`&&` s'arrête au premier linter qui signale encore une erreur. Si oxlint en trouve une qu'il ne sait
pas corriger (une instruction `debugger`, par exemple), `lint:fix` s'arrête là et ESLint ne formate
pas les templates. Corrigez cette erreur, ou lancez `npx eslint . --fix` seul.

## VS Code {#vs-code}

Installez l'[extension Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) à
côté de l'[extension ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint),
et laissez les deux corriger à l'enregistrement :

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```

Les deux ne corrigent jamais la même chose : oxlint corrige les scripts, ESLint corrige les
templates, et chaque correction qu'ESLint fait dans un template Pug passe toujours par
[le fix guard](./fix-guard).

## Sans ESLint ? {#without-eslint}

Pas encore. Oxlint peut exécuter des plugins ESLint écrits en JavaScript, mais il ne leur transmet
que les blocs `<script>` d'un fichier `.vue`, et les parsers personnalisés et les langages de
fichiers comme les templates Vue sont encore en cours de développement dans oxc. Quand oxlint saura
linter les templates Vue, ce plugin pourra suivre : son parser, `pug-lint-parser`, ne dépend pas
d'ESLint. D'ici là, gardez ESLint pour les templates `.vue`.
