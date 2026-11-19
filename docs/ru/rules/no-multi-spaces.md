---
title: vue-pug/no-multi-spaces
description: "vue-pug/no-multi-spaces (eslint-plugin-pug-vue): запрещает несколько пробелов подряд между атрибутами в блоках атрибутов Pug. Опции, примеры и исправления."
---

# vue-pug/no-multi-spaces

Запрещает несколько пробелов подряд между атрибутами в блоках атрибутов Pug.

✅ Включено в `configs.recommended` (на уровне `warn`). 🔧 Исправляется через `--fix`.

Заменяет `vue/no-multi-spaces` внутри шаблонов Pug.

## Подробности о правиле {#rule-details}

Последовательность из двух или более пробелов или табуляций на одной строке между двумя атрибутами одного
блока считается нарушением, а исправление заменяет её одним пробелом. Запятая остаётся с предыдущим
атрибутом, поэтому измеряются только пробельные символы после последней запятой промежутка.

Значения атрибутов, пробельные символы рядом со скобками (см.
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md)) и текст после тега не трогаются
никогда.

### Неправильно {#incorrect}

```vue
<template lang="pug">
a(href="/"   target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(type="text",   name="q")
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
p(title="a   b")   spaced   text
</template>
```

## Опции {#options}

Нет.
