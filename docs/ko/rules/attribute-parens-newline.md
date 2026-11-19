---
title: vue-pug/attribute-parens-newline
description: "vue-pug/attribute-parens-newline (eslint-plugin-pug-vue): 여러 줄 Pug 속성 블록의 (와 ) 주변 줄바꿈을 강제합니다. 옵션, 예시, fix."
---

# vue-pug/attribute-parens-newline

여러 줄 Pug 속성 블록에서 `(` 뒤와 `)` 앞의 줄바꿈을 강제합니다.

✅ `configs.recommended`에서 켜져 있습니다(`warn`). 🔧 `--fix`로 고칠 수 있습니다.

Pug 템플릿 안에서 `vue/first-attribute-linebreak`와 `vue/html-closing-bracket-newline`을 대체합니다.

## 규칙 상세 {#rule-details}

두 속성이 서로 다른 줄에서 시작하면 그 속성 블록은 여러 줄입니다.

- `multiline: 'always'`(기본값): 여러 줄 블록은 `(` 바로 뒤와 `)` 바로 앞에 줄바꿈이 있어야 합니다. fix는
  템플릿 자체의 줄바꿈 문자와 들여쓰기 단위로 줄바꿈을 삽입합니다(첫 속성은 태그보다 한 단계 깊게, `)`는 태그와
  같은 수준).
- `multiline: 'never'`: 여러 줄 블록에 그런 줄바꿈이 없어야 합니다.

여러 줄이 아닌 블록(속성이 하나뿐인 블록 포함)에도 그런 줄바꿈이 없어야 합니다. 괄호 옆의 같은 줄 공백은
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md)의 영역이며, 빈 블록은 그대로 둡니다.

### 잘못된 예 {#incorrect}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```

```vue
<template lang="pug">
input(
  type="text"
)
</template>
```

### 올바른 예 {#correct}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

```vue
<template lang="pug">
input(type="text" name="q")
</template>
```

## 옵션 {#options}

```js
'vue-pug/attribute-parens-newline': ['warn', { multiline: 'always' }]
```

`multiline`: `'always'`(기본값) 또는 `'never'`.

### `[{ "multiline": "never" }]`일 때 잘못된 예 {#incorrect-with-multiline-never}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

### `[{ "multiline": "never" }]`일 때 올바른 예 {#correct-with-multiline-never}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```
