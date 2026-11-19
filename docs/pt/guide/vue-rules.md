---
title: Regras `vue/*` no Pug
description: "Quais regras do eslint-plugin-vue rodam em templates Pug, quais são desativadas porque travam e quais são silenciadas apenas dentro de templates Pug."
---

# Regras `vue/*` no Pug

A maioria das regras do eslint-plugin-vue funciona em templates Pug como no HTML. As demais são
medidas por um harness de compatibilidade que roda cada regra em templates Pug e em seus
equivalentes HTML; os resultados completos estão na [tabela de compatibilidade](./vue-compatibility).

## Regras que travam: desativadas em todo lugar {#crashing-rules-off-everywhere}

As regras que **travam** em templates Pug são desativadas por `configs.base`. Um elemento Pug não
tem tag de fechamento escrita, então sua tag de fechamento tem largura zero, o que quebra o uso que
essas regras fazem do token store do vue-eslint-parser.

Uma falha não pode ser filtrada depois, e uma config só consegue selecionar arquivos, não templates,
então elas ficam desativadas em **todo** arquivo `.vue`, templates HTML incluídos. Em um projeto que
mistura templates HTML e Pug, essas regras deixam de verificar também os templates HTML. As
substitutas `vue-pug/*` cobrem os templates Pug.

## Regras suprimidas: silenciadas só dentro do Pug {#suppressed-rules-silenced-inside-pug-only}

As regras que **reportam errado** no Pug, ou cujas **correções quebrariam ou reformatariam** o Pug,
não são desativadas. O processor descarta suas mensagens só quando elas estão localizadas dentro de
um template Pug, então elas continuam funcionando em templates HTML e em `<script>`. Para manter
uma mesmo assim, veja [Manter uma regra suprimida](./configuration#keeping-a-suppressed-rule).

## As listas {#the-lists}

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
