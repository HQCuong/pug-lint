---
title: vue-pug/attribute-quotes
description: "vue-pug/attribute-quotes (eslint-plugin-pug-vue): Pug の属性値のクォートのスタイルを統一します。オプション、例、fix。"
---

# vue-pug/attribute-quotes

Pug の属性値のクォートのスタイルを統一します。

✅ `configs.recommended` で有効です（`warn`）。🔧 `--fix` で修正できます。

Pug テンプレートの中では、`vue/html-quotes` の代わりに動きます。その rule の fixer は内側のクォートを `&quot;` にエスケープしますが、Pug（属性値は JavaScript の式です）では誤りです。また、バッククォートが Pug で有効なクォートであることも知りません。

## Rule の詳細 {#rule-details}

単一の `'…'` または `"…"` の文字列で、もう一方のクォートスタイルで書かれた値が報告されます。fix は 2 つのクォート文字を入れ替えるだけで、再エスケープはしません。値に対象のクォートまたはバックスラッシュが含まれる場合は、fix なしで報告されます。

バッククォートの値は、デフォルトではそのまま残されます。`backticks: 'convert'` では、バッククォートの値は、1 行で、`${}`、クォート、バックスラッシュのいずれも含まない場合にだけ報告され、fix されます。それ以外のバッククォートの値はそのまま残されます。単一のリテラルでない値（`x`、`a + 'b'`、`{ a: 1 }`）には一切触れません。

### 正しくない例 {#incorrect}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

```vue
<template lang="pug">
p(title='Say "hi"') Hello
</template>
```

2 つ目の例は fix なしで報告されます。クォートを入れ替えるとエスケープが必要になるためです。

### 正しい例 {#correct}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

```vue
<template lang="pug">
p(:class=`card` :title="'Hi ' + name" :data-id=id) Hello
</template>
```

## オプション {#options}

```js
'vue-pug/attribute-quotes': ['warn', 'double', { backticks: 'keep' }]
```

- 最初のオプション: `'double'`（デフォルト）または `'single'`。
- `backticks`: `'keep'`（デフォルト）または `'convert'`。

### `["single"]` での正しくない例 {#incorrect-with-single}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

### `["single"]` での正しい例 {#correct-with-single}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

### `["double", { "backticks": "convert" }]` での正しくない例 {#incorrect-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello`) Hi
</template>
```

### `["double", { "backticks": "convert" }]` での正しい例 {#correct-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello ${name}`) Hi
</template>
```
