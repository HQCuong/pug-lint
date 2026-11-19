---
title: vue-pug/no-multi-spaces
description: "vue-pug/no-multi-spaces (eslint-plugin-pug-vue): Mehrere Leerzeichen zwischen Attributen in Pug-Attributblöcken verbieten. Optionen, Beispiele und Fixes."
---

# vue-pug/no-multi-spaces

Mehrere Leerzeichen zwischen Attributen in Pug-Attributblöcken verbieten.

✅ In `configs.recommended` aktiviert (auf `warn`). 🔧 Mit `--fix` behebbar.

Ersetzt `vue/no-multi-spaces` innerhalb von Pug-Templates.

## Regeldetails {#rule-details}

Eine Folge von zwei oder mehr Leerzeichen oder Tabs in einer Zeile zwischen zwei Attributen
desselben Blocks wird gemeldet, und der Fix ersetzt sie durch ein Leerzeichen. Ein Komma bleibt
beim Attribut davor, sodass nur der Leerraum nach dem letzten Komma der Lücke gemessen wird.

Attributwerte, der Leerraum neben den Klammern (siehe
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md)) und Text nach dem Tag werden
nie angefasst.

### Falsch {#incorrect}

```vue
<template lang="pug">
a(href="/"   target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(type="text",   name="q")
</template>
```

### Richtig {#correct}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

```vue
<template lang="pug">
p(title="a   b")   spaced   text
</template>
```

## Optionen {#options}

Keine.
