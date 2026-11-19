---
title: eslint-plugin-vue-pug에서 마이그레이션
description: "eslint-plugin-vue-pug에서 eslint-plugin-pug-vue로 옮기기: 제거, flat config, 달라진 규칙."
---

# eslint-plugin-vue-pug에서 마이그레이션

`eslint-plugin-vue-pug`는 같은 `vue-pug` key로 자신을 등록하므로, 두 플러그인을 함께 사용할 수 없습니다.

1. `eslint-plugin-vue-pug`와 `vue-eslint-parser-template-tokenizer-pug`를 제거하고, config에서
   `plugin:vue-pug/...` 항목을 지웁니다. 이 플러그인은 flat config가 필요합니다.
2. [시작하기](./getting-started)에 따라 이 플러그인을 설치하고 설정합니다.
3. 이전 규칙을 교체합니다.
   - `vue-pug/no-parsing-error` → `vue/no-parsing-error`: Pug 구문 에러를 보고하며, `flat/base`를 제외한 모든
     eslint-plugin-vue config에서 켜져 있습니다.
   - `vue-pug/component-name-in-template-casing` → 대체 규칙 없음: `vue/component-name-in-template-casing`은 Pug
     템플릿에서 크래시를 일으켜 꺼져 있습니다.
   - `vue-pug/no-pug-control-flow`는 id가 그대로지만 옵션이 다릅니다. 이전 규칙은 옵션을 받지 않았고 이전
     `strongly-recommended` config에서 켜져 있었습니다. 이 규칙은 `{ allow: [...] }`를 받고 어떤 config에도 들어
     있지 않습니다. [해당 규칙 문서](/ko/rules/no-pug-control-flow#migrating-from-eslint-plugin-vue-pug)를
     참고하세요.

이전 config는 일부 레이아웃 규칙(`vue/html-indent`, `vue/html-self-closing` 등)을 모든 곳에서 껐습니다. 이
플러그인에서는 HTML 템플릿에서 이 규칙들이 켜진 채로 남고 Pug 템플릿 안에서만 억제되며([크래시를 일으키는 규칙](./vue-rules)은 예외), 그 자리를 `vue-pug/*` 규칙이 대신합니다.
