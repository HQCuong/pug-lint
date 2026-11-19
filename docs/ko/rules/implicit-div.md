---
title: vue-pug/implicit-div
description: "vue-pug/implicit-div (eslint-plugin-pug-vue): class와 id 축약 표기 앞의 div 태그 이름을 강제하거나 금지합니다. 옵션, 예시, fix."
---

# vue-pug/implicit-div

class와 id 축약 표기 앞의 태그 이름 `div`를 강제하거나 금지합니다.

✅ `configs.recommended`에서 켜져 있습니다(`warn`). 🔧 `--fix`로 고칠 수 있습니다.

## 규칙 상세 {#rule-details}

Pug에서 `.class`나 `#id` 축약 표기로 시작하는 줄은 `div`입니다.

- `always`(기본값): 암시적 형태를 사용합니다. 명시적 `div` 뒤에 축약 표기가 오면 보고하고, fix는 이름을
  제거합니다.
- `never`: `div`를 씁니다. 축약 표기로 시작하는 태그를 보고하고, fix는 `div`를 삽입합니다.

축약 표기가 없는 `div`(`div`, `div(v-if="ok")`)는 절대 보고하지 않습니다. `always`일 때 두 경우는 fix 없이
보고합니다. tag interpolation 안의 `div`(`#[div.a x]`)와, 첫 축약 표기가 이름 바로 뒤에 오지 않는 `div`
(`div(a).b`)입니다. 이름을 지우면 줄이 `(`로 시작하게 되기 때문입니다.

### 잘못된 예 {#incorrect}

```vue
<template lang="pug">
div.card Content
</template>
```

```vue
<template lang="pug">
div#app.container
  p Hello
</template>
```

### 올바른 예 {#correct}

```vue
<template lang="pug">
.card Content
</template>
```

```vue
<template lang="pug">
#app.container
  div(v-if="ready") Hello
</template>
```

## 옵션 {#options}

```js
'vue-pug/implicit-div': ['warn', 'always']
```

`'always'`(기본값) 또는 `'never'`.

### `["never"]`일 때 잘못된 예 {#incorrect-with-never}

```vue
<template lang="pug">
.card Content
</template>
```

### `["never"]`일 때 올바른 예 {#correct-with-never}

```vue
<template lang="pug">
div.card Content
</template>
```
