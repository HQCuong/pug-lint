---
title: vue-pug/attribute-quotes
description: "vue-pug/attribute-quotes (eslint-plugin-pug-vue): требует единого стиля кавычек для значений атрибутов Pug. Опции, примеры и исправления."
---

# vue-pug/attribute-quotes

Требует единого стиля кавычек для значений атрибутов Pug.

✅ Включено в `configs.recommended` (на уровне `warn`). 🔧 Исправляется через `--fix`.

Заменяет `vue/html-quotes` внутри шаблонов Pug. Исправление того правила экранирует внутренние кавычки как
`&quot;`, что неверно в Pug (значение атрибута является выражением JavaScript), и оно не знает, что
обратные кавычки допустимы в Pug.

## Подробности о правиле {#rule-details}

Значение, являющееся одной строкой `'…'` или `"…"` в другом стиле кавычек, считается нарушением.
Исправление только меняет местами два символа кавычек и никогда ничего не экранирует заново: если значение
содержит целевую кавычку или обратную косую черту, о нём сообщается без исправления.

Значения в обратных кавычках по умолчанию остаются как есть. С `backticks: 'convert'` значение в обратных
кавычках считается нарушением и исправляется, только если оно на одной строке и не содержит ни `${}`, ни
кавычек, ни обратной косой черты; остальные значения в обратных кавычках не трогаются. Значения, которые
не являются одним литералом (`x`, `a + 'b'`, `{ a: 1 }`), не трогаются никогда.

### Неправильно {#incorrect}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

```vue
<template lang="pug">
p(title='Say "hi"') Hello
</template>
```

О втором примере сообщается без исправления: для замены кавычек потребовалось бы экранирование.

### Правильно {#correct}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

```vue
<template lang="pug">
p(:class=`card` :title="'Hi ' + name" :data-id=id) Hello
</template>
```

## Опции {#options}

```js
'vue-pug/attribute-quotes': ['warn', 'double', { backticks: 'keep' }]
```

- Первая опция: `'double'` (по умолчанию) или `'single'`.
- `backticks`: `'keep'` (по умолчанию) или `'convert'`.

### Неправильно с `["single"]` {#incorrect-with-single}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

### Правильно с `["single"]` {#correct-with-single}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

### Неправильно с `["double", { "backticks": "convert" }]` {#incorrect-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello`) Hi
</template>
```

### Правильно с `["double", { "backticks": "convert" }]` {#correct-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello ${name}`) Hi
</template>
```
