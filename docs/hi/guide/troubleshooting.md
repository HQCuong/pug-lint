---
description: "eslint-plugin-pug-vue की आम समस्याएँ ठीक करें: crash करने वाले vue/* rules, लागू न होने वाले fixes, Pug templates में कुछ भी रिपोर्ट न होना।"
---

# समस्या निवारण

## `TypeError: Cannot read properties of null (reading 'type')` (या `'range'`) {#typeerror-cannot-read-properties-of-null-reading-type-or-range}

Pug templates पर crash करने वाले `vue/*` rules में से एक को `...vuePug.configs.recommended` (या `base`) के बाद
रखे गए किसी config ने फिर चालू कर दिया है, जैसे कोई साझा config या कोई `rules` entry जो उसे चालू करती है।
`configs.base` इन्हें हर `.vue` फ़ाइल के लिए बंद करता है:

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

`...vuePug.configs.recommended` को उन्हें चालू करने वाले हर config के बाद रखें, या उन्हें अपने
`rules` से हटा दें। Pug templates के लिए इसके बजाय `vue-pug/*` replacement उपयोग करें।

## समस्या रिपोर्ट होती है लेकिन `--fix` उसे ठीक नहीं करता {#a-problem-is-reported-but-fix-does-not-fix-it}

[Fix guard](./fix-guard) ने fix हटा दिया, क्योंकि उसे लागू करने से template का
structure बदल जाता या वह parse न हो पाता। उस line को हाथ से ठीक करें। यदि आपको लगता है कि fix सुरक्षित था, तो कृपया
template के साथ [issue खोलें](https://github.com/HQCuong/pug-lint/issues/new/choose)।

यह भी जाँचें कि template में `vue/no-parsing-error` की कोई समस्या न हो: जब तक template में Pug
syntax error है, उसके अंदर कोई fix लागू नहीं होता।

## Pug templates में कुछ भी रिपोर्ट नहीं होता {#nothing-is-reported-in-pug-templates}

- Block `<template lang="pug">` या `<template lang="jade">` होना चाहिए।
- `...vuePug.configs.recommended` (या `base`) eslint-plugin-vue configs के बाद आना चाहिए, और बाद का कोई
  config `**/*.vue` के लिए अपना `processor` सेट न करे।
- VS Code में `vue` का `eslint.validate` में होना ज़रूरी है ([Editor सेटअप](./editor-setup) देखें)।

## Editor और CLI में अंतर आता है {#the-editor-and-the-cli-disagree}

ESLint extension आपके terminal से अलग ESLint या अलग config उपयोग कर सकता है। `npx eslint --print-config src/App.vue`
चलाएँ और extension के output panel (*ESLint* channel) से तुलना करें।
