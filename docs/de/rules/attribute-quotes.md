---
title: vue-pug/attribute-quotes
description: "vue-pug/attribute-quotes (eslint-plugin-pug-vue): Einen einheitlichen Anführungszeichenstil für Pug-Attributwerte vorschreiben. Optionen, Beispiele und Fixes."
---

# vue-pug/attribute-quotes

Einen einheitlichen Anführungszeichenstil für Pug-Attributwerte vorschreiben.

✅ In `configs.recommended` aktiviert (auf `warn`). 🔧 Mit `--fix` behebbar.

Ersetzt `vue/html-quotes` innerhalb von Pug-Templates. Der Fixer dieser Regel maskiert innere
Anführungszeichen als `&quot;`, was in Pug falsch ist (ein Attributwert ist ein
JavaScript-Ausdruck), und er weiß nicht, dass Backticks in Pug gültige Anführungszeichen sind.

## Regeldetails {#rule-details}

Ein Wert, der ein einzelner `'…'`- oder `"…"`-String im jeweils anderen Anführungszeichenstil ist,
wird gemeldet. Der Fix tauscht nur die beiden Anführungszeichen aus und maskiert nie etwas neu:
Enthält der Wert das Ziel-Anführungszeichen oder einen Backslash, wird er ohne Fix gemeldet.

Backtick-Werte bleiben standardmäßig erhalten. Mit `backticks: 'convert'` wird ein Backtick-Wert
nur dann gemeldet und gefixt, wenn er in einer Zeile steht und kein `${}`, kein Anführungszeichen
und keinen Backslash enthält; andere Backtick-Werte bleiben unangetastet. Werte, die kein einzelnes
Literal sind (`x`, `a + 'b'`, `{ a: 1 }`), werden nie angefasst.

### Falsch {#incorrect}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

```vue
<template lang="pug">
p(title='Say "hi"') Hello
</template>
```

Das zweite Beispiel wird ohne Fix gemeldet: Das Vertauschen der Anführungszeichen würde Maskierung
erfordern.

### Richtig {#correct}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

```vue
<template lang="pug">
p(:class=`card` :title="'Hi ' + name" :data-id=id) Hello
</template>
```

## Optionen {#options}

```js
'vue-pug/attribute-quotes': ['warn', 'double', { backticks: 'keep' }]
```

- Erste Option: `'double'` (Standard) oder `'single'`.
- `backticks`: `'keep'` (Standard) oder `'convert'`.

### Falsch mit `["single"]` {#incorrect-with-single}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

### Richtig mit `["single"]` {#correct-with-single}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

### Falsch mit `["double", { "backticks": "convert" }]` {#incorrect-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello`) Hi
</template>
```

### Richtig mit `["double", { "backticks": "convert" }]` {#correct-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello ${name}`) Hi
</template>
```
