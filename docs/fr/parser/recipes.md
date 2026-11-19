---
title: "Recettes"
description: "De petits programmes construits sur pug-lint-parser : lister les classes, un codemod sûr vérifié avec fingerprint, vérifier le template d'un fichier .vue, trouver des nœuds."
---

# Recettes

De petits programmes construits sur `pug-lint-parser`. Chacun s'exécute tel quel après
`npm install pug-lint-parser`, dans un module ES (`.mjs`, ou `"type": "module"` dans `package.json`).

## Lister les classes qu'utilise un template {#list-the-classes-a-template-uses}

Les classes viennent des raccourcis `.class` et des valeurs statiques `class="…"`. `:class` est une
liaison Vue et `class=expr` est du JavaScript Pug : ni l'un ni l'autre n'est une liste de noms.

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

## Réécrire les guillemets en toute sécurité {#rewrite-quotes-safely}

Un codemod modifie la source par plage, de la dernière modification à la première pour que les
plages précédentes restent valides. Puis il vérifie sa propre sortie comme le fait le plugin ESLint :
le résultat doit s'analyser et avoir la même [empreinte](./api#fingerprint-doc).

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

## Vérifier le template d'un fichier `.vue` {#check-the-template-of-a-vue-file}

N'analysez que le contenu du template avec `start` et `end` ; les offsets pointent toujours dans le
fichier entier, ils se convertissent donc directement en positions d'éditeur.

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

## Trouver les nœuds d'un même genre {#find-nodes-of-one-kind}

`walk` visite chaque nœud, avec son parent. Pour trouver les constructions propres à Pug qu'un
template Vue ne devrait pas utiliser, comme le fait la règle `vue-pug/no-pug-control-flow` :

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
