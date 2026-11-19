---
title: vue-pug/no-pug-control-flow
description: "vue-pug/no-pug-control-flow (eslint-plugin-pug-vue): Pug-Konstrukte der Kompilierzeit verbieten (Kontrollstrukturen, Code, Mixins, `#{}`-Interpolation, Includes). Optionen, Beispiele und Fixes."
---

# vue-pug/no-pug-control-flow

Pug-Konstrukte der Kompilierzeit verbieten (Kontrollstrukturen, Code, Mixins, `#{}`-Interpolation, Includes).

In `configs.recommended` nicht aktiviert. Nicht behebbar.

## Regeldetails {#rule-details}

Pug-Bedingungen, -Schleifen, -Code, -Mixins und die `#{}`-Interpolation laufen einmal, wenn das
Template kompiliert wird. Vue sieht sie nie, sie sind also nicht reaktiv, und die `vue/*`-Regeln
sehen die Pug-Logik selbst nicht. Diese Regel meldet sie, damit Templates stattdessen
Vue-Direktiven und -Bindings verwenden. Jedes Konstrukt gehört zu einer Kategorie:

| Kategorie | Meldet |
|---|---|
| `control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default` |
| `code` | `- code`, `= expression`, `!= expression`, `p= expression` |
| `mixin` | Mixin-Definitionen (`mixin name`) und -Aufrufe (`+name`) |
| `interpolation` | `#{…}` und `!{…}` im Text |
| `include` | `include`, `extends`, `block`, `append`, `prepend`, `yield`, `doctype` |

### Falsch {#incorrect}

```vue
<template lang="pug">
ul
  each item in items
    li= item
</template>
```

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Richtig {#correct}

```vue
<template lang="pug">
ul
  li(v-for="item in items" :key="item") {{ item }}
</template>
```

```vue
<template lang="pug">
p(v-if="name") Hello {{ name }}
</template>
```

## Optionen {#options}

```js
'vue-pug/no-pug-control-flow': ['warn', { allow: [] }]
```

`allow`: Kategorien, die nicht gemeldet werden, beliebig aus `'control'`, `'code'`, `'mixin'`,
`'interpolation'`, `'include'` (Standard `[]`).

### Richtig mit `[{ "allow": ["interpolation"] }]` {#correct-with-allow-interpolation}

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Falsch mit `[{ "allow": ["interpolation"] }]` {#incorrect-with-allow-interpolation}

```vue
<template lang="pug">
p= name
</template>
```

## Umstieg von `eslint-plugin-vue-pug` {#migrating-from-eslint-plugin-vue-pug}

`eslint-plugin-vue-pug` hat eine Regel mit derselben ID, `vue-pug/no-pug-control-flow`. Die
Unterschiede:

- Ihr Schema ist leer: Sie nimmt keine Optionen und meldet immer jedes Konstrukt, das sie kennt.
  Diese Regel nimmt `{ allow: [...] }` (siehe oben). Alle Optionen, die Sie der alten Regel
  übergeben haben, wurden von ESLint abgelehnt, eine bestehende Einstellung ohne Optionen
  funktioniert also weiter.
- Die alte Regel wurde von ihren `strongly-recommended`-Configs aktiviert (auf `warn`). Diese Regel
  steckt in keiner Config: Aktivieren Sie sie selbst.
