---
title: vue-pug/implicit-div
description: "vue-pug/implicit-div (eslint-plugin-pug-vue): クラスと id の省略記法の前にあるタグ名 div を必須にする、または禁止します。オプション、例、fix。"
---

# vue-pug/implicit-div

クラスと id の省略記法の前にあるタグ名 `div` を必須にする、または禁止します。

✅ `configs.recommended` で有効です（`warn`）。🔧 `--fix` で修正できます。

## Rule の詳細 {#rule-details}

Pug では、`.class` や `#id` の省略記法で始まる行は `div` です。

- `always`（デフォルト）: 暗黙の形を使います。省略記法の前に明示的な `div` があると報告され、fix は名前を削除します。
- `never`: `div` を書きます。省略記法で始まるタグが報告され、fix は `div` を挿入します。

省略記法のない `div`（`div`、`div(v-if="ok")`）は報告されません。`always` では、次の 2 つのケースが fix なしで報告されます。タグ補間の中の `div`（`#[div.a x]`）と、最初の省略記法が名前の直後に続かない `div`（`div(a).b`）です。名前を削除すると、行が `(` で始まってしまうためです。

### 正しくない例 {#incorrect}

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

### 正しい例 {#correct}

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

## オプション {#options}

```js
'vue-pug/implicit-div': ['warn', 'always']
```

`'always'`（デフォルト）または `'never'`。

### `["never"]` での正しくない例 {#incorrect-with-never}

```vue
<template lang="pug">
.card Content
</template>
```

### `["never"]` での正しい例 {#correct-with-never}

```vue
<template lang="pug">
div.card Content
</template>
```
