---
title: "Использование с oxlint"
description: "Использование eslint-plugin-pug-vue в проекте с oxlint: oxlint для скриптов, ESLint для шаблонов Vue и eslint-plugin-oxlint, чтобы не было повторных сообщений."
---

# Использование с oxlint {#using-with-oxlint}

[Oxlint](https://oxc.rs/docs/guide/usage/linter) — гораздо более быстрый линтер, написанный на Rust. В файле
`.vue` он линтит только блоки `<script>`: он не линтит `<template>`, ни HTML, ни Pug, и не может загрузить
этот плагин, которому для чтения шаблона нужен vue-eslint-parser.

Поэтому в проекте с oxlint запускайте оба инструмента:

- **oxlint** для JavaScript и TypeScript, включая `<script>` файлов `.vue`;
- **ESLint** для того, что oxlint пока не умеет: шаблонов, с eslint-plugin-vue и
  `eslint-plugin-pug-vue`.

[`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) отключает в ESLint каждое
правило, которое уже запускает ваш конфиг oxlint, так что ни одна проблема не сообщается дважды, а ESLint
делает меньше работы.

## Установка {#install}

```sh
npm install --save-dev oxlint eslint-plugin-oxlint \
  eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

## Настройка oxlint {#configure-oxlint}

Создайте `.oxlintrc.json` командой `npx oxlint --init` и добавьте `vue` в его плагины, чтобы oxlint
запускал свои правила Vue и на блоках `<script>`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "vue"],
  "categories": {
    "correctness": "error"
  }
}
```

## Настройка ESLint {#configure-eslint}

Поставьте конфиг oxlint **последним**, после `vuePug.configs.recommended`:

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'
import oxlint from 'eslint-plugin-oxlint'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  // Last: turn off the rules that .oxlintrc.json already runs.
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
]
```

Правила, которые он отключает, относятся к скриптам (`no-debugger`, `vue/no-dupe-keys`,
`vue/valid-define-props`, …). Он не отключает ни одного правила шаблонов и ни одного правила `vue-pug/*`,
поэтому шаблоны Pug линтятся и форматируются точно так же, как без oxlint.

## Запуск {#run-them}

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint:fix": "oxlint --fix && eslint . --fix"
  }
}
```

Oxlint запускается первым: он занимает миллисекунды, и его ошибки видны до старта ESLint. Oxlint пропускает
файлы из вашего `.gitignore`, поэтому добавьте туда `node_modules`, если его там ещё нет.

`&&` останавливается на первом линтере, который всё ещё сообщает об ошибке. Если oxlint находит ошибку,
которую не может исправить (например, оператор `debugger`), `lint:fix` останавливается там, и ESLint не
форматирует шаблоны. Исправьте эту ошибку или запустите `npx eslint . --fix` отдельно.

## VS Code {#vs-code}

Установите [расширение Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)
рядом с [расширением ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
и пусть оба исправляют при сохранении:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```

Они никогда не исправляют одно и то же: oxlint исправляет скрипты, ESLint исправляет шаблоны, а каждое
исправление ESLint в шаблоне Pug по-прежнему проходит через [защиту исправлений](./fix-guard).

## Без ESLint? {#without-eslint}

Пока нет. Oxlint умеет запускать плагины ESLint, написанные на JavaScript, но передаёт им только блоки
`<script>` файла `.vue`, а пользовательские парсеры и языки файлов, такие как шаблоны Vue, в oxc ещё
в разработке. Когда oxlint сможет линтить шаблоны Vue, этот плагин сможет последовать за ним: его парсер,
`pug-lint-parser`, не зависит от ESLint. До тех пор оставляйте ESLint для шаблонов `.vue`.
