---
title: 설정
description: "eslint-plugin-pug-vue 설정: base와 recommended config, <template> 아래로 들여쓴 템플릿, 무시된 vue/* 규칙 유지하기, 플러그인 key."
---

# 설정

## 두 가지 config {#the-two-configs}

두 config 모두 `**/*.vue`에 적용됩니다.

| Config | 설정되는 것 |
|---|---|
| `configs.base` | vue-eslint-parser용 Pug 템플릿 tokenizer, processor(메시지 억제와 [fix guard](./fix-guard)), 그리고 [크래시를 일으키는 `vue/*` 규칙](./vue-rules)을 끈 상태. `vue-pug/*` 규칙은 하나도 켜지지 않습니다. |
| `configs.recommended` | `base`에 권장 `vue-pug/*` 규칙을 모두 `warn`으로 더한 것. |

`vue-pug/*` 규칙을 직접 고르고 싶다면 `base`를 사용하세요.

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.base,
  {
    files: ['**/*.vue'],
    rules: {
      'vue-pug/indent': 'error',
      'vue-pug/attribute-quotes': ['error', 'single'],
    },
  },
]
```

직접 지정한 `languageOptions.parserOptions`(예: `<script>`의 TypeScript를 위한 `parser`)는 플러그인의 옵션과
병합되므로 그대로 동작합니다.

## `<template>` 아래로 들여쓴 템플릿 {#templates-indented-under-template}

`vue-pug/indent`는 최상위 노드를 0열에 둡니다(`baseIndent: 0`, `.pug` 파일과 같습니다). 템플릿을
`<template>` 아래로 한 단계 들여써서 작성한다면 `baseIndent: 1`로 설정하세요. 그렇지 않으면 규칙이 템플릿을
0열로 옮깁니다.

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  { files: ['**/*.vue'], rules: { 'vue-pug/indent': ['warn', 2, { baseIndent: 1 }] } },
]
```

모든 옵션은 [`vue-pug/indent`](/ko/rules/indent)를 참고하세요.

## 억제된 규칙 유지하기 {#keeping-a-suppressed-rule}

일부 `vue/*` 규칙은 [Pug 템플릿 안에서 억제됩니다](./vue-rules). 그런 규칙이 Pug에서도 계속 보고하게 하려면
`configure()`로 config를 만들고 `vuePug.configs` 대신 사용하세요.

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configure({ keepVueRules: ['vue/html-self-closing'] }).recommended,
]
```

이 방법은 사용자의 책임하에 쓰는 것입니다. 억제 목록에 있는 규칙은 잘못된 문제를 보고할 수 있고, 그 fix가 Pug에서
안정적이지 않을 수 있습니다. 예를 들어 `vue/singleline-html-element-content-newline`은 실행할 때마다 빈 줄을 하나씩
더 추가합니다. `keepVueRules`는 크래시를 일으키는 규칙에는 적용되지 않으며, 이 규칙들은 계속 꺼진 상태로 남습니다.

## 플러그인 key {#plugin-key}

플러그인은 `vue-pug`라는 key로 등록됩니다. 모든 규칙 id(`vue-pug/indent` 등)와 config가 이 key를 사용합니다.
다른 key로 플러그인을 등록하는 것은 지원하지 않습니다.

## 줄 끝 공백, 빈 줄, 마지막 개행 {#trailing-spaces-blank-lines-final-newline}

`vue-pug/*` 규칙은 이를 다루지 않습니다. [`@stylistic`](https://eslint.style/) 규칙인
`@stylistic/no-trailing-spaces`, `@stylistic/no-multiple-empty-lines`, `@stylistic/eol-last`를 사용하세요.
이 규칙들은 Pug 템플릿을 포함한 `.vue` 파일 전체에서 동작하며, 이 규칙들의 fix도 다른 fix와 마찬가지로 fix guard가
검사합니다.
