---
layout: home
title: ESLint для шаблонов Pug во Vue
description: "Линтинг и форматирование шаблонов Pug в однофайловых компонентах Vue с помощью ESLint. Ваши правила vue/* работают на Pug, eslint --fix форматирует Pug, а каждое исправление проверяется, чтобы не сломать шаблон."
# The hero and sections are written here, not with `hero`/`features` frontmatter, so the home
# page can hold the live --fix example. `markdownStyles: false` drops the .vp-doc wrapper; the
# sections opt back in with the vp-doc class where they render Markdown.
markdownStyles: false
---

<section class="pl-hero">
<div class="pl-hero-text">
<h1 class="home-heading">ESLint для шаблонов Pug во Vue</h1>
<p class="pl-lead">Запускайте правила <code>vue/*</code> на <code>&lt;template lang="pug"&gt;</code>, форматируйте Pug командой <code>eslint --fix</code> и сохраняйте каждый шаблон целым: каждое исправление проверяется до применения.</p>
<div class="pl-install vp-doc">

```sh
npm i -D eslint-plugin-pug-vue
```

</div>
<div class="pl-actions">
<a class="pl-button primary" href="/ru/guide/getting-started">Начать</a>
<a class="pl-button" href="/ru/rules/">Все 12 правил</a>
</div>
</div>
<div class="pl-hero-demo">
<FixDemo />
</div>
</section>

<section class="pl-section vp-doc">
<div class="pl-row">
<div class="pl-row-text">

## Ваши правила `vue/*` на Pug {#your-vue-rules-on-pug}

Правила eslint-plugin-vue работают на шаблонах Pug под привычными именами и с привычными опциями:
отсутствующие ключи, неиспользуемые переменные, порядок атрибутов, устаревший синтаксис. Те немногие
правила, которые не могут работать на Pug, отключены или заглушены только внутри шаблонов Pug, поэтому
продолжают проверять ваши HTML-шаблоны.

[Какие правила работают на Pug](/ru/guide/vue-rules)

</div>
<div class="pl-row-code">

```vue
<template lang="pug">
ul
  li(v-for="todo in todos") {{ todo.title }}
</template>
```

```txt
3:3  error  Elements in iteration expect to have 'v-bind:key' directives  vue/require-v-for-key
```

</div>
</div>

<div class="pl-row">
<div class="pl-row-text">

## Форматирование через `eslint --fix` {#formatting-with-eslint-fix}

Двенадцать небольших правил `vue-pug/*` форматируют сам Pug: отступы, пробелы, запятые, кавычки
и переносы строк в блоках атрибутов, а также сокращения `.class` / `#id`. У каждого правила есть опции,
и любое можно отключить. Без Prettier и без второго форматировщика, который спорит с ESLint при сохранении.

[Все правила](/ru/rules/)

</div>
<div class="pl-row-code">

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

</div>
</div>

<div class="pl-row">
<div class="pl-row-text">

## Исправления, которые не могут сломать шаблон {#fixes-that-cannot-break-a-template}

В Pug отступ задаёт структуру: сдвинете одну строку, и дерево изменится. Поэтому, прежде чем ESLint
запишет исправление в шаблон Pug, плагин проверяет его, из какого бы правила оно ни пришло:

1. он разбирает шаблон с применённым исправлением;
2. сравнивает с оригиналом теги, их вложенность, классы, атрибуты и каждое выражение JavaScript;
3. применяет исправление, только если ничего не изменилось. Иначе он отбрасывает исправление и оставляет предупреждение, чтобы вы поправили эту строку вручную.

[Как работает защита исправлений](/ru/guide/fix-guard)

</div>
<div class="pl-row-code">

```pug
//- the same template to the guard
p(class="intro lead") Hello
p.intro.lead Hello

//- a different one: a class is gone
p.intro Hello
```

<p class="pl-caption">Так, <code>vue-pug/prefer-shorthand</code> может переписать первую строку во вторую, но исправление, которое теряет класс или переносит строку к другому родителю, не применяется никогда.</p>

</div>
</div>
</section>

<section class="pl-section pl-start vp-doc">

## Старт за две минуты {#start-in-two-minutes}

Нужны ESLint 9.15 или 10 с flat config, eslint-plugin-vue 10 и vue-eslint-parser 10.
[Начало работы](/ru/guide/getting-started) проведёт через установку, конфигурацию и автоисправление при сохранении в VS Code.
Переходите с eslint-plugin-vue-pug? Прочитайте [руководство по миграции](/ru/guide/migration).

</section>
