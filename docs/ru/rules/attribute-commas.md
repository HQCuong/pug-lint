---
title: vue-pug/attribute-commas
description: "vue-pug/attribute-commas (eslint-plugin-pug-vue): требует или запрещает запятые между атрибутами в блоках атрибутов Pug. Опции, примеры и исправления."
---

# vue-pug/attribute-commas

Требует или запрещает запятые между атрибутами в блоках атрибутов Pug.

✅ Включено в `configs.recommended` (на уровне `warn`). 🔧 Исправляется через `--fix`.

## Подробности о правиле {#rule-details}

Pug допускает атрибуты, разделённые пробелами, запятыми или и тем и другим. Это правило делает выбор
единообразным:

- `never` (по умолчанию): каждая запятая в блоке атрибутов считается нарушением и удаляется.
- `always`: ровно одна запятая между каждой парой атрибутов. Отсутствующая запятая вставляется сразу
  после предыдущего атрибута; лишние запятые в том же промежутке удаляются.

При любой опции запятая перед первым атрибутом или после последнего считается нарушением. Если удаление
запятой склеило бы два атрибута (`a(x="1",y="2")`), исправление ставит на её место один пробел. Правило
трогает только символы запятых: с `always` пробелы перед запятой (`x="1" , y="2"`) остаются как есть, и в
v1 их не нормализует никакое другое правило.

### Неправильно {#incorrect}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text",
  name="q"
)
</template>
```

### Правильно {#correct}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
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
'vue-pug/attribute-commas': ['warn', 'never']
```

`'never'` (по умолчанию) или `'always'`.

### Неправильно с `["always"]` {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Правильно с `["always"]` {#correct-with-always}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```
