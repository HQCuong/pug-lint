---
title: vue-pug/attribute-parens-spacing
description: "vue-pug/attribute-parens-spacing (eslint-plugin-pug-vue): требует единообразных пробелов внутри скобок блоков атрибутов Pug. Опции, примеры и исправления."
---

# vue-pug/attribute-parens-spacing

Требует единообразных пробелов внутри скобок блоков атрибутов Pug.

✅ Включено в `configs.recommended` (на уровне `warn`). 🔧 Исправляется через `--fix`.

Заменяет `vue/html-closing-bracket-spacing`, которое падает на шаблонах Pug и отключено в
`configs.base`.

## Подробности о правиле {#rule-details}

Правило проверяет пробельные символы сразу после `(` и сразу перед `)` на той же строке:

- `never` (по умолчанию): там не должно быть пробелов. Исправление их удаляет.
- `always`: там должен быть хотя бы один пробел. Исправление вставляет его.

Сторона, пробелы которой содержат перенос строки, относится к
[`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) и остаётся нетронутой, так же как
пустой блок или блок, состоящий только из пробелов.

### Неправильно {#incorrect}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```

```vue
<template lang="pug">
input( type="text" name="q")
</template>
```

### Правильно {#correct}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

## Опции {#options}

```js
'vue-pug/attribute-parens-spacing': ['warn', 'never']
```

`'never'` (по умолчанию) или `'always'`.

### Неправильно с `["always"]` {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

### Правильно с `["always"]` {#correct-with-always}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```
