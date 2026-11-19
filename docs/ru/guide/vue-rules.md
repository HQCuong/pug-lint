---
title: "Правила `vue/*` на Pug"
description: "Какие правила eslint-plugin-vue работают на шаблонах Pug, какие отключены, потому что падают, и какие заглушены только внутри шаблонов Pug."
---

# Правила `vue/*` на Pug {#vue-rules-on-pug}

Большинство правил eslint-plugin-vue работают на шаблонах Pug так же, как на HTML. Остальные измеряет
набор проверок совместимости, который запускает каждое правило на шаблонах Pug и на их HTML-эквивалентах;
полные результаты приведены в [таблице совместимости](./vue-compatibility).

## Правила, приводящие к падению: отключены везде {#crashing-rules-off-everywhere}

Правила, которые **падают** на шаблонах Pug, отключает `configs.base`. У элемента Pug нет написанного
закрывающего тега, поэтому его закрывающий тег имеет нулевую ширину, а это ломает использование этими
правилами хранилища токенов vue-eslint-parser.

Падение нельзя отфильтровать постфактум, а конфиг умеет выбирать только файлы, а не шаблоны, поэтому они
отключены для **каждого** файла `.vue`, включая HTML-шаблоны. В проекте, где смешаны HTML- и Pug-шаблоны,
эти правила перестают проверять и HTML-шаблоны. Шаблоны Pug покрывают замены из `vue-pug/*`.

## Подавленные правила: заглушены только внутри Pug {#suppressed-rules-silenced-inside-pug-only}

Правила, которые **ошибочно сообщают** на Pug или чьи **исправления сломали бы или переформатировали** Pug,
не отключаются. Процессор отбрасывает их сообщения, только когда те находятся внутри шаблона Pug, так что
они продолжают работать на HTML-шаблонах и в `<script>`. Чтобы всё же сохранить одно из них, см.
[Сохранение подавленного правила](./configuration#keeping-a-suppressed-rule).

## Списки {#the-lists}

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
