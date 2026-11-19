---
title: vue-pug/attribute-equals-spacing
description: "vue-pug/attribute-equals-spacing (eslint-plugin-pug-vue): Leerzeichen um das `=` und `!=` von Pug-Attributen verbieten. Optionen, Beispiele und Fixes."
---

# vue-pug/attribute-equals-spacing

Leerzeichen um das `=` und `!=` von Pug-Attributen verbieten.

✅ In `configs.recommended` aktiviert (auf `warn`). 🔧 Mit `--fix` behebbar.

Ersetzt `vue/no-spaces-around-equal-signs-in-attribute` innerhalb von Pug-Templates.

## Regeldetails {#rule-details}

Der Leerraum zwischen einem Attributnamen und seinem `=` / `!=` sowie zwischen dem Operator und dem
Wert muss leer sein. Der Fix entfernt ihn. Eine Lücke, die einen Zeilenumbruch enthält, bleibt
unangetastet.

### Falsch {#incorrect}

```vue
<template lang="pug">
a(href = "/") Home
</template>
```

```vue
<template lang="pug">
input(:value= "query" @input ="update")
</template>
```

### Richtig {#correct}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

```vue
<template lang="pug">
div(v-html!="html" :title="title")
</template>
```

## Optionen {#options}

Keine.
