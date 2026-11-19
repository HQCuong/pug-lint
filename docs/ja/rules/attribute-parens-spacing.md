---
title: vue-pug/attribute-parens-spacing
description: "vue-pug/attribute-parens-spacing (eslint-plugin-pug-vue): Pug 属性ブロックの括弧の内側のスペースを統一します。オプション、例、fix。"
---

# vue-pug/attribute-parens-spacing

Pug 属性ブロックの括弧の内側のスペースを統一します。

✅ `configs.recommended` で有効です（`warn`）。🔧 `--fix` で修正できます。

`vue/html-closing-bracket-spacing` の代わりに動きます。この rule は Pug テンプレートでクラッシュするため、`configs.base` で無効になっています。

## Rule の詳細 {#rule-details}

この rule は、同じ行にある `(` の直後と `)` の直前の空白を検査します。

- `never`（デフォルト）: そこに空白があってはいけません。fix はそれを削除します。
- `always`: そこに少なくとも 1 つのスペースが必要です。fix はスペースを 1 つ挿入します。

空白に改行が含まれる側は [`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) の担当なのでそのまま残され、空のブロックや空白だけのブロックも同様です。

### 正しくない例 {#incorrect}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```

```vue
<template lang="pug">
input( type="text" name="q")
</template>
```

### 正しい例 {#correct}

```vue
<template lang="pug">
a(href="/") Home
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
'vue-pug/attribute-parens-spacing': ['warn', 'never']
```

`'never'`（デフォルト）または `'always'`。

### `["always"]` での正しくない例 {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/") Home
</template>
```

### `["always"]` での正しい例 {#correct-with-always}

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```
