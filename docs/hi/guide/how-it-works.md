---
description: "eslint-plugin-pug-vue Vue में Pug को कैसे lint करता है: vue-eslint-parser के लिए Pug tokenizer, vue/* और vue-pug/* rules, और एक fix guard जो हर fix को जाँचता है।"
---

# यह कैसे काम करता है

ESLint अपने आप Pug नहीं पढ़ सकता, और eslint-plugin-vue केवल HTML templates जानता है। Plugin दोनों को
जोड़ता है, फिर ESLint के लिखने से पहले हर fix को जाँचता है।

<HowItWorks />

## 1. Parse {#_1-parse}
[vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser) eslint-plugin-vue के लिए `.vue` फ़ाइलों को parse करता है।
किसी दूसरी भाषा के template के लिए वह एक *tokenizer* से कहता है कि उस भाषा को उन tokens में बदले जो उसे HTML से मिलते।
Plugin `lang="pug"` और `lang="jade"` के लिए एक register करता है।

Tokenizer template को [`pug-lint-parser`](/hi/parser/) से parse करता है, फिर हर Pug element के लिए एक start tag, एक end
tag, text और `{{ }}` tokens बनाता है, Pug source की सटीक positions पर।
vue-eslint-parser उनसे अपना सामान्य template AST बनाता है, इसलिए `vue/*` rules आपके Pug की सही line
और column की ओर इशारा करते हैं।

Pug syntax error एक parse error बन जाती है जिसे `vue/no-parsing-error` रिपोर्ट करता है।

## 2. Lint {#_2-lint}
एक ही फ़ाइल पर दो तरह के rules चलते हैं:

- eslint-plugin-vue के **`vue/*` rules** Vue template AST पढ़ते हैं, जैसे HTML
  template पर: गायब keys, अप्रयुक्त variables, attribute का क्रम, deprecated syntax।
- **`vue-pug/*` rules** `pug-lint-parser` का Pug syntax tree सीधे पढ़ते हैं। वह tree वह सब रखता है
  जो Vue AST खो देता है: indentation, commas, quotes, parentheses, `.class` और `#id` shorthands।
  formatting rules यहीं काम करते हैं।

## 3. Check {#_3-check}
Plugin eslint-plugin-vue के processor को wrap करता है, जो ESLint के उपयोग करने से पहले हर संदेश देखता है:

- **Suppress।** कुछ `vue/*` rules Pug पर काम नहीं कर सकते: वे झूठी समस्याएँ रिपोर्ट करते हैं, या उनके
  fixes Pug template में HTML लिख देते। Pug template के अंदर होने पर उनके संदेश हटा दिए जाते हैं,
  और केवल वहीं, इसलिए वे आपके HTML templates को जाँचते रहते हैं। जो थोड़े rules Pug पर crash करते हैं
  उन्हें इसके बजाय बंद कर दिया जाता है। [सूचियाँ](./vue-rules)।
- **Fix guard।** Pug template को छूने वाला हर fix फ़ाइल की एक copy पर लागू किया जाता है, जिसे
  `pug-lint-parser` फिर से parse करता है। Plugin पहले और बाद का structure तुलना करता है: tags और
  उनकी nesting, classes और ids, attribute की संख्या, text का आकार और हर JavaScript expression। यदि
  कुछ भी बदला, या copy अब parse नहीं होती, तो fix हटा दिया जाता है और उसकी चेतावनी बनी रहती है।
  [विवरण](./fix-guard)।

फिर ESLint बचे हुए fixes को लागू करता है, `eslint --fix` से या आपके editor के fix-on-save से।

## दो packages {#the-two-packages}
| Package | भूमिका |
|---|---|
| [`eslint-plugin-pug-vue`](https://www.npmjs.com/package/eslint-plugin-pug-vue) | ESLint plugin: tokenizer, `vue-pug/*` rules, processor और configs। जिसे आप install करते हैं। |
| [`pug-lint-parser`](/hi/parser/) | वह Pug parser जिस पर ऊपर का सब कुछ बना है। उसे ESLint या Vue के बारे में कुछ नहीं पता, और आप उसे अकेले भी उपयोग कर सकते हैं। |
