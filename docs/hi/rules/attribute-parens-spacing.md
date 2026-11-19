---
title: vue-pug/attribute-parens-spacing
description: "vue-pug/attribute-parens-spacing (eslint-plugin-pug-vue): Pug attribute blocks की parentheses के अंदर एकरूप spacing लागू करें। Options, उदाहरण और fixes।"
---

# vue-pug/attribute-parens-spacing

Pug attribute blocks की parentheses के अंदर एकरूप spacing लागू करें।

✅ `configs.recommended` में चालू (`warn` पर)। 🔧 `--fix` से ठीक होने योग्य।

`vue/html-closing-bracket-spacing` की जगह लेता है, जो Pug templates पर crash करता है और
`configs.base` से बंद है।

## Rule का विवरण {#rule-details}

Rule उसी line पर `(` के ठीक बाद और `)` के ठीक पहले का whitespace जाँचता है:

- `never` (default): वहाँ कोई whitespace नहीं। Fix उसे हटा देता है।
- `always`: वहाँ कम से कम एक space। Fix एक जोड़ देता है।

जिस तरफ के whitespace में line break हो वह
[`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) के अधीन है और छोड़ दिया जाता है, और
खाली या केवल whitespace वाला block भी।

### गलत {#incorrect}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```

```vue
<template lang="pug">
input( type="text" name="q")
</template>
```

### सही {#correct}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

## Options {#options}

```js
'vue-pug/attribute-parens-spacing': ['warn', 'never']
```

`'never'` (default) या `'always'`।

### `["always"]` के साथ गलत {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

### `["always"]` के साथ सही {#correct-with-always}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```
