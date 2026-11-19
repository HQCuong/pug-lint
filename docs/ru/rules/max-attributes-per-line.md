---
title: vue-pug/max-attributes-per-line
description: "vue-pug/max-attributes-per-line (eslint-plugin-pug-vue): ограничивает число атрибутов на строке в блоках атрибутов Pug. Опции, примеры и исправления."
---

# vue-pug/max-attributes-per-line

Ограничивает число атрибутов на строке в блоках атрибутов Pug.

✅ Включено в `configs.recommended` (на уровне `warn`). 🔧 Исправляется через `--fix`.

Заменяет `vue/max-attributes-per-line` внутри шаблонов Pug.

## Подробности о правиле {#rule-details}

Атрибуты считаются по блокам атрибутов: у `a(w x)(y z)` два блока по два атрибута.

- Блок на одной строке может содержать до `singleline` атрибутов (по умолчанию `3`). Если их больше,
  нарушением считается каждый атрибут после первого.
- Блок, содержащий любой перенос строки, в том числе внутри значения, является многострочным. На каждой
  его строке может быть до `multiline` атрибутов (по умолчанию `1`); лишние считаются нарушениями.

Исправление заменяет пробельные символы перед атрибутом-нарушителем переносом строки с отступом на один
уровень глубже тега (запятая остаётся с предыдущим атрибутом). Переносы строк после `(` и перед `)`
оставлены правилу [`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md). Теги внутри
интерполяции тега (`#[a(x y z w)]`) не проверяются: они являются частью текстовой строки.

### Неправильно {#incorrect}

```vue
<template lang="pug">
input(type="text" name="q" placeholder="Search" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text" name="q"
  required
)
</template>
```

### Правильно {#correct}

```vue
<template lang="pug">
input(type="text" name="q" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
  placeholder="Search"
  required
)
</template>
```

## Опции {#options}

```js
'vue-pug/max-attributes-per-line': ['warn', { singleline: 3, multiline: 1 }]
```

- `singleline` (целое число ≥ 1, по умолчанию `3`): максимум для блока на одной строке.
- `multiline` (целое число ≥ 1, по умолчанию `1`): максимум на строку в многострочном блоке.

### Неправильно с `[{ "singleline": 1 }]` {#incorrect-with-singleline-1}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Правильно с `[{ "singleline": 1 }]` {#correct-with-singleline-1}

```vue
<template lang="pug">
a(href="/") Home
</template>
```
