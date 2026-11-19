---
title: vue/*-Regeln auf Pug
description: "Welche eslint-plugin-vue-Regeln auf Pug-Templates laufen, welche wegen Abstürzen abgeschaltet sind und welche nur innerhalb von Pug-Templates stummgeschaltet werden."
---

# `vue/*`-Regeln auf Pug

Die meisten Regeln von eslint-plugin-vue funktionieren auf Pug-Templates wie auf HTML. Der Rest
wird von einem Kompatibilitäts-Harness vermessen, der jede Regel auf Pug-Templates und ihren
HTML-Entsprechungen ausführt; die vollständigen Ergebnisse stehen in der
[Kompatibilitätstabelle](./vue-compatibility).

## Abstürzende Regeln: überall aus {#crashing-rules-off-everywhere}

Regeln, die auf Pug-Templates **abstürzen**, werden von `configs.base` abgeschaltet. Ein Pug-Element
hat kein geschriebenes End-Tag, sein End-Tag hat also die Breite null, was die Nutzung des
Token-Stores von vue-eslint-parser durch diese Regeln bricht.

Einen Absturz kann man nachträglich nicht herausfiltern, und eine Config kann nur Dateien
auswählen, keine Templates; deshalb sind sie für **jede** `.vue`-Datei aus, auch für HTML-Templates.
In einem Projekt, das HTML- und Pug-Templates mischt, prüfen diese Regeln also auch die
HTML-Templates nicht mehr. Die `vue-pug/*`-Ersatzregeln decken die Pug-Templates ab.

## Unterdrückte Regeln: nur in Pug stummgeschaltet {#suppressed-rules-silenced-inside-pug-only}

Regeln, die auf Pug **falsch melden** oder deren **Fixes Pug kaputt machen oder umformatieren**,
werden nicht abgeschaltet. Der Prozessor verwirft ihre Meldungen nur dann, wenn sie in einem
Pug-Template liegen, sodass sie auf HTML-Templates und in `<script>` weiter arbeiten. Wie Sie eine
trotzdem behalten, steht unter [Eine unterdrückte Regel behalten](./configuration#keeping-a-suppressed-rule).

## Die Listen {#the-lists}

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
