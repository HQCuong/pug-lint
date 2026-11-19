---
title: vue-pug/no-pug-control-flow
description: "vue-pug/no-pug-control-flow (eslint-plugin-pug-vue): запрещает конструкции Pug, выполняемые при компиляции (управляющие конструкции, код, mixin, интерполяцию #{}, include). Опции, примеры и миграция."
---

# vue-pug/no-pug-control-flow

Запрещает конструкции Pug, выполняемые при компиляции (управляющие конструкции, код, mixin, интерполяцию `#{}`, include).

Не включено в `configs.recommended`. Не исправляется автоматически.

## Подробности о правиле {#rule-details}

Условия, циклы, код, mixin и интерполяция `#{}` в Pug выполняются один раз, при компиляции шаблона.
Vue их не видит, поэтому они не реактивны, а правила `vue/*` не видят самой логики Pug. Это правило
сообщает о них, чтобы в шаблонах использовались директивы и привязки Vue. Каждая конструкция относится
к одной категории:

| Категория | Что отмечается |
|---|---|
| `control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default` |
| `code` | `- code`, `= expression`, `!= expression`, `p= expression` |
| `mixin` | определения mixin (`mixin name`) и вызовы (`+name`) |
| `interpolation` | `#{…}` и `!{…}` в тексте |
| `include` | `include`, `extends`, `block`, `append`, `prepend`, `yield`, `doctype` |

### Неправильно {#incorrect}

```vue
<template lang="pug">
ul
  each item in items
    li= item
</template>
```

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Правильно {#correct}

```vue
<template lang="pug">
ul
  li(v-for="item in items" :key="item") {{ item }}
</template>
```

```vue
<template lang="pug">
p(v-if="name") Hello {{ name }}
</template>
```

## Опции {#options}

```js
'vue-pug/no-pug-control-flow': ['warn', { allow: [] }]
```

`allow`: категории, о которых не сообщается; любые из `'control'`, `'code'`, `'mixin'`,
`'interpolation'`, `'include'` (по умолчанию `[]`).

### Правильно с `[{ "allow": ["interpolation"] }]` {#correct-with-allow-interpolation}

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Неправильно с `[{ "allow": ["interpolation"] }]` {#incorrect-with-allow-interpolation}

```vue
<template lang="pug">
p= name
</template>
```

## Миграция с `eslint-plugin-vue-pug` {#migrating-from-eslint-plugin-vue-pug}

У `eslint-plugin-vue-pug` есть правило с тем же id, `vue-pug/no-pug-control-flow`. Отличия:

- Его схема пуста: оно не принимает опций и всегда сообщает обо всех известных ему конструкциях. Это
  правило принимает `{ allow: [...] }` (см. выше). Любые опции, которые вы передавали старому правилу,
  отвергались ESLint, так что существующая настройка без опций продолжает работать.
- Старое правило было включено (на уровне `warn`) в его конфигах `strongly-recommended`. Это правило не
  входит ни в один конфиг: включите его сами.
