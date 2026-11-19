---

description: "Pug テンプレートで動く eslint-plugin-vue の rule、クラッシュするため無効になっている rule、Pug テンプレートの中でだけ出力が抑えられる rule。"
---

# Pug 上の `vue/*` rule {#vue-rules-on-pug}

eslint-plugin-vue の rule のほとんどは、HTML と同じように Pug テンプレートでも動きます。残りは互換性ハーネスで測定されています。このハーネスは、すべての rule を Pug テンプレートとそれに相当する HTML で実行します。全結果は[互換性の表](./vue-compatibility)にあります。

## クラッシュする rule: どこでも無効 {#crashing-rules-off-everywhere}

Pug テンプレートで**クラッシュする** rule は、`configs.base` によって無効にされます。Pug の要素には書かれた終了タグがないため、その終了タグは幅ゼロになり、これらの rule による vue-eslint-parser のトークンストアの使い方が壊れます。

クラッシュは後から絞り込めず、config が選べるのはテンプレートではなくファイルだけです。そのため、これらは HTML テンプレートを含む**すべての** `.vue` ファイルで無効になります。HTML と Pug のテンプレートが混在するプロジェクトでは、これらの rule は HTML テンプレートもチェックしなくなります。Pug テンプレートは、対応する `vue-pug/*` rule がカバーします。

## 抑制される rule: Pug の中でだけ出力を抑える {#suppressed-rules-silenced-inside-pug-only}

Pug で**誤検知する** rule や、**fix が Pug を壊したり再整形したりする** rule は、無効にはされません。processor は、メッセージが Pug テンプレートの中にある場合にだけそれを破棄します。そのため、HTML テンプレートや `<script>` では引き続き動作します。それでも残したい場合は、[抑制された rule を残す](./configuration#keeping-a-suppressed-rule)を参照してください。

## 一覧 {#the-lists}

<!-- begin auto-generated vue rule lists -->

Turned off for every `.vue` file by `configs.base`, because they crash on Pug templates:

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

Suppressed inside Pug templates only (they keep working on HTML templates and in `<script>`):

- `vue/array-bracket-newline`
- `vue/array-element-newline`
- `vue/brace-style`
- `vue/first-attribute-linebreak` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-comment-content-newline`
- `vue/html-comment-content-spacing`
- `vue/html-end-tags` (Pug replacement: `vue-pug/self-closing`)
- `vue/html-quotes` (Pug replacement: `vue-pug/attribute-quotes`)
- `vue/html-self-closing` (Pug replacement: `vue-pug/self-closing`)
- `vue/max-attributes-per-line` (Pug replacement: `vue-pug/max-attributes-per-line`)
- `vue/multiline-html-element-content-newline`
- `vue/multiline-ternary`
- `vue/no-multi-spaces` (Pug replacement: `vue-pug/no-multi-spaces`)
- `vue/no-spaces-around-equal-signs-in-attribute` (Pug replacement: `vue-pug/attribute-equals-spacing`)
- `vue/no-unsupported-features`
- `vue/object-curly-newline`
- `vue/object-property-newline`
- `vue/padding-line-between-tags`
- `vue/singleline-html-element-content-newline`
- `vue/static-class-names-order`
- `vue/v-if-else-key`

<!-- end auto-generated vue rule lists -->
