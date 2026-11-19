---
title: vue-pug/attribute-commas
description: "vue-pug/attribute-commas (eslint-plugin-pug-vue): Pug の属性ブロックで、属性の間のカンマを必須にする、または禁止します。オプション、例、fix。"
---

# vue-pug/attribute-commas

Pug の属性ブロックで、属性の間のカンマを必須にする、または禁止します。

✅ `configs.recommended` で有効です（`warn`）。🔧 `--fix` で修正できます。

## Rule の詳細 {#rule-details}

Pug は、属性をスペース、カンマ、またはその両方で区切ることを受け付けます。この rule は、その選択を統一します。

- `never`（デフォルト）: 属性ブロックの中のすべてのカンマが報告され、削除されます。
- `always`: 属性の各ペアの間にカンマがちょうど 1 つ。足りないカンマは、直前の属性の直後に挿入されます。同じ隙間にある余分なカンマは削除されます。

どちらのオプションでも、最初の属性の前や最後の属性の後にあるカンマは報告されます。カンマを削除すると 2 つの属性がくっついてしまう場合（`a(x="1",y="2")`）は、fix が代わりにスペースを 1 つ入れます。この rule が触るのはカンマの文字だけです。`always` では、カンマの前の空白（`x="1" , y="2"`）はそのまま残され、v1 ではほかのどの rule もそれを正規化しません。

### 正しくない例 {#incorrect}

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

### 正しい例 {#correct}

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

## オプション {#options}

```js
'vue-pug/attribute-commas': ['warn', 'never']
```

`'never'`（デフォルト）または `'always'`。

### `["always"]` での正しくない例 {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### `["always"]` での正しい例 {#correct-with-always}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```
