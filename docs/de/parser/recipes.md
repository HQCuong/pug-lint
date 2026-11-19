---
title: Rezepte
description: "Kleine Programme auf Basis von pug-lint-parser: Klassen auflisten, ein sicherer Codemod mit fingerprint-Prüfung, das Template einer .vue-Datei prüfen, Knoten finden."
---

# Rezepte

Kleine Programme auf Basis von `pug-lint-parser`. Jedes läuft unverändert nach
`npm install pug-lint-parser` in einem ES-Modul (`.mjs` oder `"type": "module"` in `package.json`).

## Die vom Template verwendeten Klassen auflisten {#list-the-classes-a-template-uses}

Klassen stammen aus den `.class`-Kurzschreibweisen und aus statischen `class="…"`-Werten. `:class`
ist ein Vue-Binding und `class=expr` ist Pug-JavaScript, beides ist also keine Liste von Namen.

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

## Anführungszeichen sicher umschreiben {#rewrite-quotes-safely}

Ein Codemod bearbeitet den Quelltext über Bereiche, von der letzten Änderung zur ersten, damit die
früheren Bereiche gültig bleiben. Danach prüft er seine eigene Ausgabe so, wie es das ESLint-Plugin
tut: Das Ergebnis muss sich parsen lassen und denselben [Fingerprint](./api#fingerprint-doc) haben.

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

## Das Template einer `.vue`-Datei prüfen {#check-the-template-of-a-vue-file}

Parsen Sie mit `start` und `end` nur den Inhalt des Templates; die Offsets zeigen weiterhin in die
ganze Datei und lassen sich daher direkt in Editor-Positionen umrechnen.

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

## Knoten einer Art finden {#find-nodes-of-one-kind}

`walk` besucht jeden Knoten samt seinem Elternknoten. So finden Sie die Konstrukte, die nur Pug
kennt und die ein Vue-Template nicht verwenden sollte, wie es die Regel `vue-pug/no-pug-control-flow`
tut:

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
