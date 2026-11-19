---

description: "eslint-plugin-pug-vue が Vue の Pug を lint する仕組み。vue-eslint-parser 用の Pug トークナイザー、vue/* と vue-pug/* の rule、すべての fix を検証する fix ガードを説明します。"
---

# 仕組み

ESLint は単体では Pug を読めず、eslint-plugin-vue が知っているのは HTML テンプレートだけです。このプラグインは両者をつなぎ、ESLint が書き込む前にすべての fix を検証します。

<HowItWorks />

## 1. パース {#_1-parse}

[vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser) は、eslint-plugin-vue のために `.vue` ファイルをパースします。別の言語で書かれたテンプレートに出会うと、その言語を HTML から得られるのと同じトークンに変換する*トークナイザー*を呼び出します。このプラグインは `lang="pug"` と `lang="jade"` 用のトークナイザーを登録します。

トークナイザーは [`pug-lint-parser`](/ja/parser/) でテンプレートをパースし、Pug の要素ごとに開始タグ、終了タグ、テキスト、`{{ }}` のトークンを、Pug ソース上の正確な位置で出力します。vue-eslint-parser はそこからいつもどおりのテンプレート AST を組み立てるので、`vue/*` rule は Pug の正しい行と列を指します。

Pug の構文エラーはパースエラーになり、`vue/no-parsing-error` が報告します。

## 2. Lint {#_2-lint}

同じファイルに対して、2 種類の rule が動きます。

- eslint-plugin-vue の **`vue/*` rule** は、HTML テンプレートの場合と同じように Vue のテンプレート AST を読みます。key の欠落、未使用の変数、属性の順序、非推奨の構文などです。
- **`vue-pug/*` rule** は、`pug-lint-parser` が作る Pug の構文木を直接読みます。この木には、Vue AST が失うインデント、カンマ、クォート、括弧、`.class` や `#id` の省略記法が残っています。整形系の rule はここで働きます。

## 3. 検証 {#_3-check}

プラグインは eslint-plugin-vue の processor をラップします。processor は、ESLint が使う前にすべてのメッセージを見ることができます。

- **抑制。** 一部の `vue/*` rule は Pug では動作しません。誤った問題を報告したり、fix が Pug テンプレートに HTML を書き込んだりするためです。そのメッセージは Pug テンプレートの中にあるときだけ破棄されるので、HTML テンプレートのチェックは続きます。Pug でクラッシュするごく一部の rule は、代わりに無効にされます。[一覧はこちら](./vue-rules)。
- **fix ガード。** Pug テンプレートに触れるすべての fix は、ファイルのコピーに適用され、`pug-lint-parser` が再度パースします。プラグインは前後の構造を比較します。タグとそのネスト、クラスと id、属性の数、テキストの形、すべての JavaScript の式です。何かが変わった場合や、コピーがパースできなくなった場合は、fix は破棄され、警告は残ります。[詳細](./fix-guard)。

そのあと ESLint は、残った fix を `eslint --fix` またはエディターの保存時 fix で適用します。

## 2 つのパッケージ {#the-two-packages}

| パッケージ | 役割 |
|---|---|
| [`eslint-plugin-pug-vue`](https://www.npmjs.com/package/eslint-plugin-pug-vue) | ESLint プラグイン本体です。トークナイザー、`vue-pug/*` rule、processor、config を含みます。インストールするのはこちらです。 |
| [`pug-lint-parser`](/ja/parser/) | 上記すべての土台になる Pug パーサーです。ESLint も Vue も知らないので、単独でも使えます。 |
