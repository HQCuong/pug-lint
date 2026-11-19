---
title: vue-pug/no-pug-control-flow
description: "vue-pug/no-pug-control-flow (eslint-plugin-pug-vue): Pug 컴파일 타임 구문(제어 흐름, code, mixin, #{} interpolation, include)을 금지합니다. 옵션, 예시."
---

# vue-pug/no-pug-control-flow

Pug 컴파일 타임 구문(제어 흐름, code, mixin, `#{}` interpolation, include)을 금지합니다.

`configs.recommended`에서 켜져 있지 않습니다. fix할 수 없습니다.

## 규칙 상세 {#rule-details}

Pug의 조건문, 반복문, code, mixin, `#{}` interpolation은 템플릿을 컴파일할 때 한 번 실행됩니다. Vue는 이를 보지
못하므로 반응형이 아니며, `vue/*` 규칙도 Pug 로직 자체는 보지 못합니다. 이 규칙은 그런 구문을 보고해서 템플릿이
대신 Vue directive와 바인딩을 사용하게 합니다. 각 구문은 한 카테고리에 속합니다.

| 카테고리 | 보고 대상 |
|---|---|
| `control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default` |
| `code` | `- code`, `= expression`, `!= expression`, `p= expression` |
| `mixin` | mixin 정의(`mixin name`)와 호출(`+name`) |
| `interpolation` | 텍스트 안의 `#{…}`와 `!{…}` |
| `include` | `include`, `extends`, `block`, `append`, `prepend`, `yield`, `doctype` |

### 잘못된 예 {#incorrect}

```vue
<template lang="pug">
ul
  each item in items
    li= item
</template>
```

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### 올바른 예 {#correct}

```vue
<template lang="pug">
ul
  li(v-for="item in items" :key="item") {{ item }}
</template>
```

```vue
<template lang="pug">
p(v-if="name") Hello {{ name }}
</template>
```

## 옵션 {#options}

```js
'vue-pug/no-pug-control-flow': ['warn', { allow: [] }]
```

`allow`: 보고하지 않을 카테고리. `'control'`, `'code'`, `'mixin'`, `'interpolation'`, `'include'` 중 원하는 것
(기본값 `[]`).

### `[{ "allow": ["interpolation"] }]`일 때 올바른 예 {#correct-with-allow-interpolation}

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### `[{ "allow": ["interpolation"] }]`일 때 잘못된 예 {#incorrect-with-allow-interpolation}

```vue
<template lang="pug">
p= name
</template>
```

## `eslint-plugin-vue-pug`에서 마이그레이션 {#migrating-from-eslint-plugin-vue-pug}

`eslint-plugin-vue-pug`에도 같은 id의 규칙 `vue-pug/no-pug-control-flow`가 있습니다. 차이점은 다음과 같습니다.

- 이전 규칙의 스키마는 비어 있습니다. 옵션을 받지 않고 알고 있는 모든 구문을 항상 보고합니다. 이 규칙은
  `{ allow: [...] }`를 받습니다(위 참고). 이전 규칙에 전달한 옵션은 ESLint가 거부했으므로, 옵션 없이 쓰던 기존
  설정은 계속 동작합니다.
- 이전 규칙은 `strongly-recommended` config에서 켜져 있었습니다(`warn`). 이 규칙은 어떤 config에도 들어 있지
  않으므로 직접 켜야 합니다.
