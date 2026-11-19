---
title: vue-pug/self-closing
description: "vue-pug/self-closing (eslint-plugin-pug-vue): tag का self-closing `/` लागू करें या मना करें। Options, उदाहरण और fixes।"
---

# vue-pug/self-closing

Tag का self-closing `/` लागू करें या मना करें।

✅ `configs.recommended` में चालू (`warn` पर)। 🔧 `--fix` से ठीक होने योग्य।

Pug templates के अंदर `vue/html-self-closing` और `vue/html-end-tags` की जगह लेता है।

## Rule का विवरण {#rule-details}

- `never` (default): tag के बाद का हर `/` (`img/`, `MyIcon/`) रिपोर्ट होता है।
- `always-components`: जिस component (ऐसा tag name जिसमें uppercase अक्षर या hyphen हो) में कोई
  सामग्री नहीं है, उसे `/` पर खत्म होना चाहिए, और fix उसे जोड़ देता है। हर दूसरे tag में `/` नहीं होना चाहिए। जिस component में
  पहले से `/` है उसे छोड़ दिया जाता है।

Pug `p/ text` को `<p/>` और उसके बाद text के रूप में render करता है, और nested lines वाले tag पर `/` को अस्वीकार करता है।
इसलिए fix `/` तभी हटाता है जब उसकी line पर उसके बाद कुछ न हो (एक space भी नहीं) और tag की
unbuffered comments (`//-`) के अलावा कोई nested lines न हों। वरना `/` बिना fix के रिपोर्ट होता है। जिस tag में
कोई भी सामग्री हो (text, code, `.`, nested lines, अंत में एक space भी) उसमें `/` कभी नहीं जोड़ा जाता।

### गलत {#incorrect}

```vue
<template lang="pug">
img(src="logo.png")/
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")/
</template>
```

### सही {#correct}

```vue
<template lang="pug">
img(src="logo.png")
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")
  br
</template>
```

## Options {#options}

```js
'vue-pug/self-closing': ['warn', 'never']
```

`'never'` (default) या `'always-components'`।

### `["always-components"]` के साथ गलत {#incorrect-with-always-components}

```vue
<template lang="pug">
MyIcon(name="star")
</template>
```

### `["always-components"]` के साथ सही {#correct-with-always-components}

```vue
<template lang="pug">
div
  MyIcon(name="star")/
  my-icon/
  MyButton Save
  img(src="logo.png")
</template>
```
