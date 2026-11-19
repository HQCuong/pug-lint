---
title: Fehlerbehebung
description: "Häufige Probleme mit eslint-plugin-pug-vue beheben: abstürzende vue/*-Regeln, nicht angewendete Fixes, nichts gemeldet in Pug-Templates."
---

# Fehlerbehebung

## `TypeError: Cannot read properties of null (reading 'type')` (oder `'range'`) {#typeerror-cannot-read-properties-of-null-reading-type-or-range}

Eine der `vue/*`-Regeln, die auf Pug-Templates abstürzen, wurde von einer Config wieder
eingeschaltet, die nach `...vuePug.configs.recommended` (oder `base`) steht, zum Beispiel eine
geteilte Config oder ein `rules`-Eintrag, der sie aktiviert. `configs.base` schaltet diese für
jede `.vue`-Datei ab:

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

Setzen Sie `...vuePug.configs.recommended` hinter jede Config, die sie aktiviert, oder entfernen
Sie sie aus Ihren eigenen `rules`. Verwenden Sie für Pug-Templates stattdessen den
`vue-pug/*`-Ersatz.

## Ein Problem wird gemeldet, aber `--fix` behebt es nicht {#a-problem-is-reported-but-fix-does-not-fix-it}

Der [Fix-Guard](./fix-guard) hat den Fix verworfen, weil er die Struktur des Templates geändert
oder es unparsbar gemacht hätte. Beheben Sie die Zeile von Hand. Halten Sie den Fix für sicher,
[eröffnen Sie bitte ein Issue](https://github.com/HQCuong/pug-lint/issues/new/choose) mit dem
Template.

Prüfen Sie auch, dass das Template kein `vue/no-parsing-error`-Problem hat: Solange ein Template
einen Pug-Syntaxfehler hat, wird darin kein Fix angewendet.

## In Pug-Templates wird nichts gemeldet {#nothing-is-reported-in-pug-templates}

- Der Block muss `<template lang="pug">` oder `<template lang="jade">` sein.
- `...vuePug.configs.recommended` (oder `base`) muss nach den Configs von eslint-plugin-vue stehen,
  und keine spätere Config darf für `**/*.vue` einen eigenen `processor` setzen.
- In VS Code muss `vue` in `eslint.validate` stehen (siehe [Editor einrichten](./editor-setup)).

## Editor und CLI sind sich uneinig {#the-editor-and-the-cli-disagree}

Die ESLint-Erweiterung verwendet womöglich ein anderes ESLint oder eine andere Config als Ihr
Terminal. Führen Sie `npx eslint --print-config src/App.vue` aus und vergleichen Sie mit dem
Ausgabe-Panel der Erweiterung (Kanal *ESLint*).
