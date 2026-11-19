---
title: "Начало работы"
description: "Установите eslint-plugin-pug-vue и линтите шаблоны Pug в однофайловых компонентах Vue с помощью ESLint: требования, установка, flat config и первый eslint --fix."
---

# Начало работы {#getting-started}

`eslint-plugin-pug-vue` линтит и форматирует `<template lang="pug">` (и `lang="jade"`) в однофайловых
компонентах Vue:

- Ваши правила `vue/*` из eslint-plugin-vue работают на шаблонах Pug под привычными именами и с
  привычными опциями.
- [Правила `vue-pug/*`](/ru/rules/) форматируют сам Pug: отступы, оформление атрибутов, кавычки,
  запятые, сокращения. Одно необязательное правило сообщает о конструкциях Pug, выполняемых при компиляции.
- Каждое исправление, затрагивающее шаблон Pug, проверяется до того, как ESLint его применит
  ([защита исправлений](./fix-guard)), поэтому `--fix` и автоисправление при сохранении не ломают шаблоны.
- Ни Prettier, ни отдельного форматировщика: исправления приходят из ESLint.

## Требования {#requirements}

- Node.js `^20.19.0 || ^22.13.0 || >=24`
- ESLint `^9.15.0 || ^10.0.0`, только flat config (`eslint.config.js`)
- `eslint-plugin-vue` `^10.0.0` и `vue-eslint-parser` `^10.0.0`

## Установка {#install}

::: code-group

```sh [npm]
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [pnpm]
pnpm add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [yarn]
yarn add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

:::

## Настройка {#configure}

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

Ставьте `...vuePug.configs.recommended` **после** конфигов eslint-plugin-vue. Он задаёт опции парсера,
процессор и правила, которые для Pug должны быть отключены. Более поздний конфиг, который задаёт
собственный процессор или снова включает одно из [правил, приводящих к падению](./vue-rules), ломает
линтинг файлов Pug.

## Запуск {#run-it}

```sh
npx eslint .          # report problems
npx eslint . --fix    # fix what can be fixed
```

Чтобы исправлять при сохранении в VS Code, см. [Настройку редактора](./editor-setup).

## Дальше {#next-steps}

- [Конфигурация](./configuration): два конфига, `baseIndent`, сохранение подавленного правила.
- [Правила](/ru/rules/): что делает каждое правило `vue-pug/*` и какие у него опции.
- [Известные ограничения](./limitations): прочитайте до внедрения на большой кодовой базе.
- Переходите с `eslint-plugin-vue-pug`? Прочитайте [руководство по миграции](./migration).
- Используете oxlint? Запускайте его рядом с ESLint: см. [Использование с oxlint](./oxlint).
