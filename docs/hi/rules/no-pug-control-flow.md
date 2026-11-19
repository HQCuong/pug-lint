---
title: vue-pug/no-pug-control-flow
description: "vue-pug/no-pug-control-flow (eslint-plugin-pug-vue): Pug compile-time constructs (control flow, code, mixins, `#{}` interpolation, includes) मना करें। Options, उदाहरण और fixes।"
---

# vue-pug/no-pug-control-flow

Pug compile-time constructs (control flow, code, mixins, `#{}` interpolation, includes) मना करें।

`configs.recommended` में चालू नहीं। `--fix` से ठीक नहीं होता।

## Rule का विवरण {#rule-details}

Pug के conditionals, loops, code, mixins और `#{}` interpolation template के compile होते समय एक बार चलते हैं।
Vue उन्हें कभी नहीं देखता, इसलिए वे reactive नहीं हैं, और `vue/*` rules खुद Pug logic को नहीं देखते। यह rule उन्हें रिपोर्ट
करता है ताकि templates इसके बजाय Vue directives और bindings उपयोग करें। हर construct एक category में आता है:

| Category | क्या रिपोर्ट करता है |
|---|---|
| `control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default` |
| `code` | `- code`, `= expression`, `!= expression`, `p= expression` |
| `mixin` | mixin definitions (`mixin name`) और calls (`+name`) |
| `interpolation` | text में `#{…}` और `!{…}` |
| `include` | `include`, `extends`, `block`, `append`, `prepend`, `yield`, `doctype` |

### गलत {#incorrect}

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

### सही {#correct}

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

## Options {#options}

```js
'vue-pug/no-pug-control-flow': ['warn', { allow: [] }]
```

`allow`: वे categories जो रिपोर्ट नहीं होतीं, `'control'`, `'code'`, `'mixin'`,
`'interpolation'`, `'include'` में से कोई भी (default `[]`)।

### `[{ "allow": ["interpolation"] }]` के साथ सही {#correct-with-allow-interpolation}

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### `[{ "allow": ["interpolation"] }]` के साथ गलत {#incorrect-with-allow-interpolation}

```vue
<template lang="pug">
p= name
</template>
```

## `eslint-plugin-vue-pug` से माइग्रेट करना {#migrating-from-eslint-plugin-vue-pug}

`eslint-plugin-vue-pug` में इसी id वाला एक rule है, `vue-pug/no-pug-control-flow`। अंतर:

- उसकी schema खाली है: वह कोई options नहीं लेता और जितने constructs जानता है सब हमेशा रिपोर्ट करता है। यह rule
  `{ allow: [...] }` लेता है (ऊपर देखें)। पुराने rule को आपने जो भी options दिए थे उन्हें ESLint अस्वीकार कर देता था,
  इसलिए बिना options वाली मौजूदा सेटिंग काम करती रहती है।
- पुराना rule अपने `strongly-recommended` configs में (`warn` पर) चालू था। यह rule किसी
  config में नहीं है: इसे खुद चालू करें।
