---
title: vue-pug/max-attributes-per-line
description: "vue-pug/max-attributes-per-line (eslint-plugin-pug-vue): Pug 속성 블록에서 한 줄당 최대 속성 수를 강제합니다. 옵션, 예시, fix."
---

# vue-pug/max-attributes-per-line

Pug 속성 블록에서 한 줄당 최대 속성 수를 강제합니다.

✅ `configs.recommended`에서 켜져 있습니다(`warn`). 🔧 `--fix`로 고칠 수 있습니다.

Pug 템플릿 안에서 `vue/max-attributes-per-line`을 대체합니다.

## 규칙 상세 {#rule-details}

속성은 속성 블록별로 셉니다. `a(w x)(y z)`에는 속성 두 개짜리 블록이 둘 있습니다.

- 한 줄에 있는 블록은 최대 `singleline`개(기본값 `3`)의 속성을 가질 수 있습니다. 이를 넘으면 첫 번째 이후의 모든
  속성을 보고합니다.
- 값 안의 줄바꿈을 포함해 줄바꿈이 하나라도 있는 블록은 여러 줄 블록입니다. 각 줄에는 최대 `multiline`개(기본값
  `1`)의 속성이 올 수 있으며, 초과한 속성을 보고합니다.

fix는 보고된 속성 앞의 공백을 줄바꿈으로 바꾸고 태그보다 한 단계 깊게 들여씁니다(쉼표는 앞 속성에 붙어 있습니다).
`(` 뒤와 `)` 앞의 줄바꿈은 [`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md)에 맡깁니다.
tag interpolation 안의 태그(`#[a(x y z w)]`)는 텍스트 줄의 일부이므로 검사하지 않습니다.

### 잘못된 예 {#incorrect}

```vue
<template lang="pug">
input(type="text" name="q" placeholder="Search" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text" name="q"
  required
)
</template>
```

### 올바른 예 {#correct}

```vue
<template lang="pug">
input(type="text" name="q" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
  placeholder="Search"
  required
)
</template>
```

## 옵션 {#options}

```js
'vue-pug/max-attributes-per-line': ['warn', { singleline: 3, multiline: 1 }]
```

- `singleline`(1 이상의 정수, 기본값 `3`): 한 줄에 있는 블록의 최대 개수.
- `multiline`(1 이상의 정수, 기본값 `1`): 여러 줄 블록에서 한 줄당 최대 개수.

### `[{ "singleline": 1 }]`일 때 잘못된 예 {#incorrect-with-singleline-1}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### `[{ "singleline": 1 }]`일 때 올바른 예 {#correct-with-singleline-1}

```vue
<template lang="pug">
a(href="/") Home
</template>
```
