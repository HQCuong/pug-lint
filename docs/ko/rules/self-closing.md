---
title: vue-pug/self-closing
description: "vue-pug/self-closing (eslint-plugin-pug-vue): 태그의 self-closing / 를 강제하거나 금지합니다. 옵션, 예시, fix."
---

# vue-pug/self-closing

태그의 self-closing `/`를 강제하거나 금지합니다.

✅ `configs.recommended`에서 켜져 있습니다(`warn`). 🔧 `--fix`로 고칠 수 있습니다.

Pug 템플릿 안에서 `vue/html-self-closing`과 `vue/html-end-tags`를 대체합니다.

## 규칙 상세 {#rule-details}

- `never`(기본값): 태그 뒤의 모든 `/`(`img/`, `MyIcon/`)를 보고합니다.
- `always-components`: 내용이 없는 컴포넌트(대문자나 하이픈이 들어 있는 태그 이름)는 `/`로 끝나야 하며, fix가 `/`를
  추가합니다. 그 밖의 태그에는 `/`가 없어야 합니다. 이미 `/`가 있는 컴포넌트는 그대로 둡니다.

Pug는 `p/ text`를 `<p/>`와 그 뒤의 텍스트로 렌더링하고, 중첩된 줄이 있는 태그의 `/`는 거부합니다. 그래서 fix는
`/` 뒤에 같은 줄에서 아무것도 없고(공백조차 없음) 태그에 중첩된 줄이 없거나 unbuffered 주석(`//-`)뿐일 때만
`/`를 제거합니다. 그렇지 않으면 `/`를 fix 없이 보고합니다. 내용이 있는 태그(텍스트, code, `.`, 중첩된 줄,
심지어 뒤따르는 공백까지)에는 `/`를 절대 추가하지 않습니다.

### 잘못된 예 {#incorrect}

```vue
<template lang="pug">
img(src="logo.png")/
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")/
</template>
```

### 올바른 예 {#correct}

```vue
<template lang="pug">
img(src="logo.png")
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")
  br
</template>
```

## 옵션 {#options}

```js
'vue-pug/self-closing': ['warn', 'never']
```

`'never'`(기본값) 또는 `'always-components'`.

### `["always-components"]`일 때 잘못된 예 {#incorrect-with-always-components}

```vue
<template lang="pug">
MyIcon(name="star")
</template>
```

### `["always-components"]`일 때 올바른 예 {#correct-with-always-components}

```vue
<template lang="pug">
div
  MyIcon(name="star")/
  my-icon/
  MyButton Save
  img(src="logo.png")
</template>
```
