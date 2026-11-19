---
title: vue-pug/prefer-shorthand
description: "vue-pug/prefer-shorthand (eslint-plugin-pug-vue): 静的な class と id の属性に、.class / #id の省略記法を強制する、または禁止します。オプション、例、fix。"
---

# vue-pug/prefer-shorthand

静的な class と id の属性に、`.class` / `#id` の省略記法を強制する、または禁止します。

✅ `configs.recommended` で有効です（`warn`）。🔧 `--fix` で修正できます。

## Rule の詳細 {#rule-details}

class と id は別々に設定し、それぞれ `always`、`never`、`ignore` のいずれかを指定します。

- `always`（両方のデフォルト）: 静的な `class` または `id` の属性が省略記法になります。`p(class="a b")` → `p.a.b`、`p(id="x")` → `p#x`。新しい省略記法は既存のものの後ろに置かれ、空になった属性ブロックは削除されます。
- `never`: 省略記法が 1 つの属性になります。クラスは既存の静的な `class` 属性に結合されます。なければ、新しい属性が最初の属性ブロックの先頭（または新しいブロック）に挿入され、そのブロックの最初の文字列値のクォートスタイルが使われます（なければ `"`）。名前も省略記法もなくなったタグには `div` が付きます。
- `ignore`: その種類は検査されません。

変換されるのは静的な属性だけです。名前がちょうど `class` または `id` で、値が 1 つのプレーンな `'…'` または `"…"` の文字列で、その中の空白で区切られたすべてのトークンが有効な Pug の省略記法の名前である場合です。1 つでもそうでないトークン（`md:flex`、`w-1/2`、`-1`、`1a`）があれば、値全体がそのまま残されます。`id` の値は単一のトークンでなければなりません。バインドされた属性（`:class`、`v-bind:id`）には一切触れません。id の省略記法と `id` 属性の両方を持つタグ（Pug ではエラー）は、id が書かれたままに保たれます。

1 つのタグのすべての変換は、そのタグの最初の報告に付いた 1 つの fix でまとめて適用されます。

### 正しくない例 {#incorrect}

```vue
<template lang="pug">
p(class="lead") Text
</template>
```

```vue
<template lang="pug">
section(id="intro" class="hero dark")
</template>
```

### 正しい例 {#correct}

```vue
<template lang="pug">
p.lead Text
</template>
```

```vue
<template lang="pug">
section#intro.hero.dark(class="md:flex w-1/2" :class="{ active }")
</template>
```

## オプション {#options}

```js
'vue-pug/prefer-shorthand': ['warn', { class: 'always', id: 'always' }]
```

`class` と `id`: `'always'`（デフォルト）、`'never'`、`'ignore'`。

### `[{ "class": "never", "id": "always" }]` での正しくない例 {#incorrect-with-class-never-id-always}

```vue
<template lang="pug">
p.lead Text
</template>
```

### `[{ "class": "never", "id": "always" }]` での正しい例 {#correct-with-class-never-id-always}

```vue
<template lang="pug">
p#intro(class="lead") Text
</template>
```
