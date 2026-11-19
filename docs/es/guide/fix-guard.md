---
title: La guarda de correcciones
description: "Cómo la guarda de correcciones evita que eslint --fix rompa las plantillas Pug: cada corrección se vuelve a analizar y se compara su estructura antes de que ESLint la aplique."
---

# La guarda de correcciones

Una corrección automática que rompe una plantilla es peor que ninguna. Pug lo hace fácil: la
indentación es estructura, y mover una línea sin sus hijos cambia el árbol. Por eso cada corrección
que toca una plantilla Pug se comprueba antes de que ESLint la aplique.

## Qué se comprueba {#what-is-checked}

Para cada plantilla Pug, una corrección solo se aplica si la plantilla sigue analizándose después y
su estructura no ha cambiado:

- las etiquetas y su anidamiento;
- el conjunto de clases e id de cada etiqueta y su número de atributos (así `p(class="a b")` y
  `p.a.b` son iguales, pero perder una clase no lo es);
- la forma del texto y de las interpolaciones;
- cada fragmento de JavaScript que Pug compila (valores de atributo sin comillas y `${}`,
  `&attributes`, argumentos de mixin, código, cabeceras de control, `#{}`), salvo su indentación.

El parser informa de lo que el propio Pug rechaza (por ejemplo una mezcla de tabuladores y espacios
o un atributo repetido), así que también se descarta una corrección que lo introduciría.

## Cómo se aplican las correcciones {#how-fixes-are-applied}

1. Cada corrección se verifica por separado.
2. Las correcciones que sobreviven se verifican de nuevo como el conjunto combinado que ESLint
   aplicará.
3. Una corrección que falla se descarta, y su problema se sigue informando, para que lo corrijas a
   mano.

Esto abarca todas las reglas que corrigen archivos `.vue`, incluidas las reglas `vue/*` y las de
terceros. Mientras una plantilla tenga un error de sintaxis de Pug, no se aplica ninguna corrección
dentro de ella.

## Coste {#cost}

La guarda vuelve a analizar la plantilla por cada corrección distinta, así que su coste crece con el
número de correcciones multiplicado por el tamaño de la plantilla. Una plantilla normal tarda
milisegundos; una plantilla de 3000 líneas completamente mal formateada puede tardar varios
segundos. El coste solo aparece mientras una plantilla tiene problemas que corregir.

## Conjuntos de correcciones parciales {#partial-fix-sets}

La guarda verifica el conjunto completo de correcciones que sobreviven. Si ESLint aplica solo
algunas (`--fix-type`, o un predicado `fix` propio en la API de Node.js), ese subconjunto no se
verificó como conjunto.
