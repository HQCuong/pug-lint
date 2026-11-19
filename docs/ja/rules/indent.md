---
title: vue-pug/indent
description: "vue-pug/indent (eslint-plugin-pug-vue): Pug テンプレートのインデントを統一します。オプション、例、fix。"
---

# vue-pug/indent

Pug テンプレートのインデントを統一します。

✅ `configs.recommended` で有効です（`warn`）。🔧 `--fix` で修正できます。

`vue/html-indent` の代わりに動きます。この rule は Pug テンプレートでクラッシュするため、`configs.base` で無効になっています。

## Rule の詳細 {#rule-details}

この rule は、`<template lang="pug">` ブロックのすべての行の先頭の空白を検査します。

- タグ、テキスト、コード、制御構文の行は、ネストの 1 段につき 1 単位ずつインデントされます。
- 複数行の属性ブロックでは、属性の行はタグより 1 段深く、閉じる `)` で始まる行はタグと同じ段です。
- テキストブロック（`p.`、`pre.`、`script.`）、コメント、コードブロック、フィルターの 2 行目以降は、最初の行に対する相対的なオフセットを保ちます。そのため、ブロック自身のインデントは、ブロックが動いても保たれます。インデント文字が変わる（スペースからタブ、またはその逆）場合、最初の行より浅くインデントされた行はオフセットを保てないので、最初の行のインデントになります。タブとスペースの混在は Pug の構文エラーだからです。
- 文字列リテラルやテンプレートリテラルの中で始まる行は、再インデントされません。その行頭の空白は値の一部だからです。
- パーサーがエラーとして報告した領域の行は、読み飛ばされます。

Pug のインデントは構造です。兄弟や子を残して 1 行だけ動かすと、木構造が変わります。そのため、1 つのテンプレートのすべての報告は同じ fix を持ち、その fix が範囲全体を一度に再インデントします。残った報告が 1 つあれば、一度の実行ですべてを fix できます。

### 正しくない例 {#incorrect}

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

### 正しい例 {#correct}

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

## オプション {#options}

```js
'vue-pug/indent': ['warn', 2, { baseIndent: 0 }]
```

- 最初のオプション: インデント単位。スペースの数（デフォルトは `2`）または `'tab'`。
- `baseIndent`（デフォルトは `0`）: すべての行に加える単位の数。最上位のノードを `<template>` に対して相対的にインデントできます。

### `["tab"]` での正しくない例 {#incorrect-with-tab}

```vue
<template lang="pug">
div
  p Hello
</template>
```

### `["tab"]` での正しい例 {#correct-with-tab}

```vue
<template lang="pug">
div
	p Hello
</template>
```

### `[2, { "baseIndent": 1 }]` での正しい例 {#correct-with-2-baseindent-1}

```vue
<template lang="pug">
  div
    p Hello
</template>
```
