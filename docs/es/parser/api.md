---
title: API
description: "Referencia de la API de pug-lint-parser: parsePug y sus opciones, walk, fingerprint, literalSpans y los tipos exportados."
---

# API

```js
import { parsePug, walk, fingerprint, literalSpans } from 'pug-lint-parser'
```

El paquete es solo ESM, no tiene dependencias y distribuye sus tipos de TypeScript: todos los tipos
de nodo que aparecen abajo se exportan (`import type { Tag, PugDocument } from 'pug-lint-parser'`).

**Cada posición es un desplazamiento en el `text` que pasaste**: un índice UTF-16, la misma unidad
que `String.prototype.slice`. Un `Range` es `[start, end)`, así que `text.slice(...range)` devuelve
el código fuente de un nodo, y `text.slice(0, start) + replacement + text.slice(end)` lo edita.

## `parsePug(text, options?)` {#parsepug-text-options}

```ts
function parsePug(text: string, options?: ParseOptions): PugDocument

interface ParseOptions {
  start?: number // default 0
  end?: number   // default text.length
}
```

Analiza `text[start, end)` y devuelve el [documento](./syntax-tree#pugdocument). Nunca lanza
excepciones: lo que no puede analizar se convierte en una entrada de `doc.errors`, y el análisis
continúa en la línea siguiente (consulta [Errores](./errors)).

`start` y `end` permiten analizar parte de un archivo mayor sin copiarlo, por ejemplo el contenido
de un bloque `<template lang="pug">` en un archivo `.vue`. Los rangos siguen refiriéndose a todo el
`text`:

```js
const sfc = '<template lang="pug">\ndiv\n  p Hi\n</template>\n'
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

doc.range                 // [21, 33]
doc.children[0].name      // { value: 'div', range: [22, 25] }
```

Cuando todas las líneas del fragmento tienen la misma indentación, como en una plantilla indentada
bajo `<template>`, esa indentación común es la base: el parser la trata como columna 0, igual que
hace Vue antes de compilar la plantilla. El propio Pug rechaza un archivo `.pug` indentado, así que
el parser es aquí más permisivo que el compilador de Pug.

Los finales de línea pueden ser LF o CRLF; un CR suelto también se lee como salto de línea. Un BOM
inicial no se elimina: pasa `start: 1` para omitirlo.

## `walk(doc, visit)` {#walk-doc-visit}

```ts
function walk(
  doc: PugDocument,
  visit: (node: PugNode, parent: PugNode | PugDocument) => void,
): void
```

Llama a `visit` para cada nodo en orden de documento (preorden: un nodo antes que sus hijos). Entra
en `children` y en la etiqueta de cada [interpolación de etiqueta](./syntax-tree#text) `#[…]`, cuyo
padre es el nodo `Text` que la contiene.

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

Una cadena que resume la **estructura** de una plantilla: dos plantillas con la misma huella
generan el mismo árbol de elementos. El plugin de ESLint compara huellas para rechazar las
correcciones que cambiarían una plantilla.

Qué incluye:

- las etiquetas, llamadas a mixin, texto, comentarios, código y bloques de control, y cómo se
  anidan;
- el conjunto de clases e ids estáticos de cada etiqueta, **sea cual sea su forma**:
  `p(class="a b")` y `p.a.b` tienen la misma huella, `p.a` no;
- el número de los demás atributos y el tipo de cada valor (ninguno o cadena, expresión, plantilla
  con `${}`);
- cada fragmento de JavaScript que Pug compila, por su texto salvo la indentación: valores de
  atributo de expresión y `${}`, `&attributes(…)`, argumentos de mixin, código, cabeceras de control
  y `#{…}`;
- la forma del texto: dónde se divide en líneas e interpolaciones.

Qué ignora: los espacios en blanco y el ancho de la indentación, las comillas, las comas, el orden y
los nombres de los atributos, los valores de atributo de cadena que no sean `class` e `id`, las
mayúsculas y minúsculas del nombre de la etiqueta, el contenido del texto, la `/` de una etiqueta
autocerrada y los `:` de una expansión de bloque.

```js
fingerprint(parsePug('p(class="a b") Hi')) === fingerprint(parsePug('p.a.b Hi'))  // true
fingerprint(parsePug('p.a Hi')) === fingerprint(parsePug('p.a.b Hi'))             // false
```

El formato de la cadena no forma parte de la API: compara huellas, no las analices.

## `literalSpans(text, range)` {#literalspans-text-range}

```ts
function literalSpans(text: string, range: [number, number]): [number, number][]
```

Los rangos de los literales de cadena (`'…'`, `"…"`) y de plantilla (`` `…` ``) dentro de una
expresión JavaScript en `text[range]`. Úsalo para distinguir el código del contenido de las
cadenas, por ejemplo para evitar reindentar el interior de un literal de plantilla multilínea. Un
literal sin terminar llega hasta el final de `range`.

```js
const e = 'f("a", `b ${c}`, d)'
literalSpans(e, [0, e.length])              // [[2, 5], [7, 15]]
                                            // '"a"' and '`b ${c}`'
```

## Tipos {#types}

| Tipo | Qué es |
|---|---|
| `Range` | `[start: number, end: number]`, desplazamientos en `text` |
| `PugDocument` | El resultado de `parsePug`: [árbol, líneas y errores](./syntax-tree#pugdocument) |
| `PugNode` | `Tag \| MixinCall \| Text \| Comment \| Code \| Control \| Filter` |
| `Tag`, `MixinCall`, `Text`, `Comment`, `Code`, `Control`, `Filter` | [Los nodos](./syntax-tree#nodes) |
| `AttributeBlock`, `Attribute`, `AttributeValue` | [Atributos](./syntax-tree#attributes) |
| `TextPart` | `Raw`, `Interpolation` o `TagInterpolation` dentro de un `Text` |
| `ControlKeyword` | La palabra clave de un nodo `Control` |
| `PugLine` | [Una línea de código fuente](./syntax-tree#lines) |
| `PugParseError` | [`{ code, message, offset }`](./errors) |
| `ParseOptions` | `{ start?, end? }` |
