---
title: vue-pug/attribute-equals-spacing
description: "vue-pug/attribute-equals-spacing (eslint-plugin-pug-vue): запрещает пробелы вокруг = и != в атрибутах Pug. Опции, примеры и исправления."
---

# vue-pug/attribute-equals-spacing

Запрещает пробелы вокруг `=` и `!=` в атрибутах Pug.

✅ Включено в `configs.recommended` (на уровне `warn`). 🔧 Исправляется через `--fix`.

Заменяет `vue/no-spaces-around-equal-signs-in-attribute` внутри шаблонов Pug.

## Подробности о правиле {#rule-details}

Пробельные символы между именем атрибута и его `=` / `!=`, а также между оператором и значением должны
отсутствовать. Исправление их удаляет. Промежуток, содержащий перенос строки, остаётся нетронутым.

### Неправильно {#incorrect}

```vue
<template lang="pug">
a(href = "/") Home
</template>
```

```vue
<template lang="pug">
input(:value= "query" @input ="update")
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
div(v-html!="html" :title="title")
</template>
```

## Опции {#options}

Нет.
