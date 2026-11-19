---
title: vue-pug/prefer-shorthand
description: "vue-pug/prefer-shorthand (eslint-plugin-pug-vue): static class और id attributes के लिए `.class` / `#id` shorthands लागू करें या मना करें। Options, उदाहरण और fixes।"
---

# vue-pug/prefer-shorthand

Static class और id attributes के लिए `.class` / `#id` shorthands लागू करें या मना करें।

✅ `configs.recommended` में चालू (`warn` पर)। 🔧 `--fix` से ठीक होने योग्य।

## Rule का विवरण {#rule-details}

Class और id अलग-अलग कॉन्फ़िगर होते हैं, हर एक `always`, `never` या `ignore` के साथ।

- `always` (दोनों का default): static `class` या `id` attribute shorthands बन जाता है:
  `p(class="a b")` → `p.a.b`, `p(id="x")` → `p#x`। नए shorthands मौजूदा shorthands के बाद जाते हैं, और
  खाली बचा attribute block हटा दिया जाता है।
- `never`: shorthands एक attribute बन जाते हैं। Classes मौजूदा static `class` attribute में जुड़ती हैं;
  वरना नया attribute पहले attribute block में सबसे पहले (या नए block में) डाला जाता है,
  उस block के पहले string value की quote style के साथ (कोई न हो तो `"`)। जिस tag का न कोई नाम बचे और न shorthand,
  उसे `div` मिलता है।
- `ignore`: उस किस्म को जाँचा नहीं जाता।

केवल static attributes बदले जाते हैं: नाम ठीक `class` या `id` हो, value एक सादी
`'…'` या `"…"` string हो, और उसमें whitespace से अलग हुआ हर token वैध Pug shorthand नाम हो।
यदि कोई token ऐसा नहीं है (`md:flex`, `w-1/2`, `-1`, `1a`), तो पूरा value छोड़ दिया जाता है। `id`
value एक ही token होना चाहिए। Bound attributes (`:class`, `v-bind:id`) को कभी नहीं छुआ जाता। जिस tag में
id shorthand और `id` attribute दोनों हों (Pug में error), वह अपना id जैसा लिखा है वैसा रखता है।

एक tag के सभी रूपांतरण एक ही fix से लागू होते हैं, जो tag की पहली रिपोर्ट के साथ जुड़ा होता है।

### गलत {#incorrect}

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

### सही {#correct}

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

## Options {#options}

```js
'vue-pug/prefer-shorthand': ['warn', { class: 'always', id: 'always' }]
```

`class` और `id`: `'always'` (default), `'never'` या `'ignore'`।

### `[{ "class": "never", "id": "always" }]` के साथ गलत {#incorrect-with-class-never-id-always}

```vue
<template lang="pug">
p.lead Text
</template>
```

### `[{ "class": "never", "id": "always" }]` के साथ सही {#correct-with-class-never-id-always}

```vue
<template lang="pug">
p#intro(class="lead") Text
</template>
```
