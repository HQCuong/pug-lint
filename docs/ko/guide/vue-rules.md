---
title: Pug에서의 vue/* 규칙
description: "어떤 eslint-plugin-vue 규칙이 Pug 템플릿에서 동작하는지, 크래시 때문에 꺼지는 규칙은 무엇인지, Pug 템플릿 안에서만 억제되는 규칙은 무엇인지."
---

# Pug에서의 `vue/*` 규칙

대부분의 eslint-plugin-vue 규칙은 HTML에서와 똑같이 Pug 템플릿에서 동작합니다. 나머지는 모든 규칙을 Pug 템플릿과
그에 대응하는 HTML 템플릿에 실행해 보는 호환성 하네스로 측정합니다. 전체 결과는
[호환성 표](./vue-compatibility)에 있습니다.

## 크래시를 일으키는 규칙: 모든 곳에서 끔 {#crashing-rules-off-everywhere}

Pug 템플릿에서 **크래시**하는 규칙은 `configs.base`가 꺼 둡니다. Pug 요소에는 직접 쓴 끝 태그가 없으므로 끝 태그의
너비가 0이고, 그래서 이 규칙들이 사용하는 vue-eslint-parser의 token store가 깨집니다.

크래시는 나중에 걸러낼 수 없고, config는 템플릿이 아니라 파일만 선택할 수 있습니다. 따라서 이 규칙들은 HTML 템플릿을
포함한 **모든** `.vue` 파일에서 꺼집니다. HTML과 Pug 템플릿을 섞어 쓰는 프로젝트에서는 이 규칙들이 HTML 템플릿도
더는 검사하지 않습니다. Pug 템플릿은 `vue-pug/*` 대체 규칙이 맡습니다.

## 억제되는 규칙: Pug 안에서만 무시 {#suppressed-rules-silenced-inside-pug-only}

Pug에서 **잘못 보고하거나**, **fix가 Pug를 깨뜨리거나 재포맷하는** 규칙은 꺼지지 않습니다. processor가 Pug
템플릿 안에 위치한 메시지만 제거하므로, 이 규칙들은 HTML 템플릿과 `<script>`에서는 계속 동작합니다. 그래도 유지하고
싶다면 [억제된 규칙 유지하기](./configuration#keeping-a-suppressed-rule)를 참고하세요.

## 목록 {#the-lists}

<!-- begin auto-generated vue rule lists -->

Turned off for every `.vue` file by `configs.base`, because they crash on Pug templates:

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

Suppressed inside Pug templates only (they keep working on HTML templates and in `<script>`):

- `vue/array-bracket-newline`
- `vue/array-element-newline`
- `vue/brace-style`
- `vue/first-attribute-linebreak` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-comment-content-newline`
- `vue/html-comment-content-spacing`
- `vue/html-end-tags` (Pug replacement: `vue-pug/self-closing`)
- `vue/html-quotes` (Pug replacement: `vue-pug/attribute-quotes`)
- `vue/html-self-closing` (Pug replacement: `vue-pug/self-closing`)
- `vue/max-attributes-per-line` (Pug replacement: `vue-pug/max-attributes-per-line`)
- `vue/multiline-html-element-content-newline`
- `vue/multiline-ternary`
- `vue/no-multi-spaces` (Pug replacement: `vue-pug/no-multi-spaces`)
- `vue/no-spaces-around-equal-signs-in-attribute` (Pug replacement: `vue-pug/attribute-equals-spacing`)
- `vue/no-unsupported-features`
- `vue/object-curly-newline`
- `vue/object-property-newline`
- `vue/padding-line-between-tags`
- `vue/singleline-html-element-content-newline`
- `vue/static-class-names-order`
- `vue/v-if-else-key`

<!-- end auto-generated vue rule lists -->
