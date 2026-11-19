---
title: vue-pug/implicit-div
description: "vue-pug/implicit-div (eslint-plugin-pug-vue): требует или запрещает имя тега div перед сокращениями класса и id. Опции, примеры и исправления."
---

# vue-pug/implicit-div

Требует или запрещает имя тега `div` перед сокращениями класса и id.

✅ Включено в `configs.recommended` (на уровне `warn`). 🔧 Исправляется через `--fix`.

## Подробности о правиле {#rule-details}

В Pug строка, начинающаяся с сокращения `.class` или `#id`, является `div`.

- `always` (по умолчанию): используйте неявную форму. Явный `div`, за которым следует сокращение,
  считается нарушением, а исправление удаляет имя.
- `never`: пишите `div`. Тег, начинающийся с сокращения, считается нарушением, а исправление вставляет
  `div`.

`div` без сокращений (`div`, `div(v-if="ok")`) не считается нарушением никогда. Два случая при `always`
сообщаются без исправления: `div` внутри интерполяции тега (`#[div.a x]`) и `div`, у которого первое
сокращение идёт не сразу за именем (`div(a).b`), потому что удаление имени оставило бы строку, начинающуюся
с `(`.

### Неправильно {#incorrect}

```vue
<template lang="pug">
div.card Content
</template>
```

```vue
<template lang="pug">
div#app.container
  p Hello
</template>
```

### Правильно {#correct}

```vue
<template lang="pug">
.card Content
</template>
```

```vue
<template lang="pug">
#app.container
  div(v-if="ready") Hello
</template>
```

## Опции {#options}

```js
'vue-pug/implicit-div': ['warn', 'always']
```

`'always'` (по умолчанию) или `'never'`.

### Неправильно с `["never"]` {#incorrect-with-never}

```vue
<template lang="pug">
.card Content
</template>
```

### Правильно с `["never"]` {#correct-with-never}

```vue
<template lang="pug">
div.card Content
</template>
```
