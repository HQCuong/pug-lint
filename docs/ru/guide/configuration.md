---
title: "Конфигурация"
description: "Настройка eslint-plugin-pug-vue: конфиги base и recommended, шаблоны с отступом под <template>, сохранение подавленного правила vue/* и ключ плагина."
---

# Конфигурация {#configuration}

## Два конфига {#the-two-configs}

Оба конфига применяются к `**/*.vue`.

| Конфиг | Что задаёт |
|---|---|
| `configs.base` | Токенизатор шаблонов Pug для vue-eslint-parser, процессор (подавление сообщений и [защита исправлений](./fix-guard)) и отключённые [правила `vue/*`, приводящие к падению](./vue-rules). Ни одно правило `vue-pug/*` не включено. |
| `configs.recommended` | `base` плюс все рекомендуемые правила `vue-pug/*` на уровне `warn`. |

Используйте `base`, если хотите сами выбрать правила `vue-pug/*`:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.base,
  {
    files: ['**/*.vue'],
    rules: {
      'vue-pug/indent': 'error',
      'vue-pug/attribute-quotes': ['error', 'single'],
    },
  },
]
```

Ваши собственные `languageOptions.parserOptions` (например, `parser` для TypeScript в `<script>`)
объединяются с опциями плагина, поэтому продолжают работать.

## Шаблоны с отступом под `<template>` {#templates-indented-under-template}

`vue-pug/indent` ставит узлы верхнего уровня в колонку 0 (`baseIndent: 0`, как в файлах `.pug`). Если
ваши шаблоны написаны на один уровень глубже `<template>`, задайте `baseIndent: 1`, иначе правило
сдвинет их в колонку 0:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  { files: ['**/*.vue'], rules: { 'vue-pug/indent': ['warn', 2, { baseIndent: 1 }] } },
]
```

Все опции см. в [`vue-pug/indent`](/ru/rules/indent).

## Сохранение подавленного правила {#keeping-a-suppressed-rule}

Некоторые правила `vue/*` [подавляются внутри шаблонов Pug](./vue-rules). Чтобы одно из них продолжало
сообщать о проблемах и там, соберите конфиги через `configure()` и используйте их вместо `vuePug.configs`:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configure({ keepVueRules: ['vue/html-self-closing'] }).recommended,
]
```

Делайте это на свой страх и риск. Правило из списка подавленных может сообщать о ложных проблемах, а его
исправления могут быть нестабильны на Pug: например, `vue/singleline-html-element-content-newline`
добавляет ещё одну пустую строку при каждом проходе. `keepVueRules` не действует на правила, приводящие
к падению: они остаются отключёнными.

## Ключ плагина {#plugin-key}

Плагин регистрируется под ключом `vue-pug`. Его используют все идентификаторы правил (`vue-pug/indent`, …)
и конфиги. Регистрация плагина под другим ключом не поддерживается.

## Пробелы в конце строк, пустые строки, перевод строки в конце файла {#trailing-spaces-blank-lines-final-newline}

Правила `vue-pug/*` этим не занимаются. Используйте правила [`@stylistic`](https://eslint.style/):
`@stylistic/no-trailing-spaces`, `@stylistic/no-multiple-empty-lines` и `@stylistic/eol-last`.
Они работают со всем файлом `.vue`, включая шаблоны Pug, а защита исправлений проверяет их исправления
так же, как любые другие.
