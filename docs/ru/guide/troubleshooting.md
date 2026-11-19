---
title: "Устранение неполадок"
description: "Решение типичных проблем с eslint-plugin-pug-vue: правила vue/*, приводящие к падению, неприменяемые исправления, отсутствие сообщений в шаблонах Pug."
---

# Устранение неполадок {#troubleshooting}

## `TypeError: Cannot read properties of null (reading 'type')` (или `'range'`) {#typeerror-cannot-read-properties-of-null-reading-type-or-range}

Одно из правил `vue/*`, падающих на шаблонах Pug, снова включил конфиг, стоящий после
`...vuePug.configs.recommended` (или `base`), например общий конфиг или запись в `rules`, которая его
включает. `configs.base` отключает эти правила для каждого файла `.vue`:

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

Поставьте `...vuePug.configs.recommended` после каждого конфига, который их включает, или уберите их из
собственных `rules`. Для шаблонов Pug используйте вместо них замену из `vue-pug/*`.

## Проблема сообщается, но `--fix` её не исправляет {#a-problem-is-reported-but-fix-does-not-fix-it}

[Защита исправлений](./fix-guard) отбросила исправление, потому что его применение изменило бы структуру
шаблона или сделало бы его неразбираемым. Исправьте эту строку вручную. Если вы считаете, что исправление
было безопасным, [создайте issue](https://github.com/HQCuong/pug-lint/issues/new/choose) с этим шаблоном.

Проверьте также, нет ли в шаблоне проблемы `vue/no-parsing-error`: пока в шаблоне есть синтаксическая
ошибка Pug, внутри него исправления не применяются.

## В шаблонах Pug ничего не сообщается {#nothing-is-reported-in-pug-templates}

- Блок должен быть `<template lang="pug">` или `<template lang="jade">`.
- `...vuePug.configs.recommended` (или `base`) должен стоять после конфигов eslint-plugin-vue, и ни один
  более поздний конфиг не должен задавать собственный `processor` для `**/*.vue`.
- В VS Code `vue` должен быть в `eslint.validate` (см. [Настройку редактора](./editor-setup)).

## Редактор и CLI расходятся {#the-editor-and-the-cli-disagree}

Расширение ESLint может использовать другой ESLint или другой конфиг, чем ваш терминал. Запустите
`npx eslint --print-config src/App.vue` и сравните с выводом панели расширения (канал *ESLint*).
