---
title: vue-pug/attribute-equals-spacing
description: "vue-pug/attribute-equals-spacing (eslint-plugin-pug-vue): Pug attributes के `=` और `!=` के आसपास spaces मना करें। Options, उदाहरण और fixes।"
---

# vue-pug/attribute-equals-spacing

Pug attributes के `=` और `!=` के आसपास spaces मना करें।

✅ `configs.recommended` में चालू (`warn` पर)। 🔧 `--fix` से ठीक होने योग्य।

Pug templates के अंदर `vue/no-spaces-around-equal-signs-in-attribute` की जगह लेता है।

## Rule का विवरण {#rule-details}

Attribute के नाम और उसके `=` / `!=` के बीच, और operator तथा value के बीच का whitespace खाली होना
चाहिए। Fix उसे हटा देता है। जिस अंतराल में line break हो उसे छोड़ दिया जाता है।

### गलत {#incorrect}

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

### सही {#correct}

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

## Options {#options}

कोई नहीं।
