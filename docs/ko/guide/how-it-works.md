---
title: 동작 방식
description: "eslint-plugin-pug-vue가 Vue의 Pug를 lint하는 방법: vue-eslint-parser용 Pug tokenizer, vue/* 및 vue-pug/* 규칙, 모든 fix를 검사하는 fix guard."
---

# 동작 방식

ESLint는 Pug를 스스로 읽지 못하고, eslint-plugin-vue는 HTML 템플릿만 이해합니다. 플러그인이 이 둘을 이어 주고,
ESLint가 쓰기 전에 모든 fix를 검사합니다.

<HowItWorks />

## 1. 파싱 {#_1-parse}

[vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser)가 eslint-plugin-vue를 위해 `.vue` 파일을
파싱합니다. 다른 언어로 작성된 템플릿을 만나면 *tokenizer*에게 그 언어를 HTML에서 받았을 법한 token으로 바꿔 달라고
요청합니다. 플러그인은 `lang="pug"`와 `lang="jade"`를 위한 tokenizer를 등록합니다.

tokenizer는 [`pug-lint-parser`](/ko/parser/)로 템플릿을 파싱한 다음, 각 Pug 요소마다 시작 태그, 끝 태그, 텍스트,
`{{ }}` token을 Pug 소스의 정확한 위치에 만듭니다. vue-eslint-parser는 이 token으로 평소와 같은 템플릿 AST를
만들므로, `vue/*` 규칙은 Pug의 올바른 줄과 열을 가리킵니다.

Pug 구문 에러는 파싱 에러가 되어 `vue/no-parsing-error`가 보고합니다.

## 2. Lint {#_2-lint}

같은 파일에 두 종류의 규칙이 실행됩니다.

- eslint-plugin-vue의 **`vue/*` 규칙**은 HTML 템플릿에서와 똑같이 Vue 템플릿 AST를 읽습니다. 누락된 key, 사용하지
  않는 변수, 속성 순서, deprecated 구문 등을 다룹니다.
- **`vue-pug/*` 규칙**은 `pug-lint-parser`가 만든 Pug 구문 트리를 직접 읽습니다. 이 트리에는 Vue AST가 잃어버리는
  들여쓰기, 쉼표, 따옴표, 괄호, `.class`와 `#id` 축약 표기가 남아 있습니다. 포맷 규칙은 여기서 동작합니다.

## 3. 검사 {#_3-check}

플러그인은 eslint-plugin-vue의 processor를 감싸는데, 이 processor는 ESLint가 메시지를 사용하기 전에 모든 메시지를
거칩니다.

- **Suppress.** 일부 `vue/*` 규칙은 Pug에서 동작할 수 없습니다. 잘못된 문제를 보고하거나, fix가 Pug 템플릿에 HTML을
  써 넣기 때문입니다. 이런 규칙의 메시지는 Pug 템플릿 안에 있을 때만 제거되므로 HTML 템플릿은 계속 검사됩니다. Pug에서
  크래시를 일으키는 소수의 규칙은 대신 꺼집니다. [목록](./vue-rules).
- **Fix guard.** Pug 템플릿을 건드리는 모든 fix는 파일의 복사본에 적용되고, `pug-lint-parser`가 이를 다시
  파싱합니다. 플러그인은 전후의 구조를 비교합니다. 태그와 그 중첩, class와 id, 속성 개수, 텍스트의 형태, 모든
  JavaScript 표현식이 대상입니다. 하나라도 바뀌었거나 복사본이 더 이상 파싱되지 않으면 fix는 버려지고 경고는 남습니다.
  [자세히 보기](./fix-guard).

그다음 ESLint가 남은 fix를 `eslint --fix` 또는 에디터의 저장 시 fix로 적용합니다.

## 두 패키지 {#the-two-packages}

| 패키지 | 역할 |
|---|---|
| [`eslint-plugin-pug-vue`](https://www.npmjs.com/package/eslint-plugin-pug-vue) | ESLint 플러그인: tokenizer, `vue-pug/*` 규칙, processor, config. 설치하는 패키지입니다. |
| [`pug-lint-parser`](/ko/parser/) | 위의 모든 것이 기반으로 삼는 Pug 파서. ESLint와 Vue를 전혀 모르며 단독으로 사용할 수 있습니다. |
