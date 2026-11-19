---
layout: home
title: ESLint für Pug-Templates in Vue
description: Pug-Templates in Vue-Single-File-Components mit ESLint linten und formatieren. Ihre vue/*-Regeln laufen auf Pug, eslint --fix formatiert das Pug, und jeder Fix wird geprüft, damit er kein Template kaputt macht.
# The hero and sections are written here, not with `hero`/`features` frontmatter, so the home
# page can hold the live --fix example. `markdownStyles: false` drops the .vp-doc wrapper; the
# sections opt back in with the vp-doc class where they render Markdown.
markdownStyles: false
---

<section class="pl-hero">
<div class="pl-hero-text">
<h1 class="home-heading">ESLint für Pug-Templates in Vue</h1>
<p class="pl-lead">Lassen Sie Ihre <code>vue/*</code>-Regeln auf <code>&lt;template lang="pug"&gt;</code> laufen, formatieren Sie das Pug mit <code>eslint --fix</code> und behalten Sie jedes Template intakt: Jeder Fix wird geprüft, bevor er angewendet wird.</p>
<div class="pl-install vp-doc">

```sh
npm i -D eslint-plugin-pug-vue
```

</div>
<div class="pl-actions">
<a class="pl-button primary" href="/de/guide/getting-started">Loslegen</a>
<a class="pl-button" href="/de/rules/">Alle 12 Regeln ansehen</a>
</div>
</div>
<div class="pl-hero-demo">
<FixDemo />
</div>
</section>

<section class="pl-section vp-doc">
<div class="pl-row">
<div class="pl-row-text">

## Ihre `vue/*`-Regeln, auf Pug {#your-vue-rules-on-pug}

Die Regeln von eslint-plugin-vue laufen auf Pug-Templates unter ihren gewohnten Namen und mit ihren
gewohnten Optionen: fehlende Keys, ungenutzte Variablen, Attributreihenfolge, veraltete Syntax. Die
wenigen Regeln, die auf Pug nicht funktionieren können, werden abgeschaltet oder nur innerhalb von
Pug-Templates stummgeschaltet, sodass sie Ihre HTML-Templates weiter prüfen.

[Welche Regeln auf Pug laufen](/de/guide/vue-rules)

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

## Formatieren mit `eslint --fix` {#formatting-with-eslint-fix}

Zwölf kleine `vue-pug/*`-Regeln formatieren das Pug selbst: Einrückung, Abstände, Kommas,
Anführungszeichen und Zeilenumbrüche in Attributblöcken sowie die Kurzschreibweisen `.class` und
`#id`. Jede Regel hat Optionen, und jede lässt sich abschalten. Kein Prettier und kein zweiter
Formatter, der beim Speichern gegen ESLint arbeitet.

[Alle Regeln ansehen](/de/rules/)

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

## Fixes, die kein Template kaputt machen {#fixes-that-cannot-break-a-template}

In Pug ist die Einrückung die Struktur: Verschieben Sie eine Zeile, und der Baum ändert sich. Bevor
ESLint also einen Fix in ein Pug-Template schreibt, prüft das Plugin ihn, egal von welcher Regel er
kommt:

1. Es parst das Template mit angewendetem Fix.
2. Es vergleicht Tags, Verschachtelung, Klassen, Attribute und jeden JavaScript-Ausdruck mit dem Original.
3. Es wendet den Fix nur an, wenn sich nichts geändert hat. Andernfalls verwirft es den Fix und behält die Warnung, sodass Sie die Zeile von Hand korrigieren können.

[So funktioniert der Fix-Guard](/de/guide/fix-guard)

</div>
<div class="pl-row-code">

```pug
//- the same template to the guard
p(class="intro lead") Hello
p.intro.lead Hello

//- a different one: a class is gone
p.intro Hello
```

<p class="pl-caption">So darf <code>vue-pug/prefer-shorthand</code> die erste Zeile in die zweite umschreiben, aber ein Fix, der eine Klasse verliert oder eine Zeile unter einen anderen Elternknoten verschiebt, wird nie angewendet.</p>

</div>
</div>
</section>

<section class="pl-section pl-start vp-doc">

## In zwei Minuten starten {#start-in-two-minutes}

Sie brauchen ESLint 9.15 oder 10 mit Flat Config, eslint-plugin-vue 10 und vue-eslint-parser 10.
[Erste Schritte](/de/guide/getting-started) führt durch Installation, Konfiguration und Fix beim
Speichern in VS Code. Sie kommen von eslint-plugin-vue-pug? Lesen Sie [die Migrationsanleitung](/de/guide/migration).

</section>
