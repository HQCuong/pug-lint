---
title: vue-pug/self-closing
description: "vue-pug/self-closing (eslint-plugin-pug-vue): требует или запрещает самозакрывающийся / у тега. Опции, примеры и исправления."
---

# vue-pug/self-closing

Требует или запрещает самозакрывающийся `/` у тега.

✅ Включено в `configs.recommended` (на уровне `warn`). 🔧 Исправляется через `--fix`.

Заменяет `vue/html-self-closing` и `vue/html-end-tags` внутри шаблонов Pug.

## Подробности о правиле {#rule-details}

- `never` (по умолчанию): каждый `/` после тега (`img/`, `MyIcon/`) считается нарушением.
- `always-components`: компонент (имя тега с заглавной буквой или дефисом) без содержимого должен
  оканчиваться на `/`, и исправление его добавляет. У всех остальных тегов его быть не должно. Компонент,
  у которого `/` уже есть, остаётся нетронутым.

Pug отображает `p/ text` как `<p/>` с последующим текстом и отвергает `/` у тега с вложенными строками.
Поэтому исправление удаляет `/` только тогда, когда после него на его строке ничего нет (даже пробела), а у
тега нет вложенных строк, кроме небуферизованных комментариев (`//-`). Иначе о `/` сообщается без
исправления. Тегу с любым содержимым (текст, код, `.`, вложенные строки, даже пробел в конце) `/` не
добавляется никогда.

### Неправильно {#incorrect}

```vue
<template lang="pug">
img(src="logo.png")/
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")/
</template>
```

### Правильно {#correct}

```vue
<template lang="pug">
img(src="logo.png")
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")
  br
</template>
```

## Опции {#options}

```js
'vue-pug/self-closing': ['warn', 'never']
```

`'never'` (по умолчанию) или `'always-components'`.

### Неправильно с `["always-components"]` {#incorrect-with-always-components}

```vue
<template lang="pug">
MyIcon(name="star")
</template>
```

### Правильно с `["always-components"]` {#correct-with-always-components}

```vue
<template lang="pug">
div
  MyIcon(name="star")/
  my-icon/
  MyButton Save
  img(src="logo.png")
</template>
```
