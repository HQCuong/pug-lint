---
title: vue-pug/max-attributes-per-line
description: "vue-pug/max-attributes-per-line (eslint-plugin-pug-vue): Pug attribute blocks में प्रति line attributes की अधिकतम संख्या लागू करें। Options, उदाहरण और fixes।"
---

# vue-pug/max-attributes-per-line

Pug attribute blocks में प्रति line attributes की अधिकतम संख्या लागू करें।

✅ `configs.recommended` में चालू (`warn` पर)। 🔧 `--fix` से ठीक होने योग्य।

Pug templates के अंदर `vue/max-attributes-per-line` की जगह लेता है।

## Rule का विवरण {#rule-details}

Attributes गिने जाते हैं प्रति attribute block: `a(w x)(y z)` में दो-दो attributes के दो blocks हैं।

- एक line के block में `singleline` तक attributes हो सकते हैं (default `3`)। उससे ऊपर, पहले के बाद
  का हर attribute रिपोर्ट होता है।
- जिस block में कोई भी line break हो, value के अंदर वाला भी, वह multiline है। उसकी हर
  line में `multiline` तक attributes हो सकते हैं (default `1`); अतिरिक्त वाले रिपोर्ट होते हैं।

Fix रिपोर्ट हुए attribute से पहले के whitespace को line break से बदलता है, जो tag से एक level गहरा
indent होता है (comma अपने से पहले वाले attribute के साथ रहता है)। `(` के बाद और `)` से पहले के line breaks
[`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) पर छोड़े गए हैं। Tag interpolation
(`#[a(x y z w)]`) के अंदर के tags नहीं जाँचे जाते: वे text line का हिस्सा हैं।

### गलत {#incorrect}

```vue
<template lang="pug">
input(type="text" name="q" placeholder="Search" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text" name="q"
  required
)
</template>
```

### सही {#correct}

```vue
<template lang="pug">
input(type="text" name="q" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
  placeholder="Search"
  required
)
</template>
```

## Options {#options}

```js
'vue-pug/max-attributes-per-line': ['warn', { singleline: 3, multiline: 1 }]
```

- `singleline` (integer ≥ 1, default `3`): एक line के block के लिए अधिकतम।
- `multiline` (integer ≥ 1, default `1`): multiline block में प्रति line अधिकतम।

### `[{ "singleline": 1 }]` के साथ गलत {#incorrect-with-singleline-1}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### `[{ "singleline": 1 }]` के साथ सही {#correct-with-singleline-1}

```vue
<template lang="pug">
a(href="/") Home
</template>
```
