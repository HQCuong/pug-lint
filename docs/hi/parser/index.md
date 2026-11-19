---
title: pug-lint-parser
description: "pug-lint-parser: linting और formatting tools के लिए एक Pug parser, सटीक source ranges और error recovery के साथ। यह कभी throw नहीं करता और इसकी कोई dependencies नहीं हैं।"
---

# pug-lint-parser

Pug templates के लिए एक concrete syntax tree (CST) parser, जो linting और formatting tools के लिए बना है।
यह [`eslint-plugin-pug-vue`](https://github.com/HQCuong/pug-lint/tree/main/packages/eslint-plugin) के पीछे का parser है।

- **कभी throw नहीं करता।** जिस input को वह parse नहीं कर सकता, वह `errors` में एक entry बन जाता है, और parsing
  अगली line से जारी रहती है।
- **सटीक source ranges।** हर node, attribute, value, shorthand, comma और line की एक
  `[start, end)` range होती है: आपके दिए text में UTF-16 offsets, ताकि आप source को slice कर सकें या
  positions बदले बिना न्यूनतम edit बना सकें।
- **Slice को वहीं parse करता है।** `parsePug(text, { start, end })` केवल `text[start, end)` को parse करता है (जैसे
  `<template lang="pug">` block की सामग्री); ranges फिर भी पूरे `text` की ओर इशारा करती हैं।
- **Line endings बनाए रखता है।** LF और CRLF दोनों संभाले जाते हैं; `doc.eol` मिली पहली line ending है।
- कोई runtime dependencies नहीं। केवल ESM। Node.js `^20.19.0 || ^22.13.0 || >=24`।

## उपयोग {#usage}
```js
import { parsePug, walk } from 'pug-lint-parser'

const text = 'ul#list\n  li.item(v-for="x in xs" :key="x") {{ x }}\n'
const doc = parsePug(text)

console.log(doc.errors) // []
walk(doc, (node) => {
  if (node.type === 'Tag') console.log(node.name?.value ?? 'div', text.slice(...node.range))
})
// ul ul#list
// li li.item(v-for="x in xs" :key="x") {{ x }}
```

## API {#api}
हर node type के साथ पूरा संदर्भ साइट पर है: [API](/hi/parser/api),
[syntax tree](/hi/parser/syntax-tree), [errors](/hi/parser/errors) और
[recipes](/hi/parser/recipes)।

- `parsePug(text, options?)` → `PugDocument`। `options.start` / `options.end` parsing को `text` की
  उसी range तक सीमित करते हैं।
- `walk(doc, visit)`: document order में हर node के लिए `visit(node, parent)` बुलाता है, tag interpolations (`#[…]`)
  के अंदर के tags समेत।
- `fingerprint(doc)` → `string`: tree का structural सारांश (tags और उनकी nesting,
  class और id के सेट, attribute की संख्या, text और interpolation का आकार)। यह
  whitespace, quoting, attribute का क्रम, attribute के नाम और static `class` तथा
  `id` के अलावा values, tag-name की casing, text की सामग्री और code तथा control heads की सामग्री को अनदेखा करता है, इसलिए `p(class="a b")` और `p.a.b` का
  fingerprint एक ही है। ESLint plugin fingerprints की तुलना करके वे fixes अस्वीकार करता है जो template का structure बदलते हैं।
- `literalSpans(text, range)` → JavaScript expression में string और template literals की
  ranges।
- हर node के types: `PugDocument`, `PugNode`, `Tag`, `AttributeBlock`, `Attribute`,
  `AttributeValue`, `Text`, `Comment`, `Code`, `Control`, `MixinCall`, `Filter`, `PugLine`,
  `PugParseError` और अन्य (`src/ast.ts` देखें)।

`PugDocument` में `children` (tree), `errors` (`{ code, message, offset }`), `lines` (हर source line के लिए एक
entry, उसकी indentation range, kind और logical depth के साथ), `eol` और `indentUnit` होते हैं।

## असमर्थित syntax {#unsupported-syntax}
कुछ Pug रूप `unsupported-syntax` error code के साथ रिपोर्ट होते हैं, और कुछ बिना
error के parse होते हैं लेकिन Pug से अलग तरह से। वे
[असमर्थित Pug syntax](/hi/guide/unsupported-syntax) में सूचीबद्ध हैं।

## License {#license}
MIT
