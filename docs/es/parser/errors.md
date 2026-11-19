---
title: Errores
description: "Códigos de error de pug-lint-parser con ejemplos, cómo se recupera el parser tras un error y cómo convertir un desplazamiento en línea y columna."
---

# Errores

`parsePug` nunca lanza excepciones. Lo que no puede analizar se convierte en una entrada de
`doc.errors`, y el resto de la plantilla se sigue analizando:

```ts
interface PugParseError {
  code: string     // one of the codes below
  message: string  // for people; may change between versions
  offset: number   // where the problem is, as an offset into text
}
```

Compara por `code`, no por `message`. Para mostrar una línea y una columna, cuenta desde el
desplazamiento:

```js
const before = text.slice(0, error.offset)
const line = before.split('\n').length                    // 1-based
const column = error.offset - before.lastIndexOf('\n')    // 1-based
```

## Recuperación {#recovery}

Un error no detiene el análisis. El parser salta hasta el final de la construcción incorrecta, o
hasta el final de la línea, y continúa con la línea siguiente. Las líneas que no pueden colocarse
tras un error, como las líneas anidadas bajo una construcción que no puede tener hijos, se conservan
en `doc.lines` con el tipo `continuation`, y no se construye ningún nodo para ellas.

```js
parsePug('div\n  p(class="a)\n  span ok\n  li(a=1 a=2)\n').errors
// [
//   { code: 'unterminated-string', message: 'Unterminated string', offset: 14 },
//   { code: 'duplicate-attribute', message: 'Duplicate attribute "a"', offset: 37 },
// ]
```

El plugin de ESLint no aplica ninguna corrección dentro de una plantilla que tiene errores, ya que
no puede comprobarlas.

## Códigos {#codes}

| `code` | Ejemplo | Mensaje |
|---|---|---|
| `unterminated-string` | `p(title="hi) x` | Unterminated string |
| `unclosed-attributes` | `p(title="hi"` | Attribute block is not closed with ")" |
| `unclosed-arguments` | `+card(1, 2` | Mixin arguments are not closed with ")" |
| `missing-attribute-value` | `p(title=) x` | Expected a value after the operator |
| `duplicate-attribute` | `p(a="1" a="2")` | Duplicate attribute "a" |
| `unexpected-character` | `p(a!b) x` | Expected "=" after "!" |
| `unbalanced-key` | `p([a="1") x` | Unclosed "[" in an attribute key |
| `bad-escape` | `p(a="\x")` | Invalid escape sequence in a JavaScript string |
| `inconsistent-indentation` | una línea indentada con tabuladores entre otras indentadas con espacios | Invalid indentation, you can use tabs or spaces but not both |
| `unterminated-interpolation` | `p Hi #{name` | Interpolation is not closed with "}" |
| `unsupported-syntax` | `#{tag} x` | Unsupported syntax: "#{tag} x" |

Cada código abarca una familia de problemas; `unexpected-character`, `unbalanced-key`,
`inconsistent-indentation` y `unsupported-syntax` tienen varios mensajes.

Coinciden con lo que rechaza el compilador de Pug, con una diferencia deliberada: un salto de línea
dentro de un valor de atributo `'…'` o `"…"` es `unterminated-string`, como en JavaScript. Usa
acentos graves para los valores multilínea.

## `unsupported-syntax` {#unsupported-syntax}

Este código marca Pug válido que el parser no gestiona, como los nombres de etiqueta interpolados
(`#{tag}`) o los bloques de texto sin etiqueta. Algunas formas también se analizan sin error pero de
forma distinta a Pug. Ambas listas están en [Sintaxis de Pug no admitida](/es/guide/unsupported-syntax).
