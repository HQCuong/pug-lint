---
title: vue-pug/attribute-parens-newline
description: "vue-pug/attribute-parens-newline (eslint-plugin-pug-vue): 複数行の Pug 属性ブロックで、( の後と ) の前の改行を強制します。オプション、例、fix。"
---

# vue-pug/attribute-parens-newline

複数行の Pug 属性ブロックで、`(` の後と `)` の前の改行を強制します。

✅ `configs.recommended` で有効です（`warn`）。🔧 `--fix` で修正できます。

Pug テンプレートの中では、`vue/first-attribute-linebreak` と `vue/html-closing-bracket-newline` の代わりに動きます。

## Rule の詳細 {#rule-details}

属性ブロックは、2 つの属性が別々の行で始まるとき、複数行です。

- `multiline: 'always'`（デフォルト）: 複数行のブロックには、`(` のすぐ後と `)` のすぐ前に改行が必要です。fix は、テンプレート自身の改行コードとインデント単位で改行を挿入します（最初の属性はタグより 1 段深く、`)` はタグと同じ段です）。
- `multiline: 'never'`: 複数行のブロックに、それらの改行があってはいけません。

複数行でないブロック（属性が 1 つだけのブロックを含む）にも、それらの改行があってはいけません。括弧の隣にある同じ行のスペースは [`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md) の担当です。空のブロックはそのまま残されます。

### 正しくない例 {#incorrect}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```

```vue
<template lang="pug">
input(
  type="text"
)
</template>
```

### 正しい例 {#correct}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

```vue
<template lang="pug">
input(type="text" name="q")
</template>
```

## オプション {#options}

```js
'vue-pug/attribute-parens-newline': ['warn', { multiline: 'always' }]
```

`multiline`: `'always'`（デフォルト）または `'never'`。

### `[{ "multiline": "never" }]` での正しくない例 {#incorrect-with-multiline-never}

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

### `[{ "multiline": "never" }]` での正しい例 {#correct-with-multiline-never}

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```
