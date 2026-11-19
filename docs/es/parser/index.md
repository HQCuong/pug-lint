---
title: pug-lint-parser
description: "pug-lint-parser: un parser de Pug para herramientas de lint y formato, con rangos de código fuente exactos y recuperación de errores. Nunca lanza excepciones y no tiene dependencias."
---

# pug-lint-parser

Un parser de árbol de sintaxis concreto (CST) para plantillas Pug, creado para herramientas de lint
y de formato. Es el parser que hay detrás de
[`eslint-plugin-pug-vue`](https://github.com/HQCuong/pug-lint/tree/main/packages/eslint-plugin).

- **Nunca lanza excepciones.** La entrada que no puede analizar se convierte en una entrada de
  `errors`, y el análisis continúa en la línea siguiente.
- **Rangos de código fuente exactos.** Cada nodo, atributo, valor, atajo, coma y línea tiene un
  rango `[start, end)`: desplazamientos UTF-16 en el texto que le pasas, para que puedas extraer
  fragmentos del código fuente o construir una edición mínima sin ajustar posiciones.
- **Analiza un fragmento en su sitio.** `parsePug(text, { start, end })` analiza solo
  `text[start, end)` (por ejemplo el contenido de un bloque `<template lang="pug">`); los rangos
  siguen refiriéndose a todo el `text`.
- **Conserva los finales de línea.** Se admiten LF y CRLF; `doc.eol` es el primer final de línea
  encontrado.
- Sin dependencias en tiempo de ejecución. Solo ESM. Node.js `^20.19.0 || ^22.13.0 || >=24`.

## Uso {#usage}

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

La referencia completa, con todos los tipos de nodo, está en el sitio: [API](https://pug-lint.dev/es/parser/api),
[árbol de sintaxis](https://pug-lint.dev/es/parser/syntax-tree), [errores](https://pug-lint.dev/es/parser/errors) y
[recetas](https://pug-lint.dev/es/parser/recipes).

- `parsePug(text, options?)` → `PugDocument`. `options.start` / `options.end` limitan el análisis a
  ese rango de `text`.
- `walk(doc, visit)`: llama a `visit(node, parent)` para cada nodo en orden de documento, incluidas
  las etiquetas dentro de las interpolaciones de etiqueta (`#[…]`).
- `fingerprint(doc)` → `string`: un resumen estructural del árbol (etiquetas y su anidamiento,
  conjuntos de clases e ids, número de atributos, la forma del texto y de la interpolación). Ignora
  los espacios en blanco, las comillas, el orden de los atributos, los nombres y valores de
  atributos que no sean las `class` e `id` estáticas, las mayúsculas y minúsculas del nombre de la
  etiqueta, el contenido del texto y el contenido del código y de las cabeceras de control, así que
  `p(class="a b")` y `p.a.b` tienen la misma huella. El plugin de ESLint compara huellas para
  rechazar las correcciones que cambian la estructura de una plantilla.
- `literalSpans(text, range)` → los rangos de los literales de cadena y de plantilla en una
  expresión JavaScript.
- Tipos para cada nodo: `PugDocument`, `PugNode`, `Tag`, `AttributeBlock`, `Attribute`,
  `AttributeValue`, `Text`, `Comment`, `Code`, `Control`, `MixinCall`, `Filter`, `PugLine`,
  `PugParseError` y más (consulta `src/ast.ts`).

Un `PugDocument` tiene `children` (el árbol), `errors` (`{ code, message, offset }`), `lines` (una
entrada por línea de código fuente con su rango de indentación, tipo y profundidad lógica), `eol` e
`indentUnit`.

## Sintaxis no admitida {#unsupported-syntax}

Algunas formas de Pug se informan con el código de error `unsupported-syntax`, y unas pocas se
analizan sin error pero de forma distinta a Pug. Están listadas en
[docs/unsupported-syntax.md](https://github.com/HQCuong/pug-lint/blob/main/packages/pug-parser/docs/unsupported-syntax.md).

## Licencia {#license}

MIT
