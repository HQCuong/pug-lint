---
description: "eslint-plugin-vue-pug से eslint-plugin-pug-vue पर जाएँ: uninstall, flat config, और जो rules बदले।"
---

# eslint-plugin-vue-pug से माइग्रेट करना

`eslint-plugin-vue-pug` खुद को उसी `vue-pug` key के तहत register करता है, इसलिए दोनों plugins को एक साथ
उपयोग नहीं किया जा सकता।

1. `eslint-plugin-vue-pug` और `vue-eslint-parser-template-tokenizer-pug` को uninstall करें, और अपने config से
   `plugin:vue-pug/...` entries हटाएँ। इस plugin को flat config चाहिए।
2. इस plugin को [शुरुआत करें](./getting-started) की तरह install और configure करें।
3. पुराने rules बदलें:
   - `vue-pug/no-parsing-error` → `vue/no-parsing-error`, जो Pug syntax errors रिपोर्ट करता है और
     `flat/base` को छोड़कर हर eslint-plugin-vue config में चालू है।
   - `vue-pug/component-name-in-template-casing` → कोई नहीं: `vue/component-name-in-template-casing`
     Pug templates पर crash करता है और बंद है।
   - `vue-pug/no-pug-control-flow` की id वही रहती है, लेकिन उसके options अलग हैं: पुराना rule कोई
     options नहीं लेता था और पुराने `strongly-recommended` configs में चालू था; यह
     `{ allow: [...] }` लेता है और किसी config में नहीं है। देखें
     [उसके docs](/hi/rules/no-pug-control-flow#migrating-from-eslint-plugin-vue-pug)।

पुराने configs कुछ layout rules (`vue/html-indent`, `vue/html-self-closing`, …) को हर जगह बंद कर देते थे।
यहाँ वे HTML templates के लिए चालू रहते हैं और केवल Pug templates के अंदर suppress किए जाते हैं
([crash करने वाले](./vue-rules) को छोड़कर), और उनकी जगह `vue-pug/*` rules काम करते हैं।
