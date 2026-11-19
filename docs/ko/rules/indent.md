---
title: vue-pug/indent
description: "vue-pug/indent (eslint-plugin-pug-vue): Pug 템플릿에서 일관된 들여쓰기를 강제합니다. 옵션, 예시, fix."
---

# vue-pug/indent

Pug 템플릿에서 일관된 들여쓰기를 강제합니다.

✅ `configs.recommended`에서 켜져 있습니다(`warn`). 🔧 `--fix`로 고칠 수 있습니다.

Pug 템플릿에서 크래시를 일으켜 `configs.base`가 꺼 둔 `vue/html-indent`를 대체합니다.

## 규칙 상세 {#rule-details}

이 규칙은 `<template lang="pug">` 블록의 모든 줄의 앞쪽 공백을 검사합니다.

- 태그, 텍스트, code, control 줄은 중첩 한 단계마다 한 단위씩 들여씁니다.
- 여러 줄 속성 블록에서 속성 줄은 태그보다 한 단계 깊고, 닫는 `)`로 시작하는 줄은 태그와 같은 수준입니다.
- 텍스트 블록(`p.`, `pre.`, `script.`), 주석, code 블록, filter에서 첫 줄 이후의 줄은 첫 줄에 대한 상대적 오프셋을
  유지하므로, 블록이 이동해도 블록 자체의 들여쓰기가 보존됩니다. 들여쓰기 문자가 바뀌면(공백에서 탭으로, 또는 그 반대)
  첫 줄보다 덜 들여쓴 줄은 오프셋을 유지할 수 없으므로 첫 줄의 들여쓰기를 받습니다. 탭과 공백을 섞는 것은 Pug 구문
  에러이기 때문입니다.
- 문자열이나 템플릿 리터럴 안에서 시작하는 줄은 다시 들여쓰지 않습니다. 그 줄의 앞쪽 공백은 값의 일부입니다.
- 파서가 에러로 보고하는 영역의 줄은 건너뜁니다.

Pug의 들여쓰기는 구조입니다. 형제와 자식 없이 한 줄만 옮기면 트리가 바뀝니다. 그래서 한 템플릿의 모든 보고는
같은 fix를 가지며, 이 fix는 전체 범위를 한 번에 다시 들여씁니다. 남은 보고가 하나만 있어도 한 번에 전부 고칠 수
있습니다.

### 잘못된 예 {#incorrect}

```vue
<template lang="pug">
div
   p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
      v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

### 올바른 예 {#correct}

```vue
<template lang="pug">
div
  p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
    v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

```vue
<template lang="pug">
div
  pre.
    first line
      keeps its extra indentation
  p(title=`a
      b`)
</template>
```

## 옵션 {#options}

```js
'vue-pug/indent': ['warn', 2, { baseIndent: 0 }]
```

- 첫 번째 옵션: 들여쓰기 단위. 공백의 개수(기본값 `2`) 또는 `'tab'`.
- `baseIndent`(기본값 `0`): 모든 줄에 더해지는 단위 수로, 최상위 노드를 `<template>`에 대해 상대적으로 들여쓸 수
  있습니다.

### `["tab"]`일 때 잘못된 예 {#incorrect-with-tab}

```vue
<template lang="pug">
div
  p Hello
</template>
```

### `["tab"]`일 때 올바른 예 {#correct-with-tab}

```vue
<template lang="pug">
div
	p Hello
</template>
```

### `[2, { "baseIndent": 1 }]`일 때 올바른 예 {#correct-with-2-baseindent-1}

```vue
<template lang="pug">
  div
    p Hello
</template>
```
