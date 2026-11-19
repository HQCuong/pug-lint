---
title: vue-pug/attribute-parens-newline
description: "vue-pug/attribute-parens-newline (eslint-plugin-pug-vue): multiline Pug attribute blocks में `(` के बाद और `)` से पहले line breaks लागू करें। Options, उदाहरण और fixes।"
---

# vue-pug/attribute-parens-newline

Multiline Pug attribute blocks में `(` के बाद और `)` से पहले line breaks लागू करें।

✅ `configs.recommended` में चालू (`warn` पर)। 🔧 `--fix` से ठीक होने योग्य।

Pug templates के अंदर `vue/first-attribute-linebreak` और `vue/html-closing-bracket-newline` की जगह लेता है।

## Rule का विवरण {#rule-details}

Attribute block multiline तब है जब उसके दो attributes अलग-अलग lines पर शुरू होते हैं।

- `multiline: 'always'` (default): multiline block में `(` के ठीक बाद और `)` के ठीक पहले line break चाहिए।
  Fix line break को template की अपनी line ending और indentation unit के साथ जोड़ता है
  (पहला attribute tag से एक level गहरा, `)` tag के level पर)।
- `multiline: 'never'`: multiline block में वे line breaks नहीं होने चाहिए।

जो block multiline नहीं है (एक attribute वाला block समेत) उसमें भी वे नहीं होने चाहिए। Parentheses के पास की उसी line के spaces
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md) के अधीन हैं; खाली block को छोड़ दिया जाता है।

### गलत {#incorrect}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```

```vue
<template lang="pug">
input(
  type="text"
)
</template>
```

### सही {#correct}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

```vue
<template lang="pug">
input(type="text" name="q")
</template>
```

## Options {#options}

```js
'vue-pug/attribute-parens-newline': ['warn', { multiline: 'always' }]
```

`multiline`: `'always'` (default) या `'never'`।

### `[{ "multiline": "never" }]` के साथ गलत {#incorrect-with-multiline-never}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

### `[{ "multiline": "never" }]` के साथ सही {#correct-with-multiline-never}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```
