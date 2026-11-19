---
title: 문제 해결
description: "eslint-plugin-pug-vue의 흔한 문제 해결: 크래시를 일으키는 vue/* 규칙, 적용되지 않는 fix, Pug 템플릿에서 아무것도 보고되지 않는 경우."
---

# 문제 해결

## `TypeError: Cannot read properties of null (reading 'type')` (또는 `'range'`) {#typeerror-cannot-read-properties-of-null-reading-type-or-range}

Pug 템플릿에서 크래시를 일으키는 `vue/*` 규칙 중 하나가 `...vuePug.configs.recommended`(또는 `base`) 뒤에 놓인
config 때문에 다시 켜졌습니다. 예를 들어 공유 config나 해당 규칙을 켜는 `rules` 항목이 원인일 수 있습니다.
`configs.base`는 모든 `.vue` 파일에서 다음 규칙을 끕니다.

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

`...vuePug.configs.recommended`를 이 규칙들을 켜는 모든 config 뒤에 두거나, 직접 작성한 `rules`에서 해당 규칙을
제거하세요. Pug 템플릿에는 대신 `vue-pug/*` 대체 규칙을 사용하세요.

## 문제는 보고되는데 `--fix`가 고치지 않을 때 {#a-problem-is-reported-but-fix-does-not-fix-it}

fix를 적용하면 템플릿의 구조가 바뀌거나 파싱할 수 없게 되므로 [fix guard](./fix-guard)가 fix를 버렸습니다. 해당
줄을 직접 고치세요. fix가 안전했다고 생각된다면 해당 템플릿과 함께
[이슈를 열어](https://github.com/HQCuong/pug-lint/issues/new/choose) 주세요.

템플릿에 `vue/no-parsing-error` 문제가 없는지도 확인하세요. 템플릿에 Pug 구문 에러가 있는 동안에는 그 안에서 어떤
fix도 적용되지 않습니다.

## Pug 템플릿에서 아무것도 보고되지 않을 때 {#nothing-is-reported-in-pug-templates}

- 블록은 `<template lang="pug">` 또는 `<template lang="jade">`여야 합니다.
- `...vuePug.configs.recommended`(또는 `base`)는 eslint-plugin-vue config 뒤에 와야 하며, 그 뒤의 어떤 config도
  `**/*.vue`에 자체 `processor`를 설정하면 안 됩니다.
- VS Code에서는 `eslint.validate`에 `vue`가 있어야 합니다([에디터 설정](./editor-setup) 참고).

## 에디터와 CLI의 결과가 다를 때 {#the-editor-and-the-cli-disagree}

ESLint 확장은 터미널과 다른 ESLint나 다른 config를 사용할 수 있습니다. `npx eslint --print-config src/App.vue`를
실행해 확장의 출력 패널(*ESLint* 채널)과 비교해 보세요.
