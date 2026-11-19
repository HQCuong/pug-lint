---
title: vue-pug/no-multi-spaces
description: "vue-pug/no-multi-spaces (eslint-plugin-pug-vue): Pug 속성 블록에서 속성 사이의 연속된 공백을 금지합니다. 옵션, 예시, fix."
---

# vue-pug/no-multi-spaces

Pug 속성 블록에서 속성 사이의 연속된 공백을 금지합니다.

✅ `configs.recommended`에서 켜져 있습니다(`warn`). 🔧 `--fix`로 고칠 수 있습니다.

Pug 템플릿 안에서 `vue/no-multi-spaces`를 대체합니다.

## 규칙 상세 {#rule-details}

같은 블록의 두 속성 사이에서 한 줄에 공백이나 탭이 둘 이상 이어지면 보고하며, fix는 이를 공백 하나로 바꿉니다.
쉼표는 앞 속성에 붙어 있으므로, 간격에서 마지막 쉼표 뒤의 공백만 측정합니다.

속성 값, 괄호 옆의 공백([`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md) 참고), 태그 뒤의
텍스트는 절대 건드리지 않습니다.

### 잘못된 예 {#incorrect}

```vue
<template lang="pug">
a(href="/"   target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(type="text",   name="q")
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
p(title="a   b")   spaced   text
</template>
```

## 옵션 {#options}

없음.
