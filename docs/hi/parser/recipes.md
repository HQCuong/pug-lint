---
description: "pug-lint-parser पर बने छोटे programs: classes की सूची, fingerprint से जाँचा गया सुरक्षित codemod, .vue फ़ाइल के template की जाँच, nodes खोजना।"
---

# Recipes

`pug-lint-parser` पर बने छोटे programs। हर एक ES module में (`.mjs`, या `package.json` में `"type": "module"`)
`npm install pug-lint-parser` के बाद जैसा है वैसा चलता है।

## Template में उपयोग हुई classes की सूची {#list-the-classes-a-template-uses}

Classes `.class` shorthands से और static `class="…"` values से आती हैं। `:class` एक Vue
binding है और `class=expr` Pug JavaScript है, इसलिए दोनों में से कोई नामों की सूची नहीं है।

```js
import { parsePug, walk } from 'pug-lint-parser'

const text = `nav.menu(class="dark wide")
  a.item#home(href="/") Home
  a(class="item", :class="{ active }") Docs
`
const doc = parsePug(text)
const classes = new Set()

walk(doc, (node) => {
  if (node.type !== 'Tag') return
  for (const s of node.shorthands) {
    if (s.kind === 'class') classes.add(s.value)
  }
  for (const block of node.attributeBlocks) {
    for (const attr of block.attributes) {
      // Only static strings: `:class` is a Vue binding, `class=expr` is Pug JavaScript.
      if (attr.key.raw !== 'class' || attr.value?.kind !== 'string') continue
      for (const name of text.slice(...attr.value.inner).split(/\s+/)) {
        if (name) classes.add(name)
      }
    }
  }
})

console.log([...classes]) // [ 'menu', 'dark', 'wide', 'item' ]
```

## Quotes को सुरक्षित रूप से बदलना {#rewrite-quotes-safely}

Codemod source को range से edit करता है, आखिरी edit से पहले तक, ताकि पहले की ranges
वैध रहें। फिर वह अपने output को वैसे ही जाँचता है जैसे ESLint plugin करता है: परिणाम parse होना चाहिए और उसका
[fingerprint](./api#fingerprint-doc) वही होना चाहिए।

```js
import { fingerprint, parsePug, walk } from 'pug-lint-parser'

/** Rewrite '…' attribute values as "…", unless the value contains a double quote. */
function doubleQuotes(text) {
  const doc = parsePug(text)
  if (doc.errors.length > 0) return text // never edit a template that does not parse

  const edits = []
  walk(doc, (node) => {
    if (node.type !== 'Tag' && node.type !== 'MixinCall') return
    for (const block of node.attributeBlocks) {
      for (const { value } of block.attributes) {
        if (value?.kind !== 'string' || value.quote !== "'") continue
        const inner = text.slice(...value.inner)
        if (inner.includes('"')) continue
        edits.push({ range: value.range, text: `"${inner}"` })
      }
    }
  })

  // Apply from the end, so the earlier ranges stay valid.
  let out = text
  for (const { range, text: replacement } of edits.sort((a, b) => b.range[0] - a.range[0])) {
    out = out.slice(0, range[0]) + replacement + out.slice(range[1])
  }

  // The same check the ESLint plugin makes: the structure must not change.
  const after = parsePug(out)
  if (after.errors.length > 0 || fingerprint(after) !== fingerprint(doc)) return text
  return out
}

console.log(doubleQuotes(`a(href='/docs' title='Say "hi"') Docs\n`))
// a(href="/docs" title='Say "hi"') Docs
```

## `.vue` फ़ाइल के template की जाँच {#check-the-template-of-a-vue-file}

`start` और `end` से केवल template की सामग्री parse करें; offsets फिर भी पूरी फ़ाइल की ओर इशारा करते हैं,
इसलिए वे सीधे editor positions में बदल जाते हैं।

```js
import { parsePug } from 'pug-lint-parser'

const sfc = `<template lang="pug">
div
  p(class="oops) Hi
</template>
`
// Parse only the template's content; ranges and offsets still refer to the whole file.
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

for (const error of doc.errors) {
  const before = sfc.slice(0, error.offset)
  const line = before.split('\n').length
  const column = error.offset - before.lastIndexOf('\n')
  console.log(`${line}:${column} ${error.code}: ${error.message}`)
}
// 3:11 unterminated-string: Unterminated string
```

## एक किस्म के nodes खोजना {#find-nodes-of-one-kind}

`walk` हर node पर, उसके parent के साथ, जाता है। वे Pug-only constructs खोजने के लिए जिन्हें Vue template में
उपयोग नहीं करना चाहिए, जैसा `vue-pug/no-pug-control-flow` rule करता है:

```js
import { parsePug, walk } from 'pug-lint-parser'

const text = 'ul\n  each item in items\n    li= item\n'
walk(parsePug(text), (node) => {
  if (node.type === 'Control' || node.type === 'Code') {
    console.log(node.type, text.slice(...node.range))
  }
})
// Control each item in items
// Code = item
```
