---
title: "Dépannage"
description: "Résoudre les problèmes courants d'eslint-plugin-pug-vue : règles vue/* qui plantent, corrections non appliquées, rien de signalé dans les templates Pug."
---

# Dépannage

## `TypeError: Cannot read properties of null (reading 'type')` (ou `'range'`) {#typeerror-cannot-read-properties-of-null-reading-type-or-range}

L'une des règles `vue/*` qui plantent sur les templates Pug a été réactivée par une config placée
après `...vuePug.configs.recommended` (ou `base`), par exemple une config partagée ou une entrée
`rules` qui l'active. `configs.base` les désactive pour tous les fichiers `.vue` :

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

Placez `...vuePug.configs.recommended` après toutes les configs qui les activent, ou retirez-les de
vos propres `rules`. Utilisez à la place le remplacement `vue-pug/*` pour les templates Pug.

## Un problème est signalé mais `--fix` ne le corrige pas {#a-problem-is-reported-but-fix-does-not-fix-it}

Le [fix guard](./fix-guard) a écarté la correction, car l'appliquer aurait changé la structure du
template ou l'aurait rendu inanalysable. Corrigez cette ligne à la main. Si vous pensez que la
correction était sûre, [ouvrez une issue](https://github.com/HQCuong/pug-lint/issues/new/choose)
avec le template.

Vérifiez aussi que le template n'a pas de problème `vue/no-parsing-error` : tant qu'un template
contient une erreur de syntaxe Pug, aucune correction n'y est appliquée.

## Rien n'est signalé dans les templates Pug {#nothing-is-reported-in-pug-templates}

- Le bloc doit être `<template lang="pug">` ou `<template lang="jade">`.
- `...vuePug.configs.recommended` (ou `base`) doit venir après les configs d'eslint-plugin-vue, et
  aucune config ultérieure ne doit définir son propre `processor` pour `**/*.vue`.
- Dans VS Code, `vue` doit figurer dans `eslint.validate` (voir [Configuration de l'éditeur](./editor-setup)).

## L'éditeur et la CLI ne sont pas d'accord {#the-editor-and-the-cli-disagree}

L'extension ESLint peut utiliser un autre ESLint ou une autre config que votre terminal. Lancez
`npx eslint --print-config src/App.vue` et comparez avec le panneau de sortie de l'extension
(canal *ESLint*).
