---
description: "oxlint उपयोग करने वाले प्रोजेक्ट में eslint-plugin-pug-vue उपयोग करें: scripts के लिए oxlint, Vue templates के लिए ESLint, और डुप्लिकेट रिपोर्ट से बचने के लिए eslint-plugin-oxlint।"
---

# oxlint के साथ उपयोग

[Oxlint](https://oxc.rs/docs/guide/usage/linter) Rust में लिखा गया कहीं अधिक तेज़ linter है। `.vue` फ़ाइल में
वह केवल `<script>` blocks को lint करता है: वह `<template>`, HTML या Pug को lint नहीं करता, और
इस plugin को load नहीं कर सकता, जिसे template पढ़ने के लिए vue-eslint-parser चाहिए।

इसलिए oxlint उपयोग करने वाले प्रोजेक्ट में दोनों चलाएँ:

- JavaScript और TypeScript के लिए **oxlint**, `.vue` फ़ाइलों के `<script>` समेत;
- जो oxlint अभी नहीं कर सकता उसके लिए **ESLint**: templates, eslint-plugin-vue और
  `eslint-plugin-pug-vue` के साथ।

[`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) ESLint में हर वह rule बंद कर देता है
जिसे आपका oxlint config पहले से चलाता है, इसलिए कोई समस्या दो बार रिपोर्ट नहीं होती और ESLint को
कम काम करना पड़ता है।

## Install {#install}

```sh
npm install --save-dev oxlint eslint-plugin-oxlint \
  eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

## oxlint को configure करें {#configure-oxlint}

`npx oxlint --init` से `.oxlintrc.json` बनाएँ, और उसके plugins में `vue` जोड़ें ताकि oxlint अपने Vue rules
भी `<script>` blocks पर चलाए:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "vue"],
  "categories": {
    "correctness": "error"
  }
}
```

## ESLint को configure करें {#configure-eslint}

oxlint config को `vuePug.configs.recommended` के बाद, **सबसे अंत** में रखें:

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'
import oxlint from 'eslint-plugin-oxlint'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  // Last: turn off the rules that .oxlintrc.json already runs.
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
]
```

जो rules यह बंद करता है वे script rules हैं (`no-debugger`, `vue/no-dupe-keys`,
`vue/valid-define-props`, …)। यह कोई template rule और कोई `vue-pug/*` rule बंद नहीं करता, इसलिए Pug
templates ठीक वैसे ही lint और format होते हैं जैसे oxlint के बिना।

## इन्हें चलाएँ {#run-them}

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint:fix": "oxlint --fix && eslint . --fix"
  }
}
```

Oxlint पहले चलता है: उसमें milliseconds लगते हैं, और उसकी errors ESLint के शुरू होने से पहले दिख जाती हैं। Oxlint
आपकी `.gitignore` में सूचीबद्ध फ़ाइलें छोड़ देता है, इसलिए यदि `node_modules` वहाँ पहले से नहीं है तो उसे जोड़ें।

`&&` पहले ऐसे linter पर रुक जाता है जो अब भी error रिपोर्ट करे। यदि oxlint को कोई ऐसी error मिलती है जिसे वह ठीक नहीं कर सकता
(मान लीजिए `debugger` statement), तो `lint:fix` वहीं रुक जाता है और ESLint templates को format नहीं करता। उस
error को ठीक करें, या `npx eslint . --fix` को अकेले चलाएँ।

## VS Code {#vs-code}

[ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) के साथ
[Oxc extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) install करें,
और दोनों को save पर fix करने दें:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```

दोनों कभी एक ही चीज़ ठीक नहीं करते: oxlint scripts ठीक करता है, ESLint templates ठीक करता है, और Pug template में
ESLint का हर fix अब भी [fix guard](./fix-guard) से गुज़रता है।

## ESLint के बिना? {#without-eslint}

अभी नहीं। Oxlint JavaScript में लिखे ESLint plugins चला सकता है, लेकिन वह उन्हें `.vue` फ़ाइल के केवल
`<script>` blocks देता है, और custom parsers तथा Vue templates जैसी file languages पर
oxc में अभी काम चल रहा है। जब oxlint Vue templates को lint कर सकेगा, तब यह plugin भी साथ चल सकता है: इसका parser,
`pug-lint-parser`, ESLint पर निर्भर नहीं है। तब तक `.vue` templates के लिए ESLint रखें।
