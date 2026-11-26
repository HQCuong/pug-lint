---
title: 시작하기
description: "eslint-plugin-pug-vue를 설치하고 ESLint로 Vue 단일 파일 컴포넌트의 Pug 템플릿을 lint합니다: 요구 사항, 설치, flat config, 첫 eslint --fix."
---

# 시작하기

`eslint-plugin-pug-vue`는 Vue 단일 파일 컴포넌트의 `<template lang="pug">`(그리고 `lang="jade"`)를 lint하고
포맷합니다.

- eslint-plugin-vue의 `vue/*` 규칙이 Pug 템플릿에서 기존과 같은 이름과 옵션으로 동작합니다.
- [`vue-pug/*` 규칙](/ko/rules/)이 Pug 자체를 포맷합니다. 들여쓰기, 속성 배치, 따옴표, 쉼표, 축약 표기를 다룹니다.
  선택적으로 쓸 수 있는 규칙 하나는 Pug 컴파일 타임 구문을 보고합니다.
- Pug 템플릿을 건드리는 모든 fix는 ESLint가 적용하기 전에 검사를 거치므로
  ([fix guard](./fix-guard)), `--fix`와 저장 시 fix가 템플릿을 깨뜨리지 않습니다.
- Prettier도 별도의 포매터도 필요 없습니다. fix는 ESLint에서 나옵니다.

## 요구 사항 {#requirements}

- Node.js `^22.13.0 || >=24`
- ESLint `^9.15.0 || ^10.0.0`, flat config만 지원(`eslint.config.js`)
- `eslint-plugin-vue` `^10.0.0`과 `vue-eslint-parser` `^10.0.0`

## 설치 {#install}

::: code-group

```sh [npm]
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [pnpm]
pnpm add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [yarn]
yarn add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

:::

## 설정 {#configure}

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

`...vuePug.configs.recommended`는 eslint-plugin-vue config **뒤에** 두세요. 이 config가 parser 옵션, processor,
Pug에서 꺼야 하는 규칙을 설정합니다. 뒤에 오는 config가 자체 processor를 설정하거나
[크래시를 일으키는 규칙](./vue-rules)을 다시 켜면 Pug 파일 lint가 깨집니다.

## 실행하기 {#run-it}

```sh
npx eslint .          # report problems
npx eslint . --fix    # fix what can be fixed
```

VS Code에서 저장할 때 fix하려면 [에디터 설정](./editor-setup)을 참고하세요.

## 다음 단계 {#next-steps}

- [설정](./configuration): 두 가지 config, `baseIndent`, 억제된 규칙 유지하기.
- [규칙](/ko/rules/): 각 `vue-pug/*` 규칙의 동작과 옵션.
- 규모가 큰 코드베이스에 적용하기 전에 [알려진 제한 사항](./limitations)을 확인하세요.
- `eslint-plugin-vue-pug`에서 오셨나요? [마이그레이션 가이드](./migration)를 읽어 보세요.
- oxlint를 쓰시나요? ESLint와 함께 실행하세요: [oxlint와 함께 사용하기](./oxlint)를 참고하세요.
