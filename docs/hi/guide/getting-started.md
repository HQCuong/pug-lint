---
description: "eslint-plugin-pug-vue install करें और ESLint से Vue single-file components के Pug templates को lint करें: आवश्यकताएँ, install, flat config और पहला eslint --fix।"
---

# शुरुआत करें

`eslint-plugin-pug-vue` Vue single-file components में `<template lang="pug">` (और `lang="jade"`) को
lint और format करता है:

- eslint-plugin-vue के आपके `vue/*` rules Pug templates पर चलते हैं, अपने सामान्य नामों और
  आपके सामान्य options के साथ।
- [`vue-pug/*` rules](/hi/rules/) खुद Pug को format करते हैं: indentation, attribute layout, quotes,
  commas, shorthands। एक वैकल्पिक rule Pug के compile-time constructs रिपोर्ट करता है।
- Pug template को छूने वाला हर fix ESLint के लागू करने से पहले जाँचा जाता है
  ([fix guard](./fix-guard)), इसलिए `--fix` और fix-on-save templates को नहीं तोड़ते।
- न Prettier और न कोई अलग formatter: fixes ESLint से आते हैं।

## आवश्यकताएँ {#requirements}

- Node.js `^22.13.0 || >=24`
- ESLint `^9.15.0 || ^10.0.0`, केवल flat config (`eslint.config.js`)
- `eslint-plugin-vue` `^10.0.0` और `vue-eslint-parser` `^10.0.0`

## Install {#install}

::: code-group

```sh [npm]
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [pnpm]
pnpm add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [yarn]
yarn add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

:::

## Configure करें {#configure}

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

`...vuePug.configs.recommended` को eslint-plugin-vue configs के **बाद** रखें। यह parser options,
processor और वे rules सेट करता है जिनका Pug के लिए बंद होना ज़रूरी है। बाद का कोई config जो अपना processor सेट करे,
या किसी [crash करने वाले rule](./vue-rules) को फिर चालू कर दे, Pug फ़ाइलों की linting तोड़ देता है।

## चलाएँ {#run-it}

```sh
npx eslint .          # report problems
npx eslint . --fix    # fix what can be fixed
```

VS Code में save पर fix करने के लिए [Editor सेटअप](./editor-setup) देखें।

## अगले कदम {#next-steps}

- [कॉन्फ़िगरेशन](./configuration): दो configs, `baseIndent`, suppress किया गया rule बनाए रखना।
- [Rules](/hi/rules/): हर `vue-pug/*` rule क्या करता है और उसके options।
- बड़े codebase पर लागू करने से पहले [ज्ञात सीमाएँ](./limitations)।
- `eslint-plugin-vue-pug` से आ रहे हैं? [माइग्रेशन गाइड](./migration) पढ़ें।
- oxlint उपयोग करते हैं? उसे ESLint के साथ चलाएँ: [oxlint के साथ उपयोग](./oxlint) देखें।
