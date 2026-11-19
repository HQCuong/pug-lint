---
title: Recetas
description: "Pequeños programas construidos sobre pug-lint-parser: listar clases, un codemod seguro comprobado con fingerprint, comprobar la plantilla de un archivo .vue y encontrar nodos."
---

# Recetas

Pequeños programas construidos sobre `pug-lint-parser`. Cada uno se ejecuta tal cual tras
`npm install pug-lint-parser` en un módulo ES (`.mjs`, o `"type": "module"` en `package.json`).

## Listar las clases que usa una plantilla {#list-the-classes-a-template-uses}

Las clases vienen de los atajos `.class` y de los valores estáticos `class="…"`. `:class` es un
enlace de Vue y `class=expr` es JavaScript de Pug, así que ninguno es una lista de nombres.

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

## Reescribir las comillas de forma segura {#rewrite-quotes-safely}

Un codemod edita el código fuente por rangos, de la última edición a la primera, para que los
rangos anteriores sigan siendo válidos. Después comprueba su propia salida como lo hace el plugin de
ESLint: el resultado debe analizarse y tener la misma [huella (fingerprint)](./api#fingerprint-doc).

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

## Comprobar la plantilla de un archivo `.vue` {#check-the-template-of-a-vue-file}

Analiza solo el contenido de la plantilla con `start` y `end`; los desplazamientos siguen apuntando
a todo el archivo, así que se convierten directamente en posiciones del editor.

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

## Encontrar nodos de un tipo {#find-nodes-of-one-kind}

`walk` visita todos los nodos, con su padre. Para encontrar las construcciones exclusivas de Pug que
una plantilla de Vue no debería usar, como hace la regla `vue-pug/no-pug-control-flow`:

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
