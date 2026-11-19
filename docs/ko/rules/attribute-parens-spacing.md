---
title: vue-pug/attribute-parens-spacing
description: "vue-pug/attribute-parens-spacing (eslint-plugin-pug-vue): Pug 속성 블록 괄호 안의 공백을 일관되게 강제합니다. 옵션, 예시, fix."
---

# vue-pug/attribute-parens-spacing

Pug 속성 블록의 괄호 안쪽 공백을 일관되게 강제합니다.

✅ `configs.recommended`에서 켜져 있습니다(`warn`). 🔧 `--fix`로 고칠 수 있습니다.

Pug 템플릿에서 크래시를 일으켜 `configs.base`가 꺼 둔 `vue/html-closing-bracket-spacing`을 대체합니다.

## 규칙 상세 {#rule-details}

이 규칙은 같은 줄에서 `(` 바로 뒤와 `)` 바로 앞의 공백을 검사합니다.

- `never`(기본값): 그 자리에 공백이 없어야 합니다. fix는 공백을 제거합니다.
- `always`: 그 자리에 공백이 하나 이상 있어야 합니다. fix는 공백 하나를 삽입합니다.

공백에 줄바꿈이 들어 있는 쪽은 [`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md)의 영역이므로
그대로 두며, 비어 있거나 공백만 있는 블록도 마찬가지입니다.

### 잘못된 예 {#incorrect}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```

```vue
<template lang="pug">
input( type="text" name="q")
</template>
```

### 올바른 예 {#correct}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

## 옵션 {#options}

```js
'vue-pug/attribute-parens-spacing': ['warn', 'never']
```

`'never'`(기본값) 또는 `'always'`.

### `["always"]`일 때 잘못된 예 {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

### `["always"]`일 때 올바른 예 {#correct-with-always}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```
