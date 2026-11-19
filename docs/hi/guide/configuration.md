---
description: "eslint-plugin-pug-vue को कॉन्फ़िगर करें: base और recommended configs, <template> के नीचे indent किए गए templates, suppress किया गया vue/* rule बनाए रखना, और plugin key।"
---

# कॉन्फ़िगरेशन

## दो configs {#the-two-configs}

दोनों configs `**/*.vue` पर लागू होते हैं।

| Config | यह क्या सेट करता है |
|---|---|
| `configs.base` | vue-eslint-parser के लिए Pug template tokenizer, processor (संदेशों का suppression और [fix guard](./fix-guard)), और बंद किए गए [crash करने वाले `vue/*` rules](./vue-rules)। कोई `vue-pug/*` rule चालू नहीं होता। |
| `configs.recommended` | `base` और हर recommended `vue-pug/*` rule `warn` पर। |

जब आप `vue-pug/*` rules खुद चुनना चाहें, तब `base` उपयोग करें:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.base,
  {
    files: ['**/*.vue'],
    rules: {
      'vue-pug/indent': 'error',
      'vue-pug/attribute-quotes': ['error', 'single'],
    },
  },
]
```

आपके अपने `languageOptions.parserOptions` (जैसे `<script>` में TypeScript के लिए `parser`) plugin के
options के साथ merge हो जाते हैं, इसलिए वे काम करते रहते हैं।

## `<template>` के नीचे indent किए गए templates {#templates-indented-under-template}

`vue-pug/indent` सबसे ऊपरी nodes को column 0 पर रखता है (`baseIndent: 0`, जैसे `.pug` फ़ाइलों में)। यदि आपके
templates `<template>` से एक level नीचे लिखे हैं, तो `baseIndent: 1` सेट करें, वरना rule उन्हें
column 0 पर ले आएगा:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  { files: ['**/*.vue'], rules: { 'vue-pug/indent': ['warn', 2, { baseIndent: 1 }] } },
]
```

सभी options के लिए [`vue-pug/indent`](/hi/rules/indent) देखें।

## Suppress किया गया rule बनाए रखना {#keeping-a-suppressed-rule}

कुछ `vue/*` rules [Pug templates के अंदर suppress किए जाते हैं](./vue-rules)। किसी को वहाँ भी रिपोर्ट करने देने के लिए,
configs को `configure()` से बनाएँ और `vuePug.configs` की जगह उन्हें उपयोग करें:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configure({ keepVueRules: ['vue/html-self-closing'] }).recommended,
]
```

यह आपके अपने जोखिम पर है। suppressed सूची का कोई rule झूठी समस्याएँ रिपोर्ट कर सकता है, और उसके fixes
Pug पर स्थिर न हों: उदाहरण के लिए, `vue/singleline-html-element-content-newline` हर पास में एक और
खाली line जोड़ देता है। `keepVueRules` crash करने वाले rules पर लागू नहीं होता, वे बंद ही रहते हैं।

## Plugin key {#plugin-key}

Plugin `vue-pug` key के तहत register होता है। सभी rule ids (`vue-pug/indent`, …) और configs इसी का उपयोग करते हैं।
Plugin को किसी दूसरी key के तहत register करना समर्थित नहीं है।

## Trailing spaces, खाली lines, अंतिम newline {#trailing-spaces-blank-lines-final-newline}

`vue-pug/*` rules इन्हें नहीं संभालते। [`@stylistic`](https://eslint.style/) rules
`@stylistic/no-trailing-spaces`, `@stylistic/no-multiple-empty-lines` और `@stylistic/eol-last` उपयोग करें:
वे पूरी `.vue` फ़ाइल पर काम करते हैं, Pug templates समेत, और fix guard उनके fixes को
किसी भी दूसरे fix की तरह जाँचता है।
