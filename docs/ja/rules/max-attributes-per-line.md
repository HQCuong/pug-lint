---
title: vue-pug/max-attributes-per-line
description: "vue-pug/max-attributes-per-line (eslint-plugin-pug-vue): Pug の属性ブロックで、1 行あたりの属性の最大数を強制します。オプション、例、fix。"
---

# vue-pug/max-attributes-per-line

Pug の属性ブロックで、1 行あたりの属性の最大数を強制します。

✅ `configs.recommended` で有効です（`warn`）。🔧 `--fix` で修正できます。

Pug テンプレートの中では、`vue/max-attributes-per-line` の代わりに動きます。

## Rule の詳細 {#rule-details}

属性は属性ブロックごとに数えます。`a(w x)(y z)` は、2 つの属性を持つブロックが 2 つです。

- 1 行のブロックは、最大 `singleline` 個（デフォルトは `3`）の属性を持てます。それを超えると、最初以外のすべての属性が報告されます。
- 改行を含むブロックは、値の中の改行であっても複数行です。その各行は最大 `multiline` 個（デフォルトは `1`）の属性を持て、超えた分が報告されます。

fix は、報告された属性の前の空白を、タグより 1 段深くインデントした改行に置き換えます（カンマは前の属性についたままです）。`(` の後と `)` の前の改行は [`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) に任されています。タグ補間の中のタグ（`#[a(x y z w)]`）は、テキスト行の一部なので検査されません。

### 正しくない例 {#incorrect}

```vue
<template lang="pug">
input(type="text" name="q" placeholder="Search" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text" name="q"
  required
)
</template>
```

### 正しい例 {#correct}

```vue
<template lang="pug">
input(type="text" name="q" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
  placeholder="Search"
  required
)
</template>
```

## オプション {#options}

```js
'vue-pug/max-attributes-per-line': ['warn', { singleline: 3, multiline: 1 }]
```

- `singleline`（1 以上の整数、デフォルトは `3`）: 1 行のブロックの最大数。
- `multiline`（1 以上の整数、デフォルトは `1`）: 複数行のブロックの 1 行あたりの最大数。

### `[{ "singleline": 1 }]` での正しくない例 {#incorrect-with-singleline-1}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### `[{ "singleline": 1 }]` での正しい例 {#correct-with-singleline-1}

```vue
<template lang="pug">
a(href="/") Home
</template>
```
