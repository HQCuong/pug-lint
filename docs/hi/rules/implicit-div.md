---
title: vue-pug/implicit-div
description: "vue-pug/implicit-div (eslint-plugin-pug-vue): class और id shorthands से पहले tag name `div` लागू करें या मना करें। Options, उदाहरण और fixes।"
---

# vue-pug/implicit-div

Class और id shorthands से पहले tag name `div` लागू करें या मना करें।

✅ `configs.recommended` में चालू (`warn` पर)। 🔧 `--fix` से ठीक होने योग्य।

## Rule का विवरण {#rule-details}

Pug में, जो line `.class` या `#id` shorthand से शुरू होती है वह एक `div` है।

- `always` (default): implicit रूप उपयोग करें। Shorthand से पहले लिखा गया स्पष्ट `div` रिपोर्ट होता है
  और fix नाम हटा देता है।
- `never`: `div` लिखें। जो tag shorthand से शुरू होता है वह रिपोर्ट होता है और fix `div` जोड़ देता है।

Shorthands के बिना `div` (`div`, `div(v-if="ok")`) कभी रिपोर्ट नहीं होता। `always` के तहत दो मामले
बिना fix के रिपोर्ट होते हैं: tag interpolation के अंदर का `div` (`#[div.a x]`), और ऐसा `div` जिसका
पहला shorthand नाम के ठीक बाद नहीं आता (`div(a).b`), क्योंकि नाम हटाने से ऐसी line बच जाती जो `(` से शुरू होती है।

### गलत {#incorrect}

```vue
<template lang="pug">
div.card Content
</template>
```

```vue
<template lang="pug">
div#app.container
  p Hello
</template>
```

### सही {#correct}

```vue
<template lang="pug">
.card Content
</template>
```

```vue
<template lang="pug">
#app.container
  div(v-if="ready") Hello
</template>
```

## Options {#options}

```js
'vue-pug/implicit-div': ['warn', 'always']
```

`'always'` (default) या `'never'`।

### `["never"]` के साथ गलत {#incorrect-with-never}

```vue
<template lang="pug">
.card Content
</template>
```

### `["never"]` के साथ सही {#correct-with-never}

```vue
<template lang="pug">
div.card Content
</template>
```
