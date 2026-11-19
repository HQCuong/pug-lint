---
title: vue-pug/attribute-commas
description: "vue-pug/attribute-commas (eslint-plugin-pug-vue): Pug attribute blocks में attributes के बीच commas ज़रूरी करें या मना करें। Options, उदाहरण और fixes।"
---

# vue-pug/attribute-commas

Pug attribute blocks में attributes के बीच commas ज़रूरी करें या मना करें।

✅ `configs.recommended` में चालू (`warn` पर)। 🔧 `--fix` से ठीक होने योग्य।

## Rule का विवरण {#rule-details}

Pug attributes को whitespace से, commas से, या दोनों से अलग करना स्वीकार करता है। यह rule इस चुनाव को एकरूप
बनाता है:

- `never` (default): attribute block में हर comma रिपोर्ट होता है और हटा दिया जाता है।
- `always`: हर दो attributes के बीच ठीक एक comma। गायब comma उससे पहले वाले attribute के ठीक
  बाद जोड़ा जाता है; उसी अंतराल में अतिरिक्त commas हटा दिए जाते हैं।

दोनों options में, पहले attribute से पहले या आखिरी के बाद का comma रिपोर्ट होता है। जब comma हटाने से दो attributes
चिपक जाएँ (`a(x="1",y="2")`), तो fix उसकी जगह एक space रखता है। यह rule केवल comma characters को छूता है: `always` के साथ,
comma से पहले का whitespace (`x="1" , y="2"`) जैसा है वैसा रहता है, और v1 में कोई दूसरा rule उसे सामान्य नहीं करता।

### गलत {#incorrect}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text",
  name="q"
)
</template>
```

### सही {#correct}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
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
'vue-pug/attribute-commas': ['warn', 'never']
```

`'never'` (default) या `'always'`।

### `["always"]` के साथ गलत {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### `["always"]` के साथ सही {#correct-with-always}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```
