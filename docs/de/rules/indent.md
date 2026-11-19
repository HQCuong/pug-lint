---
title: vue-pug/indent
description: "vue-pug/indent (eslint-plugin-pug-vue): Einheitliche Einrückung in Pug-Templates vorschreiben. Optionen, Beispiele und Fixes."
---

# vue-pug/indent

Einheitliche Einrückung in Pug-Templates vorschreiben.

✅ In `configs.recommended` aktiviert (auf `warn`). 🔧 Mit `--fix` behebbar.

Ersetzt `vue/html-indent`, das auf Pug-Templates abstürzt und von `configs.base` abgeschaltet wird.

## Regeldetails {#rule-details}

Die Regel prüft den führenden Leerraum jeder Zeile in einem `<template lang="pug">`-Block:

- Eine Tag-, Text-, Code- oder Kontrollzeile wird um eine Einheit pro Verschachtelungsebene eingerückt.
- In einem mehrzeiligen Attributblock liegen die Attributzeilen eine Ebene tiefer als das Tag, und
  eine Zeile, die mit der schließenden `)` beginnt, liegt auf der Ebene des Tags.
- Zeilen eines Textblocks (`p.`, `pre.`, `script.`), Kommentars, Codeblocks oder Filters nach der
  ersten behalten ihren Versatz relativ zur ersten Zeile, sodass die eigene Einrückung des Blocks
  beim Verschieben erhalten bleibt. Ändert sich das Einrückungszeichen (Leerzeichen zu Tabs oder
  zurück), kann eine Zeile, die weniger eingerückt ist als die erste, ihren Versatz nicht behalten:
  Sie bekommt die Einrückung der ersten Zeile, da das Mischen von Tabs und Leerzeichen ein
  Pug-Syntaxfehler ist.
- Zeilen, die innerhalb eines Strings oder Template-Literals beginnen, werden nie neu eingerückt:
  Ihr führender Leerraum ist Teil des Werts.
- Zeilen in einer Region, die der Parser als Fehler meldet, werden übersprungen.

Die Pug-Einrückung ist die Struktur: Wer eine Zeile ohne ihre Geschwister und Kinder verschiebt,
ändert den Baum. Deshalb trägt jede Meldung eines Templates denselben Fix, der die ganze Spanne auf
einmal neu einrückt. Eine übrig gebliebene Meldung genügt, um alle in einem Durchlauf zu beheben.

### Falsch {#incorrect}

```vue
<template lang="pug">
div
   p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
      v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

### Richtig {#correct}

```vue
<template lang="pug">
div
  p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
    v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

```vue
<template lang="pug">
div
  pre.
    first line
      keeps its extra indentation
  p(title=`a
      b`)
</template>
```

## Optionen {#options}

```js
'vue-pug/indent': ['warn', 2, { baseIndent: 0 }]
```

- Erste Option: die Einrückungseinheit, eine Anzahl Leerzeichen (Standard `2`) oder `'tab'`.
- `baseIndent` (Standard `0`): die Anzahl Einheiten, die zu jeder Zeile hinzukommen, sodass
  Knoten der obersten Ebene relativ zu `<template>` eingerückt werden können.

### Falsch mit `["tab"]` {#incorrect-with-tab}

```vue
<template lang="pug">
div
  p Hello
</template>
```

### Richtig mit `["tab"]` {#correct-with-tab}

```vue
<template lang="pug">
div
	p Hello
</template>
```

### Richtig mit `[2, { "baseIndent": 1 }]` {#correct-with-2-baseindent-1}

```vue
<template lang="pug">
  div
    p Hello
</template>
```
