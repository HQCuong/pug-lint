---
title: vue-pug/self-closing
description: "vue-pug/self-closing (eslint-plugin-pug-vue): タグの自己終了の / を強制する、または禁止します。オプション、例、fix。"
---

# vue-pug/self-closing

タグの自己終了の `/` を強制する、または禁止します。

✅ `configs.recommended` で有効です（`warn`）。🔧 `--fix` で修正できます。

Pug テンプレートの中では、`vue/html-self-closing` と `vue/html-end-tags` の代わりに動きます。

## Rule の詳細 {#rule-details}

- `never`（デフォルト）: タグの後のすべての `/`（`img/`、`MyIcon/`）が報告されます。
- `always-components`: 中身のないコンポーネント（大文字またはハイフンを含むタグ名）は `/` で終わる必要があり、fix がそれを追加します。それ以外のタグには `/` があってはいけません。すでに `/` があるコンポーネントはそのまま残されます。

Pug は `p/ text` を `<p/>` とそれに続くテキストとして描画し、ネストされた行を持つタグの `/` を拒否します。そのため fix が `/` を削除するのは、その行で `/` の後ろに何もなく（スペースも含みます）、かつそのタグがバッファなしコメント（`//-`）以外のネストされた行を持たない場合だけです。それ以外では、`/` は fix なしで報告されます。何らかの中身（テキスト、コード、`.`、ネストされた行、末尾のスペースでさえも）を持つタグに `/` が追加されることはありません。

### 正しくない例 {#incorrect}

```vue
<template lang="pug">
img(src="logo.png")/
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")/
</template>
```

### 正しい例 {#correct}

```vue
<template lang="pug">
img(src="logo.png")
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")
  br
</template>
```

## オプション {#options}

```js
'vue-pug/self-closing': ['warn', 'never']
```

`'never'`（デフォルト）または `'always-components'`。

### `["always-components"]` での正しくない例 {#incorrect-with-always-components}

```vue
<template lang="pug">
MyIcon(name="star")
</template>
```

### `["always-components"]` での正しい例 {#correct-with-always-components}

```vue
<template lang="pug">
div
  MyIcon(name="star")/
  my-icon/
  MyButton Save
  img(src="logo.png")
</template>
```
