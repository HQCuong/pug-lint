---
title: vue-pug/attribute-quotes
description: "vue-pug/attribute-quotes (eslint-plugin-pug-vue): Pug 속성 값에 일관된 따옴표 스타일을 강제합니다. 옵션, 예시, fix."
---

# vue-pug/attribute-quotes

Pug 속성 값에 일관된 따옴표 스타일을 강제합니다.

✅ `configs.recommended`에서 켜져 있습니다(`warn`). 🔧 `--fix`로 고칠 수 있습니다.

Pug 템플릿 안에서 `vue/html-quotes`를 대체합니다. 그 규칙의 fixer는 안쪽 따옴표를 `&quot;`로 이스케이프하는데,
속성 값이 JavaScript 표현식인 Pug에서는 잘못된 방식이며, 백틱도 유효한 Pug 따옴표라는 사실을 알지 못합니다.

## 규칙 상세 {#rule-details}

`'…'` 또는 `"…"` 문자열 하나로 이루어진 값이 다른 따옴표 스타일이면 보고합니다. fix는 두 따옴표 문자를 서로
바꾸기만 하고 아무것도 다시 이스케이프하지 않습니다. 값에 대상 따옴표나 백슬래시가 들어 있으면 fix 없이
보고합니다.

백틱 값은 기본적으로 그대로 둡니다. `backticks: 'convert'`일 때는 백틱 값이 한 줄이고 `${}`, 따옴표, 백슬래시가
없을 때만 보고하고 fix합니다. 다른 백틱 값은 그대로 둡니다. 리터럴 하나가 아닌 값(`x`, `a + 'b'`, `{ a: 1 }`)은
절대 건드리지 않습니다.

### 잘못된 예 {#incorrect}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

```vue
<template lang="pug">
p(title='Say "hi"') Hello
</template>
```

두 번째 예시는 fix 없이 보고됩니다. 따옴표를 바꾸려면 이스케이프가 필요하기 때문입니다.

### 올바른 예 {#correct}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

```vue
<template lang="pug">
p(:class=`card` :title="'Hi ' + name" :data-id=id) Hello
</template>
```

## 옵션 {#options}

```js
'vue-pug/attribute-quotes': ['warn', 'double', { backticks: 'keep' }]
```

- 첫 번째 옵션: `'double'`(기본값) 또는 `'single'`.
- `backticks`: `'keep'`(기본값) 또는 `'convert'`.

### `["single"]`일 때 잘못된 예 {#incorrect-with-single}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

### `["single"]`일 때 올바른 예 {#correct-with-single}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

### `["double", { "backticks": "convert" }]`일 때 잘못된 예 {#incorrect-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello`) Hi
</template>
```

### `["double", { "backticks": "convert" }]`일 때 올바른 예 {#correct-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello ${name}`) Hi
</template>
```
