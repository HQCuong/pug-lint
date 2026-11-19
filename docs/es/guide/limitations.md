---
title: Limitaciones conocidas
description: "Limitaciones conocidas de eslint-plugin-pug-vue: valores de atributo multilínea, atajos, diferencias del AST con las plantillas HTML y el coste de la guarda de correcciones."
---

# Limitaciones conocidas

- **Los valores de atributo multilínea necesitan acentos graves.** Un salto de línea dentro de un
  valor `'…'` o `"…"` es un error de sintaxis de Pug (el propio Pug no lo compila), que se informa
  mediante `vue/no-parsing-error`. Mientras una plantilla tenga un error de análisis, no se aplica
  ninguna corrección dentro de ella.
- **Los atajos no son atributos para las reglas `vue/*`.** Los atajos `.class` e `#id` no se
  exponen como atributos, así que reglas como `vue/no-restricted-class` no ven las clases escritas
  con atajo.
- **El AST de Vue difiere del de una plantilla HTML** en algunos puntos que las reglas `vue/*`
  pueden notar: cada línea de texto con tubería (`| text`) es su propio nodo de texto; el texto
  directamente en la raíz de la plantilla no tiene nodo de texto; los valores de atributo de cadena
  se pasan sin procesar, así que las comillas escapadas dentro de una cadena de directiva
  (`:x="f(\"a\")"`) pueden provocar un falso error de análisis de Vue.
- **Los valores de atributo sin comillas y `${}`** (`a(href=url)`, ``a(title=`${x}`)``) son
  expresiones de Pug en tiempo de compilación, no enlaces de Vue. Se pasan a las reglas `vue/*`
  como valores de atributo normales, y la guarda de correcciones descarta toda corrección que los
  reescriba.
- **Un valor que empieza con comillas debe ser una sola cadena.** `a(title="x" + y)` es Pug válido
  pero se informa como error de análisis (`vue/no-parsing-error`), por diseño: escribe
  `a(title=("x" + y))` o `a(:title="'x' + y")`.
- **Saltos de línea CR sueltos.** En una plantilla cuyas líneas terminan en un `\r` suelto (estilo
  Mac antiguo), las reglas `vue-pug/*` informan de problemas pero no los corrigen, y el tokenizador
  informa de un error de análisis. Convierte el archivo a LF o CRLF.
- **El parser informa de que parte de la sintaxis de Pug no está admitida**, o la analiza de forma
  distinta a Pug: consulta [Sintaxis de Pug no admitida](./unsupported-syntax).
- **Coste de la guarda de correcciones y conjuntos de correcciones parciales:** consulta
  [La guarda de correcciones](./fix-guard#cost).
