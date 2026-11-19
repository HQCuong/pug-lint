---
title: Mit oxlint verwenden
description: "eslint-plugin-pug-vue in einem Projekt mit oxlint verwenden: oxlint für Skripte, ESLint für Vue-Templates, mit eslint-plugin-oxlint gegen doppelte Meldungen."
---

# Mit oxlint verwenden

[Oxlint](https://oxc.rs/docs/guide/usage/linter) ist ein deutlich schnellerer Linter, geschrieben
in Rust. In einer `.vue`-Datei lintet er nur die `<script>`-Blöcke: Er lintet weder `<template>`
noch HTML oder Pug und kann dieses Plugin nicht laden, das vue-eslint-parser braucht, um das
Template zu lesen.

In einem Projekt mit oxlint führen Sie also beide aus:

- **oxlint** für JavaScript und TypeScript, auch für das `<script>` von `.vue`-Dateien;
- **ESLint** für das, was oxlint noch nicht kann: die Templates, mit eslint-plugin-vue und
  `eslint-plugin-pug-vue`.

[`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) schaltet in ESLint
jede Regel ab, die Ihre oxlint-Config bereits ausführt, sodass kein Problem doppelt gemeldet wird
und ESLint weniger arbeiten muss.

## Installation {#install}

```sh
npm install --save-dev oxlint eslint-plugin-oxlint \
  eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

## oxlint konfigurieren {#configure-oxlint}

Erstellen Sie `.oxlintrc.json` mit `npx oxlint --init` und fügen Sie `vue` zu den Plugins hinzu,
damit oxlint seine Vue-Regeln auch auf `<script>`-Blöcken ausführt:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "vue"],
  "categories": {
    "correctness": "error"
  }
}
```

## ESLint konfigurieren {#configure-eslint}

Setzen Sie die oxlint-Config **ganz ans Ende**, nach `vuePug.configs.recommended`:

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

Die Regeln, die sie abschaltet, sind Skript-Regeln (`no-debugger`, `vue/no-dupe-keys`,
`vue/valid-define-props`, …). Sie schaltet keine Template-Regel und keine `vue-pug/*`-Regel ab,
sodass Pug-Templates genau wie ohne oxlint gelintet und formatiert werden.

## Ausführen {#run-them}

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint:fix": "oxlint --fix && eslint . --fix"
  }
}
```

Oxlint läuft zuerst: Es braucht Millisekunden, und seine Fehler erscheinen, bevor ESLint startet.
Oxlint überspringt die Dateien, die Ihre `.gitignore` aufführt; tragen Sie dort also `node_modules`
ein, falls es noch fehlt.

`&&` stoppt beim ersten Linter, der noch einen Fehler meldet. Findet oxlint einen, den es nicht
beheben kann (etwa eine `debugger`-Anweisung), hält `lint:fix` dort an, und ESLint formatiert die
Templates nicht. Beheben Sie diesen Fehler oder führen Sie `npx eslint . --fix` allein aus.

## VS Code {#vs-code}

Installieren Sie die [Oxc-Erweiterung](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)
neben der [ESLint-Erweiterung](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
und lassen Sie beide beim Speichern fixen:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```

Die beiden fixen nie dasselbe: oxlint fixt die Skripte, ESLint fixt die Templates, und jeder Fix,
den ESLint in einem Pug-Template vornimmt, läuft weiterhin durch [den Fix-Guard](./fix-guard).

## Ohne ESLint? {#without-eslint}

Noch nicht. Oxlint kann in JavaScript geschriebene ESLint-Plugins ausführen, übergibt ihnen aber
nur die `<script>`-Blöcke einer `.vue`-Datei, und eigene Parser und Dateisprachen wie Vue-Templates
sind in oxc noch in Arbeit. Sobald oxlint Vue-Templates linten kann, kann dieses Plugin folgen: Sein
Parser, `pug-lint-parser`, hängt nicht von ESLint ab. Bis dahin behalten Sie ESLint für
`.vue`-Templates.
