---
title: vue-pug/attribute-parens-newline
description: "vue-pug/attribute-parens-newline (eslint-plugin-pug-vue): требует переносы строк после ( и перед ) в многострочных блоках атрибутов Pug. Опции, примеры и исправления."
---

# vue-pug/attribute-parens-newline

Требует переносы строк после `(` и перед `)` в многострочных блоках атрибутов Pug.

✅ Включено в `configs.recommended` (на уровне `warn`). 🔧 Исправляется через `--fix`.

Заменяет `vue/first-attribute-linebreak` и `vue/html-closing-bracket-newline` внутри шаблонов Pug.

## Подробности о правиле {#rule-details}

Блок атрибутов многострочный, если два его атрибута начинаются на разных строках.

- `multiline: 'always'` (по умолчанию): многострочному блоку нужен перенос строки сразу после `(` и сразу
  перед `)`. Исправление вставляет перенос строки с тем же окончанием строки и единицей отступа, что и
  в самом шаблоне (первый атрибут на уровень глубже тега, `)` на уровне тега).
- `multiline: 'never'`: у многострочного блока этих переносов быть не должно.

У блока, который не является многострочным (включая блок с одним атрибутом), их тоже быть не должно.
Пробелы на той же строке рядом со скобками относятся к
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md); пустой блок остаётся нетронутым.

### Неправильно {#incorrect}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```

```vue
<template lang="pug">
input(
  type="text"
)
</template>
```

### Правильно {#correct}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

```vue
<template lang="pug">
input(type="text" name="q")
</template>
```

## Опции {#options}

```js
'vue-pug/attribute-parens-newline': ['warn', { multiline: 'always' }]
```

`multiline`: `'always'` (по умолчанию) или `'never'`.

### Неправильно с `[{ "multiline": "never" }]` {#incorrect-with-multiline-never}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

### Правильно с `[{ "multiline": "never" }]` {#correct-with-multiline-never}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```
