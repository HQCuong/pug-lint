---
title: vue-pug/no-multi-spaces
description: "vue-pug/no-multi-spaces (eslint-plugin-pug-vue): Pug の属性ブロックで、属性の間の連続したスペースを禁止します。オプション、例、fix。"
---

# vue-pug/no-multi-spaces

Pug の属性ブロックで、属性の間の連続したスペースを禁止します。

✅ `configs.recommended` で有効です（`warn`）。🔧 `--fix` で修正できます。

Pug テンプレートの中では、`vue/no-multi-spaces` の代わりに動きます。

## Rule の詳細 {#rule-details}

同じブロックの 2 つの属性の間にある、同じ行の 2 つ以上のスペースまたはタブの連なりが報告され、fix はそれを 1 つのスペースに置き換えます。カンマは前の属性についたままなので、隙間の最後のカンマの後の空白だけが測定されます。

属性の値、括弧の隣の空白（[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md) を参照）、タグの後のテキストには、一切触れません。

### 正しくない例 {#incorrect}

```vue
<template lang="pug">
a(href="/"   target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(type="text",   name="q")
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
p(title="a   b")   spaced   text
</template>
```

## オプション {#options}

なし。
