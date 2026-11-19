---
description: "eslint-plugin-vue के कौन-से rules Pug templates पर चलते हैं, कौन-से crash करने के कारण बंद हैं, और कौन-से केवल Pug templates के अंदर चुप कराए जाते हैं।"
---

# Pug पर `vue/*` rules

eslint-plugin-vue के ज़्यादातर rules Pug templates पर वैसे ही काम करते हैं जैसे HTML पर। बाकी को एक
compatibility harness मापता है, जो हर rule को Pug templates पर और उनके HTML समतुल्यों पर चलाता है; पूरे
परिणाम [संगतता तालिका](./vue-compatibility) में हैं।

## Crash करने वाले rules: हर जगह बंद {#crashing-rules-off-everywhere}

Pug templates पर **crash** करने वाले rules `configs.base` से बंद किए जाते हैं। Pug element का कोई लिखा हुआ
end tag नहीं होता, इसलिए उसका end tag शून्य-चौड़ाई का होता है, जो इन rules के vue-eslint-parser के token store के उपयोग को तोड़ता है।

Crash को बाद में filter नहीं किया जा सकता, और config केवल फ़ाइलें चुन सकता है, templates नहीं, इसलिए वे
**हर** `.vue` फ़ाइल के लिए बंद हैं, HTML templates समेत। HTML और Pug templates मिलाने वाले प्रोजेक्ट में,
ये rules HTML templates को भी नहीं जाँचते। Pug templates को `vue-pug/*` replacements कवर करते हैं।

## Suppressed rules: केवल Pug के अंदर चुप {#suppressed-rules-silenced-inside-pug-only}

जो rules Pug पर **गलत रिपोर्ट** करते हैं, या जिनके **fixes Pug को तोड़ या reformat कर देते** हैं, वे बंद नहीं किए जाते।
Processor उनके संदेश केवल तब हटाता है जब वे Pug template के अंदर हों, इसलिए वे
HTML templates और `<script>` में काम करते रहते हैं। फिर भी किसी को रखना हो, तो
[Suppress किया गया rule बनाए रखना](./configuration#keeping-a-suppressed-rule) देखें।

## सूचियाँ {#the-lists}

<!-- begin auto-generated vue rule lists -->

Turned off for every `.vue` file by `configs.base`, because they crash on Pug templates:

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

Suppressed inside Pug templates only (they keep working on HTML templates and in `<script>`):

- `vue/array-bracket-newline`
- `vue/array-element-newline`
- `vue/brace-style`
- `vue/first-attribute-linebreak` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-comment-content-newline`
- `vue/html-comment-content-spacing`
- `vue/html-end-tags` (Pug replacement: `vue-pug/self-closing`)
- `vue/html-quotes` (Pug replacement: `vue-pug/attribute-quotes`)
- `vue/html-self-closing` (Pug replacement: `vue-pug/self-closing`)
- `vue/max-attributes-per-line` (Pug replacement: `vue-pug/max-attributes-per-line`)
- `vue/multiline-html-element-content-newline`
- `vue/multiline-ternary`
- `vue/no-multi-spaces` (Pug replacement: `vue-pug/no-multi-spaces`)
- `vue/no-spaces-around-equal-signs-in-attribute` (Pug replacement: `vue-pug/attribute-equals-spacing`)
- `vue/no-unsupported-features`
- `vue/object-curly-newline`
- `vue/object-property-newline`
- `vue/padding-line-between-tags`
- `vue/singleline-html-element-content-newline`
- `vue/static-class-names-order`
- `vue/v-if-else-key`

<!-- end auto-generated vue rule lists -->
