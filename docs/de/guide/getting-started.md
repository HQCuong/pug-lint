---
title: Erste Schritte
description: "eslint-plugin-pug-vue installieren und Pug-Templates in Vue-Single-File-Components mit ESLint linten: Voraussetzungen, Installation, Flat Config und das erste eslint --fix."
---

# Erste Schritte

`eslint-plugin-pug-vue` lintet und formatiert `<template lang="pug">` (und `lang="jade"`) in
Vue-Single-File-Components:

- Ihre `vue/*`-Regeln aus eslint-plugin-vue laufen auf Pug-Templates, unter ihren gewohnten Namen
  und mit Ihren gewohnten Optionen.
- Die [`vue-pug/*`-Regeln](/de/rules/) formatieren das Pug selbst: Einrückung, Attributlayout,
  Anführungszeichen, Kommas, Kurzschreibweisen. Eine optionale Regel meldet Pug-Konstrukte der
  Kompilierzeit.
- Jeder Fix, der ein Pug-Template berührt, wird geprüft, bevor ESLint ihn anwendet
  ([der Fix-Guard](./fix-guard)), sodass `--fix` und der Fix beim Speichern keine Templates kaputt machen.
- Kein Prettier und kein separater Formatter: Die Fixes kommen von ESLint.

## Voraussetzungen {#requirements}

- Node.js `^20.19.0 || ^22.13.0 || >=24`
- ESLint `^9.15.0 || ^10.0.0`, nur Flat Config (`eslint.config.js`)
- `eslint-plugin-vue` `^10.0.0` und `vue-eslint-parser` `^10.0.0`

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

## Konfiguration {#configure}

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

Setzen Sie `...vuePug.configs.recommended` **nach** die Configs von eslint-plugin-vue. Sie setzt die
Parser-Optionen, den Prozessor und die Regeln, die für Pug abgeschaltet sein müssen. Eine spätere
Config, die einen eigenen Prozessor setzt oder eine der [abstürzenden Regeln](./vue-rules) wieder
einschaltet, bricht das Linten von Pug-Dateien.

## Ausführen {#run-it}

```sh
npx eslint .          # report problems
npx eslint . --fix    # fix what can be fixed
```

Wie Sie in VS Code beim Speichern fixen, steht unter [Editor einrichten](./editor-setup).

## Nächste Schritte {#next-steps}

- [Konfiguration](./configuration): die zwei Configs, `baseIndent`, eine unterdrückte Regel behalten.
- [Regeln](/de/rules/): was jede `vue-pug/*`-Regel tut und welche Optionen sie hat.
- [Bekannte Einschränkungen](./limitations), bevor Sie das Plugin auf einer großen Codebasis einführen.
- Sie kommen von `eslint-plugin-vue-pug`? Lesen Sie [die Migrationsanleitung](./migration).
- Sie nutzen oxlint? Führen Sie es neben ESLint aus: siehe [Mit oxlint verwenden](./oxlint).
