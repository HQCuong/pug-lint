---
layout: home
title: Vue의 Pug 템플릿을 위한 ESLint
description: "ESLint로 Vue 단일 파일 컴포넌트의 Pug 템플릿을 lint하고 포맷합니다. vue/* 규칙이 Pug에서도 동작하고, eslint --fix가 Pug를 포맷하며, 모든 fix는 템플릿을 깨뜨리지 않도록 검사를 거칩니다."
# The hero and sections are written here, not with `hero`/`features` frontmatter, so the home
# page can hold the live --fix example. `markdownStyles: false` drops the .vp-doc wrapper; the
# sections opt back in with the vp-doc class where they render Markdown.
markdownStyles: false
---

<section class="pl-hero">
<div class="pl-hero-text">
<h1 class="home-heading">Vue의 Pug 템플릿을 위한 ESLint</h1>
<p class="pl-lead"><code>&lt;template lang="pug"&gt;</code>에서 <code>vue/*</code> 규칙을 실행하고, <code>eslint --fix</code>로 Pug를 포맷하세요. 모든 fix는 적용되기 전에 검사를 거치므로 템플릿이 온전하게 유지됩니다.</p>
<div class="pl-install vp-doc">

```sh
npm i -D eslint-plugin-pug-vue
```

</div>
<div class="pl-actions">
<a class="pl-button primary" href="/ko/guide/getting-started">시작하기</a>
<a class="pl-button" href="/ko/rules/">12개 규칙 살펴보기</a>
</div>
</div>
<div class="pl-hero-demo">
<FixDemo />
</div>
</section>

<section class="pl-section vp-doc">
<div class="pl-row">
<div class="pl-row-text">

## Pug에서도 쓰는 `vue/*` 규칙 {#your-vue-rules-on-pug}

eslint-plugin-vue 규칙이 Pug 템플릿에서 기존과 같은 이름과 옵션으로 동작합니다. 누락된 key, 사용하지 않는
변수, 속성 순서, deprecated 구문 등을 잡아냅니다. Pug에서 동작할 수 없는 소수의 규칙은 꺼지거나
Pug 템플릿 안에서만 무시되므로, HTML 템플릿은 계속 검사됩니다.

[Pug에서 동작하는 규칙](/ko/guide/vue-rules)

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

## `eslint --fix`로 포맷하기 {#formatting-with-eslint-fix}

작은 `vue-pug/*` 규칙 열두 개가 Pug 자체를 포맷합니다. 들여쓰기, 속성 블록의 공백, 쉼표, 따옴표,
줄바꿈, 그리고 `.class` / `#id` 축약 표기를 다룹니다. 각 규칙에는 옵션이 있고 원하는 규칙은 언제든 끌 수
있습니다. Prettier도, 저장할 때 ESLint와 충돌하는 두 번째 포매터도 필요 없습니다.

[모든 규칙 보기](/ko/rules/)

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

## 템플릿을 깨뜨릴 수 없는 fix {#fixes-that-cannot-break-a-template}

Pug에서는 들여쓰기가 곧 구조입니다. 한 줄만 옮겨도 트리가 바뀝니다. 그래서 ESLint가 Pug 템플릿에 fix를
쓰기 전에, 어떤 규칙에서 나온 fix든 플러그인이 먼저 검사합니다.

1. fix를 적용한 템플릿을 파싱합니다.
2. 태그, 중첩, class, 속성, 모든 JavaScript 표현식을 원본과 비교합니다.
3. 아무것도 바뀌지 않았을 때만 fix를 적용합니다. 그렇지 않으면 fix를 버리고 경고를 남기므로, 해당 줄을 직접 고치면 됩니다.

[fix guard의 동작 방식](/ko/guide/fix-guard)

</div>
<div class="pl-row-code">

```pug
//- the same template to the guard
p(class="intro lead") Hello
p.intro.lead Hello

//- a different one: a class is gone
p.intro Hello
```

<p class="pl-caption">그래서 <code>vue-pug/prefer-shorthand</code>는 첫 번째 줄을 두 번째 줄로 바꿀 수 있지만, class를 잃거나 줄을 다른 부모로 옮기는 fix는 적용되지 않습니다.</p>

</div>
</div>
</section>

<section class="pl-section pl-start vp-doc">

## 2분 만에 시작하기 {#start-in-two-minutes}

플랫 설정(flat config)을 쓰는 ESLint 9.15 또는 10, eslint-plugin-vue 10, vue-eslint-parser 10이 필요합니다.
[시작하기](/ko/guide/getting-started)에서 설치, 설정, VS Code의 저장 시 자동 fix까지 안내합니다.
eslint-plugin-vue-pug에서 오셨나요? [마이그레이션 가이드](/ko/guide/migration)를 읽어 보세요.

</section>
