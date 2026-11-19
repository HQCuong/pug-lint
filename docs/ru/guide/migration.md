---
title: "Миграция с eslint-plugin-vue-pug"
description: "Переход с eslint-plugin-vue-pug на eslint-plugin-pug-vue: удаление, flat config и правила, которые изменились."
---

# Миграция с eslint-plugin-vue-pug {#migrating-from-eslint-plugin-vue-pug}

`eslint-plugin-vue-pug` регистрируется под тем же ключом `vue-pug`, поэтому эти два плагина нельзя
использовать вместе.

1. Удалите `eslint-plugin-vue-pug` и `vue-eslint-parser-template-tokenizer-pug` и уберите записи
   `plugin:vue-pug/...` из конфигурации. Этому плагину нужен flat config.
2. Установите и настройте этот плагин, как описано в [Начале работы](./getting-started).
3. Замените старые правила:
   - `vue-pug/no-parsing-error` → `vue/no-parsing-error`: оно сообщает о синтаксических ошибках Pug и
     включено в каждом конфиге eslint-plugin-vue, кроме `flat/base`.
   - `vue-pug/component-name-in-template-casing` → ничего: `vue/component-name-in-template-casing`
     падает на шаблонах Pug и отключено.
   - `vue-pug/no-pug-control-flow` сохраняет свой id, но его опции отличаются: старое правило не принимает
     опций и было включено в старых конфигах `strongly-recommended`; это принимает
     `{ allow: [...] }` и не входит ни в один конфиг. См.
     [его документацию](/ru/rules/no-pug-control-flow#migrating-from-eslint-plugin-vue-pug).

Старые конфиги везде отключали некоторые правила оформления (`vue/html-indent`,
`vue/html-self-closing`, …). Здесь они остаются включёнными для HTML-шаблонов и подавляются только внутри
шаблонов Pug (кроме [приводящих к падению](./vue-rules)), а их место занимают правила `vue-pug/*`.
