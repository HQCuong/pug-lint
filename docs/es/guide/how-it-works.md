---
title: Cómo funciona
description: "Cómo eslint-plugin-pug-vue analiza Pug en Vue: un tokenizador de Pug para vue-eslint-parser, reglas vue/* y vue-pug/*, y una guarda que comprueba cada corrección."
---

# Cómo funciona

ESLint no sabe leer Pug por sí solo, y eslint-plugin-vue solo conoce las plantillas HTML. El plugin
conecta ambos y después comprueba cada corrección antes de que ESLint la escriba.

<HowItWorks />

## 1. Análisis {#_1-parse}

[vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser) analiza los archivos `.vue` para
eslint-plugin-vue. Para una plantilla en otro lenguaje, pide a un *tokenizador* que convierta ese
lenguaje en los tokens que obtendría de HTML. El plugin registra uno para `lang="pug"` y
`lang="jade"`.

El tokenizador analiza la plantilla con [`pug-lint-parser`](/es/parser/) y después emite un token
de etiqueta de apertura, uno de cierre, texto y tokens `{{ }}` por cada elemento Pug, en las
posiciones exactas del código fuente Pug. vue-eslint-parser construye con ellos su AST de plantilla
habitual, de modo que las reglas `vue/*` señalan la línea y la columna correctas de tu Pug.

Un error de sintaxis de Pug se convierte en un error de análisis que informa `vue/no-parsing-error`.

## 2. Lint {#_2-lint}

Dos tipos de reglas se ejecutan sobre el mismo archivo:

- **Las reglas `vue/*`** de eslint-plugin-vue leen el AST de plantilla de Vue, como lo harían sobre
  una plantilla HTML: claves que faltan, variables sin usar, orden de atributos, sintaxis obsoleta.
- **Las reglas `vue-pug/*`** leen directamente el árbol de sintaxis de Pug de `pug-lint-parser`. Ese
  árbol conserva lo que el AST de Vue pierde: indentación, comas, comillas, paréntesis y los atajos
  `.class` e `#id`. Aquí es donde trabajan las reglas de formato.

## 3. Comprobación {#_3-check}

El plugin envuelve el procesador de eslint-plugin-vue, que ve cada mensaje antes de que ESLint lo
use:

- **Suprimir.** Unas pocas reglas `vue/*` no pueden funcionar sobre Pug: informan de problemas
  falsos, o sus correcciones escribirían HTML en una plantilla Pug. Sus mensajes se descartan cuando
  están dentro de una plantilla Pug, y solo ahí, así que siguen comprobando tus plantillas HTML. Las
  pocas reglas que fallan con Pug se desactivan en su lugar. [Las listas](./vue-rules).
- **Guarda de correcciones.** Cada corrección que toca una plantilla Pug se aplica a una copia del
  archivo, que `pug-lint-parser` vuelve a analizar. El plugin compara la estructura antes y después:
  las etiquetas y su anidamiento, clases e ids, número de atributos, la forma del texto y cada
  expresión JavaScript. Si algo cambió, o la copia ya no se analiza, la corrección se descarta y su
  advertencia permanece. [Detalles](./fix-guard).

Después ESLint aplica las correcciones que quedan, con `eslint --fix` o con la corrección al guardar
de tu editor.

## Los dos paquetes {#the-two-packages}

| Paquete | Función |
|---|---|
| [`eslint-plugin-pug-vue`](https://www.npmjs.com/package/eslint-plugin-pug-vue) | El plugin de ESLint: el tokenizador, las reglas `vue-pug/*`, el procesador y las configuraciones. El que instalas. |
| [`pug-lint-parser`](/es/parser/) | El parser de Pug sobre el que se construye todo lo anterior. No sabe nada de ESLint ni de Vue, y puedes usarlo por separado. |
