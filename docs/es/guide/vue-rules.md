---
title: Reglas `vue/*` sobre Pug
description: "Qué reglas de eslint-plugin-vue se ejecutan sobre plantillas Pug, cuáles se desactivan porque fallan y cuáles se silencian solo dentro de las plantillas Pug."
---

# Reglas `vue/*` sobre Pug

La mayoría de las reglas de eslint-plugin-vue funcionan sobre plantillas Pug igual que sobre HTML.
El resto se miden con un arnés de compatibilidad que ejecuta cada regla sobre plantillas Pug y sobre
sus equivalentes HTML; los resultados completos están en la [tabla de compatibilidad](./vue-compatibility).

## Reglas que fallan: desactivadas en todas partes {#crashing-rules-off-everywhere}

Las reglas que **fallan** con las plantillas Pug se desactivan con `configs.base`. Un elemento Pug no
tiene etiqueta de cierre escrita, así que su etiqueta de cierre tiene ancho cero, lo que rompe el
uso que estas reglas hacen del almacén de tokens de vue-eslint-parser.

Un fallo no se puede filtrar después, y una configuración solo puede seleccionar archivos, no
plantillas, así que están desactivadas para **todos** los archivos `.vue`, incluidas las plantillas
HTML. En un proyecto que mezcla plantillas HTML y Pug, estas reglas dejan de comprobar también las
plantillas HTML. Los reemplazos `vue-pug/*` cubren las plantillas Pug.

## Reglas suprimidas: silenciadas solo dentro de Pug {#suppressed-rules-silenced-inside-pug-only}

Las reglas que **informan mal** sobre Pug, o cuyas **correcciones romperían o reformatearían** el
Pug, no se desactivan. El procesador descarta sus mensajes solo cuando están situados dentro de una
plantilla Pug, así que siguen funcionando en las plantillas HTML y en `<script>`. Para mantener una
de todos modos, consulta [Mantener una regla suprimida](./configuration#keeping-a-suppressed-rule).

## Las listas {#the-lists}

<!-- begin auto-generated vue rule lists -->

Turned off for every `.vue` file by `configs.base`, because they crash on Pug templates:

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

Suppressed inside Pug templates only (they keep working on HTML templates and in `<script>`):

- `vue/array-bracket-newline`
- `vue/array-element-newline`
- `vue/brace-style`
- `vue/first-attribute-linebreak` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-comment-content-newline`
- `vue/html-comment-content-spacing`
- `vue/html-end-tags` (Pug replacement: `vue-pug/self-closing`)
- `vue/html-quotes` (Pug replacement: `vue-pug/attribute-quotes`)
- `vue/html-self-closing` (Pug replacement: `vue-pug/self-closing`)
- `vue/max-attributes-per-line` (Pug replacement: `vue-pug/max-attributes-per-line`)
- `vue/multiline-html-element-content-newline`
- `vue/multiline-ternary`
- `vue/no-multi-spaces` (Pug replacement: `vue-pug/no-multi-spaces`)
- `vue/no-spaces-around-equal-signs-in-attribute` (Pug replacement: `vue-pug/attribute-equals-spacing`)
- `vue/no-unsupported-features`
- `vue/object-curly-newline`
- `vue/object-property-newline`
- `vue/padding-line-between-tags`
- `vue/singleline-html-element-content-newline`
- `vue/static-class-names-order`
- `vue/v-if-else-key`

<!-- end auto-generated vue rule lists -->
