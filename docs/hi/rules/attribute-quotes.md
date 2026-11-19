---
title: vue-pug/attribute-quotes
description: "vue-pug/attribute-quotes (eslint-plugin-pug-vue): Pug attribute values के लिए एकरूप quote style लागू करें। Options, उदाहरण और fixes।"
---

# vue-pug/attribute-quotes

Pug attribute values के लिए एकरूप quote style लागू करें।

✅ `configs.recommended` में चालू (`warn` पर)। 🔧 `--fix` से ठीक होने योग्य।

Pug templates के अंदर `vue/html-quotes` की जगह लेता है। उस rule का fixer भीतरी quotes को
`&quot;` के रूप में escape करता है, जो Pug में गलत है (attribute value एक JavaScript expression है), और वह
यह नहीं जानता कि backticks वैध Pug quotes हैं।

## Rule का विवरण {#rule-details}

जो value दूसरी quote style में एक `'…'` या `"…"` string है, वह रिपोर्ट होता है। Fix केवल दोनों quote
characters की अदला-बदली करता है, और कुछ भी दोबारा escape नहीं करता: जब value में लक्ष्य quote या backslash हो,
तो वह बिना fix के रिपोर्ट होता है।

Backtick values default रूप से बने रहते हैं। `backticks: 'convert'` के साथ, backtick value तभी रिपोर्ट और
fix होता है जब वह एक line में हो और उसमें `${}`, quote और backslash न हों; दूसरे backtick
values छोड़ दिए जाते हैं। जो values एक अकेले literal नहीं हैं (`x`, `a + 'b'`, `{ a: 1 }`) उन्हें कभी
नहीं छुआ जाता।

### गलत {#incorrect}

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

दूसरा उदाहरण बिना fix के रिपोर्ट होता है: quotes की अदला-बदली के लिए escaping चाहिए होगी।

### सही {#correct}

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

## Options {#options}

```js
'vue-pug/attribute-quotes': ['warn', 'double', { backticks: 'keep' }]
```

- पहला option: `'double'` (default) या `'single'`।
- `backticks`: `'keep'` (default) या `'convert'`।

### `["single"]` के साथ गलत {#incorrect-with-single}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

### `["single"]` के साथ सही {#correct-with-single}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

### `["double", { "backticks": "convert" }]` के साथ गलत {#incorrect-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello`) Hi
</template>
```

### `["double", { "backticks": "convert" }]` के साथ सही {#correct-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello ${name}`) Hi
</template>
```
