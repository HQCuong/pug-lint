---
title: vue-pug/attribute-equals-spacing
description: "vue-pug/attribute-equals-spacing (eslint-plugin-pug-vue): Pug 속성의 =와 != 주변 공백을 금지합니다. 옵션, 예시, fix."
---

# vue-pug/attribute-equals-spacing

Pug 속성의 `=`와 `!=` 주변 공백을 금지합니다.

✅ `configs.recommended`에서 켜져 있습니다(`warn`). 🔧 `--fix`로 고칠 수 있습니다.

Pug 템플릿 안에서 `vue/no-spaces-around-equal-signs-in-attribute`를 대체합니다.

## 규칙 상세 {#rule-details}

속성 이름과 `=` / `!=` 사이, 그리고 연산자와 값 사이의 공백은 비어 있어야 합니다. fix는 이 공백을 제거합니다.
줄바꿈이 들어 있는 간격은 그대로 둡니다.

### 잘못된 예 {#incorrect}

```vue
<template lang="pug">
a(href = "/") Home
</template>
```

```vue
<template lang="pug">
input(:value= "query" @input ="update")
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
div(v-html!="html" :title="title")
</template>
```

## 옵션 {#options}

없음.
