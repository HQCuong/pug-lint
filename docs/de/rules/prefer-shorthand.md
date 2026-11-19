---
title: vue-pug/prefer-shorthand
description: "vue-pug/prefer-shorthand (eslint-plugin-pug-vue): Kurzschreibweisen `.class` / `#id` für statische Klassen- und ID-Attribute vorschreiben oder verbieten. Optionen, Beispiele und Fixes."
---

# vue-pug/prefer-shorthand

Kurzschreibweisen `.class` / `#id` für statische Klassen- und ID-Attribute vorschreiben oder verbieten.

✅ In `configs.recommended` aktiviert (auf `warn`). 🔧 Mit `--fix` behebbar.

## Regeldetails {#rule-details}

Klasse und ID werden getrennt konfiguriert, jeweils mit `always`, `never` oder `ignore`.

- `always` (Standard für beide): Ein statisches `class`- oder `id`-Attribut wird zu
  Kurzschreibweisen: `p(class="a b")` → `p.a.b`, `p(id="x")` → `p#x`. Neue Kurzschreibweisen kommen
  hinter die vorhandenen, und ein leer gewordener Attributblock wird entfernt.
- `never`: Kurzschreibweisen werden zu einem Attribut. Klassen schließen sich einem vorhandenen
  statischen `class`-Attribut an; andernfalls wird das neue Attribut als erstes im ersten
  Attributblock eingefügt (oder in einem neuen Block), mit dem Anführungszeichenstil des ersten
  String-Werts dieses Blocks (`"`, wenn es keinen gibt). Ein Tag, das ohne Namen und ohne
  Kurzschreibweise zurückbleibt, bekommt `div`.
- `ignore`: Diese Art wird nicht geprüft.

Nur statische Attribute werden umgewandelt: Der Name ist genau `class` oder `id`, der Wert ist ein
einfacher `'…'`- oder `"…"`-String, und jedes durch Leerraum getrennte Token darin ist ein gültiger
Pug-Kurzschreibweisen-Name. Ist irgendein Token das nicht (`md:flex`, `w-1/2`, `-1`, `1a`), bleibt
der ganze Wert unangetastet. Ein `id`-Wert muss ein einzelnes Token sein. Gebundene Attribute
(`:class`, `v-bind:id`) werden nie angefasst. Ein Tag, das sowohl eine ID-Kurzschreibweise als auch
ein `id`-Attribut hat (in Pug ein Fehler), behält seine ID wie geschrieben.

Alle Umwandlungen eines Tags werden von einem einzigen Fix angewendet, der an die erste Meldung des
Tags gehängt ist.

### Falsch {#incorrect}

```vue
<template lang="pug">
p(class="lead") Text
</template>
```

```vue
<template lang="pug">
section(id="intro" class="hero dark")
</template>
```

### Richtig {#correct}

```vue
<template lang="pug">
p.lead Text
</template>
```

```vue
<template lang="pug">
section#intro.hero.dark(class="md:flex w-1/2" :class="{ active }")
</template>
```

## Optionen {#options}

```js
'vue-pug/prefer-shorthand': ['warn', { class: 'always', id: 'always' }]
```

`class` und `id`: `'always'` (Standard), `'never'` oder `'ignore'`.

### Falsch mit `[{ "class": "never", "id": "always" }]` {#incorrect-with-class-never-id-always}

```vue
<template lang="pug">
p.lead Text
</template>
```

### Richtig mit `[{ "class": "never", "id": "always" }]` {#correct-with-class-never-id-always}

```vue
<template lang="pug">
p#intro(class="lead") Text
</template>
```
