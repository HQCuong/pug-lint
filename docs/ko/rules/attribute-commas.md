---
title: vue-pug/attribute-commas
description: "vue-pug/attribute-commas (eslint-plugin-pug-vue): Pug 속성 블록에서 속성 사이의 쉼표를 요구하거나 금지합니다. 옵션, 예시, fix."
---

# vue-pug/attribute-commas

Pug 속성 블록에서 속성 사이의 쉼표를 요구하거나 금지합니다.

✅ `configs.recommended`에서 켜져 있습니다(`warn`). 🔧 `--fix`로 고칠 수 있습니다.

## 규칙 상세 {#rule-details}

Pug는 공백, 쉼표, 또는 둘 다로 구분된 속성을 받아들입니다. 이 규칙은 그 선택을 일관되게 만듭니다.

- `never`(기본값): 속성 블록의 모든 쉼표를 보고하고 제거합니다.
- `always`: 각 속성 쌍 사이에 쉼표가 정확히 하나. 빠진 쉼표는 앞 속성 바로 뒤에 삽입하고, 같은 간격의 여분의
  쉼표는 제거합니다.

어느 옵션이든 첫 속성 앞이나 마지막 속성 뒤의 쉼표는 보고합니다. 쉼표를 지우면 두 속성이 붙어 버리는 경우
(`a(x="1",y="2")`) fix는 그 자리에 공백 하나를 넣습니다. 이 규칙은 쉼표 문자만 건드립니다. `always`일 때 쉼표 앞의
공백(`x="1" , y="2"`)은 그대로 두며, v1에서는 이를 정규화하는 다른 규칙도 없습니다.

### 잘못된 예 {#incorrect}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text",
  name="q"
)
</template>
```

### 올바른 예 {#correct}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
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
'vue-pug/attribute-commas': ['warn', 'never']
```

`'never'`(기본값) 또는 `'always'`.

### `["always"]`일 때 잘못된 예 {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### `["always"]`일 때 올바른 예 {#correct-with-always}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```
