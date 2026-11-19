---
title: vue-pug/indent
description: "vue-pug/indent (eslint-plugin-pug-vue): Pug templates में एकरूप indentation लागू करें। Options, उदाहरण और fixes।"
---

# vue-pug/indent

Pug templates में एकरूप indentation लागू करें।

✅ `configs.recommended` में चालू (`warn` पर)। 🔧 `--fix` से ठीक होने योग्य।

`vue/html-indent` की जगह लेता है, जो Pug templates पर crash करता है और `configs.base` से बंद है।

## Rule का विवरण {#rule-details}

Rule `<template lang="pug">` block की हर line का शुरुआती whitespace जाँचता है:

- Tag, text, code या control line हर nesting level के लिए एक unit indent होती है।
- Multi-line attribute block में, attribute lines tag से एक level गहरी होती हैं, और जो line
  बंद करने वाले `)` से शुरू होती है वह tag के level पर होती है।
- Text block (`p.`, `pre.`, `script.`), comment, code block या filter की पहली line के बाद की lines
  पहली line के सापेक्ष अपना offset रखती हैं, इसलिए block हिलने पर उसकी अपनी indentation बची रहती है।
  जब indent character बदलता है (spaces से tabs या उल्टा), तो पहली line से कम indent वाली line अपना offset नहीं रख
  सकती: उसे पहली line की indentation मिलती है, क्योंकि tabs और spaces को मिलाना Pug syntax error है।
- जो lines string या template literal के अंदर शुरू होती हैं उन्हें कभी दोबारा indent नहीं किया जाता: उनका शुरुआती
  whitespace value का हिस्सा है।
- जिस region को parser error बताता है, उसकी lines छोड़ दी जाती हैं।

Pug की indentation ही structure है: किसी line को उसके siblings और children के बिना हिलाने से tree बदल जाता है।
इसलिए template की हर रिपोर्ट के साथ वही fix आता है, जो पूरे span को एक साथ दोबारा indent करता है। एक
बची हुई रिपोर्ट ही एक पास में सबको ठीक करने के लिए काफ़ी है।

### गलत {#incorrect}

```vue
<template lang="pug">
div
   p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
      v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

### सही {#correct}

```vue
<template lang="pug">
div
  p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
    v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

```vue
<template lang="pug">
div
  pre.
    first line
      keeps its extra indentation
  p(title=`a
      b`)
</template>
```

## Options {#options}

```js
'vue-pug/indent': ['warn', 2, { baseIndent: 0 }]
```

- पहला option: indent unit, spaces की संख्या (default `2`) या `'tab'`।
- `baseIndent` (default `0`): हर line में जोड़े गए units की संख्या, ताकि सबसे ऊपरी nodes को `<template>` के सापेक्ष
  indent किया जा सके।

### `["tab"]` के साथ गलत {#incorrect-with-tab}

```vue
<template lang="pug">
div
  p Hello
</template>
```

### `["tab"]` के साथ सही {#correct-with-tab}

```vue
<template lang="pug">
div
	p Hello
</template>
```

### `[2, { "baseIndent": 1 }]` के साथ सही {#correct-with-2-baseindent-1}

```vue
<template lang="pug">
  div
    p Hello
</template>
```
