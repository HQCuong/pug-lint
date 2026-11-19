---
title: vue-pug/prefer-shorthand
description: "vue-pug/prefer-shorthand (eslint-plugin-pug-vue): требует или запрещает сокращения .class / #id для статических атрибутов class и id. Опции, примеры и исправления."
---

# vue-pug/prefer-shorthand

Требует или запрещает сокращения `.class` / `#id` для статических атрибутов class и id.

✅ Включено в `configs.recommended` (на уровне `warn`). 🔧 Исправляется через `--fix`.

## Подробности о правиле {#rule-details}

Class и id настраиваются отдельно, каждый со значением `always`, `never` или `ignore`.

- `always` (по умолчанию для обоих): статический атрибут `class` или `id` становится сокращениями:
  `p(class="a b")` → `p.a.b`, `p(id="x")` → `p#x`. Новые сокращения ставятся после существующих, а
  опустевший блок атрибутов удаляется.
- `never`: сокращения становятся одним атрибутом. Классы присоединяются к существующему статическому
  атрибуту `class`; иначе новый атрибут вставляется первым в первый блок атрибутов (или в новый блок)
  со стилем кавычек первого строкового значения этого блока (`"`, если его нет). Тег, оставшийся без имени
  и без сокращения, получает `div`.
- `ignore`: этот вид не проверяется.

Преобразуются только статические атрибуты: имя в точности `class` или `id`, значение является одной
обычной строкой `'…'` или `"…"`, и каждый разделённый пробелами токен в ней является допустимым именем
сокращения Pug. Если какой-либо токен таковым не является (`md:flex`, `w-1/2`, `-1`, `1a`), всё значение
остаётся нетронутым. Значение `id` должно быть одним токеном. Привязанные атрибуты (`:class`, `v-bind:id`)
не трогаются никогда. Тег, у которого есть и сокращение id, и атрибут `id` (в Pug это ошибка), сохраняет
свой id как написан.

Все преобразования одного тега применяются одним исправлением, привязанным к первому сообщению по тегу.

### Неправильно {#incorrect}

```vue
<template lang="pug">
p(class="lead") Text
</template>
```

```vue
<template lang="pug">
section(id="intro" class="hero dark")
</template>
```

### Правильно {#correct}

```vue
<template lang="pug">
p.lead Text
</template>
```

```vue
<template lang="pug">
section#intro.hero.dark(class="md:flex w-1/2" :class="{ active }")
</template>
```

## Опции {#options}

```js
'vue-pug/prefer-shorthand': ['warn', { class: 'always', id: 'always' }]
```

`class` и `id`: `'always'` (по умолчанию), `'never'` или `'ignore'`.

### Неправильно с `[{ "class": "never", "id": "always" }]` {#incorrect-with-class-never-id-always}

```vue
<template lang="pug">
p.lead Text
</template>
```

### Правильно с `[{ "class": "never", "id": "always" }]` {#correct-with-class-never-id-always}

```vue
<template lang="pug">
p#intro(class="lead") Text
</template>
```
