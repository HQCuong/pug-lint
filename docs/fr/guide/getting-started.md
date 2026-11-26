---
title: "Prise en main"
description: "Installer eslint-plugin-pug-vue et linter les templates Pug des composants monofichiers Vue avec ESLint : prérequis, installation, flat config et premier eslint --fix."
---

# Prise en main

`eslint-plugin-pug-vue` lint et formate `<template lang="pug">` (et `lang="jade"`) dans les
composants monofichiers Vue :

- Vos règles `vue/*` d'eslint-plugin-vue s'exécutent sur les templates Pug, sous leurs noms
  habituels et avec vos options habituelles.
- Les [règles `vue-pug/*`](/fr/rules/) formatent le Pug lui-même : indentation, disposition des
  attributs, guillemets, virgules, raccourcis. Une règle optionnelle signale les constructions Pug
  évaluées à la compilation.
- Toute correction qui touche un template Pug est vérifiée avant qu'ESLint ne l'applique
  ([le fix guard](./fix-guard)) : `--fix` et la correction à l'enregistrement ne cassent donc pas
  les templates.
- Pas de Prettier ni de formateur séparé : les corrections viennent d'ESLint.

## Prérequis {#requirements}

- Node.js `^22.13.0 || >=24`
- ESLint `^9.15.0 || ^10.0.0`, flat config uniquement (`eslint.config.js`)
- `eslint-plugin-vue` `^10.0.0` et `vue-eslint-parser` `^10.0.0`

## Installation {#install}

::: code-group

```sh [npm]
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [pnpm]
pnpm add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [yarn]
yarn add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

:::

## Configuration {#configure}

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

Placez `...vuePug.configs.recommended` **après** les configs d'eslint-plugin-vue. Elle définit les
options du parser, le processor et les règles qui doivent être désactivées pour Pug. Une config
ultérieure qui définit son propre processor, ou qui réactive l'une des [règles qui plantent](./vue-rules),
casse le linting des fichiers Pug.

## Lancer {#run-it}

```sh
npx eslint .          # report problems
npx eslint . --fix    # fix what can be fixed
```

Pour corriger à l'enregistrement dans VS Code, voir [Configuration de l'éditeur](./editor-setup).

## Étapes suivantes {#next-steps}

- [Configuration](./configuration) : les deux configs, `baseIndent`, conserver une règle supprimée.
- [Règles](/fr/rules/) : ce que fait chaque règle `vue-pug/*` et ses options.
- [Limitations connues](./limitations), à lire avant un déploiement sur une grande base de code.
- Vous venez d'`eslint-plugin-vue-pug` ? Lisez [le guide de migration](./migration).
- Vous utilisez oxlint ? Lancez-le à côté d'ESLint : voir [Utilisation avec oxlint](./oxlint).
