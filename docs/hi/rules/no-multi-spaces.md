---
title: vue-pug/no-multi-spaces
description: "vue-pug/no-multi-spaces (eslint-plugin-pug-vue): Pug attribute blocks में attributes के बीच कई spaces मना करें। Options, उदाहरण और fixes।"
---

# vue-pug/no-multi-spaces

Pug attribute blocks में attributes के बीच कई spaces मना करें।

✅ `configs.recommended` में चालू (`warn` पर)। 🔧 `--fix` से ठीक होने योग्य।

Pug templates के अंदर `vue/no-multi-spaces` की जगह लेता है।

## Rule का विवरण {#rule-details}

एक ही block के दो attributes के बीच, एक line पर, दो या अधिक spaces या tabs का क्रम रिपोर्ट होता है, और
fix उसे एक space से बदल देता है। Comma अपने से पहले वाले attribute के साथ रहता है, इसलिए अंतराल के
आखिरी comma के बाद का whitespace ही मापा जाता है।

Attribute values, parentheses के पास का whitespace ([`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md)
देखें) और tag के बाद का text कभी नहीं छुए जाते।

### गलत {#incorrect}

```vue
<template lang="pug">
a(href="/"   target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(type="text",   name="q")
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
p(title="a   b")   spaced   text
</template>
```

## Options {#options}

कोई नहीं।
