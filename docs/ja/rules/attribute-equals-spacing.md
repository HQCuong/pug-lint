---
title: vue-pug/attribute-equals-spacing
description: "vue-pug/attribute-equals-spacing (eslint-plugin-pug-vue): Pug の属性の = と != の前後のスペースを禁止します。オプション、例、fix。"
---

# vue-pug/attribute-equals-spacing

Pug の属性の `=` と `!=` の前後のスペースを禁止します。

✅ `configs.recommended` で有効です（`warn`）。🔧 `--fix` で修正できます。

Pug テンプレートの中では、`vue/no-spaces-around-equal-signs-in-attribute` の代わりに動きます。

## Rule の詳細 {#rule-details}

属性名とその `=` / `!=` の間、および演算子と値の間の空白は、空でなければなりません。fix はそれを削除します。改行を含む隙間は、そのまま残されます。

### 正しくない例 {#incorrect}

```vue
<template lang="pug">
a(href = "/") Home
</template>
```

```vue
<template lang="pug">
input(:value= "query" @input ="update")
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
div(v-html!="html" :title="title")
</template>
```

## オプション {#options}

なし。
