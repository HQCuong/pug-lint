---
title: vue-pug/prefer-shorthand
description: "vue-pug/prefer-shorthand (eslint-plugin-pug-vue): 정적 class와 id 속성에 .class / #id 축약 표기를 강제하거나 금지합니다. 옵션, 예시, fix."
---

# vue-pug/prefer-shorthand

정적 class와 id 속성에 `.class` / `#id` 축약 표기를 강제하거나 금지합니다.

✅ `configs.recommended`에서 켜져 있습니다(`warn`). 🔧 `--fix`로 고칠 수 있습니다.

## 규칙 상세 {#rule-details}

class와 id는 각각 별도로 `always`, `never`, `ignore` 중에서 설정합니다.

- `always`(둘 다 기본값): 정적 `class` 또는 `id` 속성이 축약 표기가 됩니다. `p(class="a b")` → `p.a.b`,
  `p(id="x")` → `p#x`. 새 축약 표기는 기존 것 뒤에 붙고, 비게 된 속성 블록은 제거합니다.
- `never`: 축약 표기를 속성 하나로 바꿉니다. class는 기존 정적 `class` 속성에 합쳐지고, 그렇지 않으면 새 속성을 첫
  번째 속성 블록(또는 새 블록)의 맨 앞에 삽입하며, 따옴표는 그 블록의 첫 문자열 값의 스타일을 따릅니다(없으면
  `"`). 이름도 축약 표기도 남지 않은 태그에는 `div`가 붙습니다.
- `ignore`: 그 종류는 검사하지 않습니다.

정적 속성만 변환합니다. 이름이 정확히 `class` 또는 `id`이고, 값이 평범한 `'…'` 또는 `"…"` 문자열 하나이며,
공백으로 구분된 모든 토큰이 유효한 Pug 축약 표기 이름이어야 합니다. 토큰 하나라도 그렇지 않으면
(`md:flex`, `w-1/2`, `-1`, `1a`) 값 전체를 그대로 둡니다. `id` 값은 토큰 하나여야 합니다. 바인딩된 속성
(`:class`, `v-bind:id`)은 절대 건드리지 않습니다. id 축약 표기와 `id` 속성을 모두 가진 태그(Pug에서는 에러)는 id를
쓰인 그대로 유지합니다.

한 태그의 모든 변환은 태그의 첫 보고에 붙은 fix 하나로 적용됩니다.

### 잘못된 예 {#incorrect}

```vue
<template lang="pug">
p(class="lead") Text
</template>
```

```vue
<template lang="pug">
section(id="intro" class="hero dark")
</template>
```

### 올바른 예 {#correct}

```vue
<template lang="pug">
p.lead Text
</template>
```

```vue
<template lang="pug">
section#intro.hero.dark(class="md:flex w-1/2" :class="{ active }")
</template>
```

## 옵션 {#options}

```js
'vue-pug/prefer-shorthand': ['warn', { class: 'always', id: 'always' }]
```

`class`와 `id`: `'always'`(기본값), `'never'`, `'ignore'`.

### `[{ "class": "never", "id": "always" }]`일 때 잘못된 예 {#incorrect-with-class-never-id-always}

```vue
<template lang="pug">
p.lead Text
</template>
```

### `[{ "class": "never", "id": "always" }]`일 때 올바른 예 {#correct-with-class-never-id-always}

```vue
<template lang="pug">
p#intro(class="lead") Text
</template>
```
