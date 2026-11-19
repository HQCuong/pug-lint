---
title: Konfiguration
description: "eslint-plugin-pug-vue konfigurieren: die Configs base und recommended, unter <template> eingerückte Templates, eine unterdrückte vue/*-Regel behalten und der Plugin-Key."
---

# Konfiguration

## Die zwei Configs {#the-two-configs}

Beide Configs gelten für `**/*.vue`.

| Config | Was sie setzt |
|---|---|
| `configs.base` | Den Pug-Template-Tokenizer für vue-eslint-parser, den Prozessor (Meldungen unterdrücken und [Fix-Guard](./fix-guard)) und schaltet die [abstürzenden `vue/*`-Regeln](./vue-rules) ab. Keine `vue-pug/*`-Regel ist aktiviert. |
| `configs.recommended` | `base` plus jede empfohlene `vue-pug/*`-Regel auf `warn`. |

Verwenden Sie `base`, wenn Sie die `vue-pug/*`-Regeln selbst auswählen möchten:

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

Ihre eigenen `languageOptions.parserOptions` (zum Beispiel `parser` für TypeScript in `<script>`)
werden mit denen des Plugins zusammengeführt und funktionieren daher weiter.

## Unter `<template>` eingerückte Templates {#templates-indented-under-template}

`vue-pug/indent` setzt Knoten der obersten Ebene in Spalte 0 (`baseIndent: 0`, wie bei
`.pug`-Dateien). Wenn Ihre Templates eine Ebene unter `<template>` eingerückt sind, setzen Sie
`baseIndent: 1`, sonst verschiebt die Regel sie in Spalte 0:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  { files: ['**/*.vue'], rules: { 'vue-pug/indent': ['warn', 2, { baseIndent: 1 }] } },
]
```

Alle Optionen finden Sie unter [`vue-pug/indent`](/de/rules/indent).

## Eine unterdrückte Regel behalten {#keeping-a-suppressed-rule}

Einige `vue/*`-Regeln [werden in Pug-Templates unterdrückt](./vue-rules). Damit eine von ihnen dort
weiter meldet, bauen Sie die Configs mit `configure()` und verwenden Sie sie anstelle von
`vuePug.configs`:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configure({ keepVueRules: ['vue/html-self-closing'] }).recommended,
]
```

Das geschieht auf eigenes Risiko. Eine Regel auf der Unterdrückungsliste kann falsche Probleme
melden, und ihre Fixes sind auf Pug womöglich nicht stabil: `vue/singleline-html-element-content-newline`
fügt zum Beispiel bei jedem Durchlauf eine weitere Leerzeile ein. `keepVueRules` gilt nicht für die
abstürzenden Regeln, die abgeschaltet bleiben.

## Plugin-Key {#plugin-key}

Das Plugin ist unter dem Key `vue-pug` registriert. Alle Regel-IDs (`vue-pug/indent`, …) und die
Configs verwenden ihn. Das Plugin unter einem anderen Key zu registrieren, wird nicht unterstützt.

## Leerzeichen am Zeilenende, Leerzeilen, abschließender Zeilenumbruch {#trailing-spaces-blank-lines-final-newline}

Die `vue-pug/*`-Regeln behandeln diese Punkte nicht. Verwenden Sie die
[`@stylistic`](https://eslint.style/)-Regeln `@stylistic/no-trailing-spaces`,
`@stylistic/no-multiple-empty-lines` und `@stylistic/eol-last`: Sie arbeiten auf der ganzen
`.vue`-Datei, Pug-Templates eingeschlossen, und der Fix-Guard prüft ihre Fixes wie alle anderen.
