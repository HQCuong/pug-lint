---
title: vue-pug/no-pug-control-flow
description: "vue-pug/no-pug-control-flow (eslint-plugin-pug-vue): Pug のコンパイル時構文（制御構文、コード、mixin、#{} 補間、include）を禁止します。オプションと例。"
---

# vue-pug/no-pug-control-flow

Pug のコンパイル時構文（制御構文、コード、mixin、`#{}` 補間、include）を禁止します。

`configs.recommended` では有効ではありません。fix はできません。

## Rule の詳細 {#rule-details}

Pug の条件分岐、ループ、コード、mixin、`#{}` 補間は、テンプレートのコンパイル時に一度だけ実行されます。Vue はそれらを見ないのでリアクティブではなく、`vue/*` rule も Pug のロジックそのものは見ません。この rule はそれらを報告して、テンプレートが代わりに Vue のディレクティブとバインディングを使うようにします。各構文はいずれか 1 つのカテゴリに属します。

| カテゴリ | 報告するもの |
|---|---|
| `control` | `if`、`else if`、`else`、`unless`、`each`、`for`、`while`、`case`、`when`、`default` |
| `code` | `- code`、`= expression`、`!= expression`、`p= expression` |
| `mixin` | mixin の定義（`mixin name`）と呼び出し（`+name`） |
| `interpolation` | テキスト中の `#{…}` と `!{…}` |
| `include` | `include`、`extends`、`block`、`append`、`prepend`、`yield`、`doctype` |

### 正しくない例 {#incorrect}

```vue
<template lang="pug">
ul
  each item in items
    li= item
</template>
```

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### 正しい例 {#correct}

```vue
<template lang="pug">
ul
  li(v-for="item in items" :key="item") {{ item }}
</template>
```

```vue
<template lang="pug">
p(v-if="name") Hello {{ name }}
</template>
```

## オプション {#options}

```js
'vue-pug/no-pug-control-flow': ['warn', { allow: [] }]
```

`allow`: 報告しないカテゴリ。`'control'`、`'code'`、`'mixin'`、`'interpolation'`、`'include'` のいずれか（デフォルトは `[]`）。

### `[{ "allow": ["interpolation"] }]` での正しい例 {#correct-with-allow-interpolation}

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### `[{ "allow": ["interpolation"] }]` での正しくない例 {#incorrect-with-allow-interpolation}

```vue
<template lang="pug">
p= name
</template>
```

## `eslint-plugin-vue-pug` からの移行 {#migrating-from-eslint-plugin-vue-pug}

`eslint-plugin-vue-pug` には、同じ id の rule `vue-pug/no-pug-control-flow` があります。違いは次のとおりです。

- そちらのスキーマは空です。オプションを取らず、知っているすべての構文を常に報告します。この rule は `{ allow: [...] }` を取ります（上記を参照）。古い rule に渡したオプションは ESLint に拒否されていたので、オプションなしの既存の設定はそのまま動き続けます。
- 古い rule は、その `strongly-recommended` の config で（`warn` で）有効でした。この rule はどの config にも含まれないので、自分で有効にしてください。
