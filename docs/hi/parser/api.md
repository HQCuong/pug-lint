---
description: "pug-lint-parser का API संदर्भ: parsePug और उसके options, walk, fingerprint, literalSpans और exported types।"
---

# API

```js
import { parsePug, walk, fingerprint, literalSpans } from 'pug-lint-parser'
```

Package केवल ESM है, उसकी कोई dependencies नहीं हैं, और वह अपने TypeScript types साथ भेजता है: नीचे का हर node type
exported है (`import type { Tag, PugDocument } from 'pug-lint-parser'`)।

**हर position आपके दिए `text` में एक offset है**: UTF-16 index, वही इकाई जो
`String.prototype.slice` की है। `Range` `[start, end)` है, इसलिए `text.slice(...range)` node का
source लौटाता है, और `text.slice(0, start) + replacement + text.slice(end)` उसे edit करता है।

## `parsePug(text, options?)` {#parsepug-text-options}

```ts
function parsePug(text: string, options?: ParseOptions): PugDocument

interface ParseOptions {
  start?: number // default 0
  end?: number   // default text.length
}
```

`text[start, end)` को parse करता है और [document](./syntax-tree#pugdocument) लौटाता है। यह कभी throw नहीं करता:
जो वह parse नहीं कर सकता वह `doc.errors` में एक entry बन जाता है, और parsing अगली line से जारी रहती है ([Errors](./errors)
देखें)।

`start` और `end` से आप किसी बड़ी फ़ाइल का एक हिस्सा बिना copy किए parse कर सकते हैं, जैसे `.vue` फ़ाइल में
`<template lang="pug">` block की सामग्री। Ranges फिर भी पूरे `text` की ओर इशारा करती हैं:

```js
const sfc = '<template lang="pug">\ndiv\n  p Hi\n</template>\n'
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

doc.range                 // [21, 33]
doc.children[0].name      // { value: 'div', range: [22, 25] }
```

जब slice की हर line समान मात्रा में indent हो, जैसे `<template>` के नीचे indent किए गए template में, तो वह साझा indentation
आधार मानी जाती है: parser उसे column 0 मानता है, जैसे Vue template को compile करने से पहले करता है। Pug खुद indent की गई `.pug` फ़ाइल को
अस्वीकार करता है, इसलिए यहाँ parser Pug compiler से अधिक उदार है।

Line endings LF या CRLF हो सकती हैं; अकेला CR भी line break माना जाता है। शुरुआती BOM हटाया नहीं जाता:
उसे छोड़ने के लिए `start: 1` दें।

## `walk(doc, visit)` {#walk-doc-visit}

```ts
function walk(
  doc: PugDocument,
  visit: (node: PugNode, parent: PugNode | PugDocument) => void,
): void
```

Document order में हर node के लिए `visit` बुलाता है (pre-order: node अपने children से पहले)। यह
`children` में जाता है और हर `#[…]` [tag interpolation](./syntax-tree#text) के tag में भी, जिसका
parent आसपास का `Text` node होता है।

```js
walk(parsePug('if ok\n  p a\nelse\n  +card(1)\n- const x = 1\n//- note\n'), (node, parent) => {
  console.log(node.type, '<', parent.type)
})
// Control < Document     (if)
// Tag < Control
// Text < Tag
// Control < Document     (else)
// MixinCall < Control
// Code < Document
// Comment < Document
```

## `fingerprint(doc)` {#fingerprint-doc}

```ts
function fingerprint(doc: PugDocument): string
```

एक string जो template के **structure** का सारांश देती है: एक ही fingerprint वाले दो templates
एक ही element tree render करते हैं। ESLint plugin fingerprints की तुलना करके वे fixes अस्वीकार करता है जो
template बदल देते।

इसमें क्या शामिल है:

- tags, mixin calls, text, comments, code और control blocks, और वे कैसे nest होते हैं;
- हर tag के static classes और ids का सेट, **चाहे वे किसी भी रूप में हों**: `p(class="a b")` और `p.a.b`
  का fingerprint एक है, `p.a` का नहीं;
- अन्य attributes की संख्या, और हर value की किस्म (कोई नहीं या string, expression, `${}` वाला
  template);
- JavaScript का हर हिस्सा जिसे Pug compile करता है, indentation को छोड़कर उसके text से: expression और `${}`
  attribute values, `&attributes(…)`, mixin arguments, code, control heads और `#{…}`;
- text का आकार: वह कहाँ lines और interpolations में बँटा है।

क्या अनदेखा होता है: whitespace और indentation की चौड़ाई, quotes, commas, attributes का क्रम और नाम,
`class` और `id` के अलावा string attribute values, tag-name की casing, text की सामग्री, self-closing
tag का `/` और block expansion का `:`।

```js
fingerprint(parsePug('p(class="a b") Hi')) === fingerprint(parsePug('p.a.b Hi'))  // true
fingerprint(parsePug('p.a Hi')) === fingerprint(parsePug('p.a.b Hi'))             // false
```

String का format API का हिस्सा नहीं है: fingerprints की तुलना करें, उन्हें parse न करें।

## `literalSpans(text, range)` {#literalspans-text-range}

```ts
function literalSpans(text: string, range: [number, number]): [number, number][]
```

`text[range]` पर किसी JavaScript expression के अंदर string literals (`'…'`, `"…"`) और template literals
(`` `…` ``) की ranges। इसका उपयोग code को string की सामग्री से अलग पहचानने के लिए करें, जैसे multi-line template literal
के अंदर को दोबारा indent करने से बचने के लिए। जो literal बंद नहीं हुआ वह `range` के अंत तक जाता है।

```js
const e = 'f("a", `b ${c}`, d)'
literalSpans(e, [0, e.length])              // [[2, 5], [7, 15]]
                                            // '"a"' and '`b ${c}`'
```

## Types {#types}

| Type | यह क्या है |
|---|---|
| `Range` | `[start: number, end: number]`, `text` में offsets |
| `PugDocument` | `parsePug` का परिणाम: [tree, lines और errors](./syntax-tree#pugdocument) |
| `PugNode` | `Tag \| MixinCall \| Text \| Comment \| Code \| Control \| Filter` |
| `Tag`, `MixinCall`, `Text`, `Comment`, `Code`, `Control`, `Filter` | [Nodes](./syntax-tree#nodes) |
| `AttributeBlock`, `Attribute`, `AttributeValue` | [Attributes](./syntax-tree#attributes) |
| `TextPart` | `Text` के अंदर `Raw`, `Interpolation` या `TagInterpolation` |
| `ControlKeyword` | `Control` node का keyword |
| `PugLine` | [एक source line](./syntax-tree#lines) |
| `PugParseError` | [`{ code, message, offset }`](./errors) |
| `ParseOptions` | `{ start?, end? }` |
