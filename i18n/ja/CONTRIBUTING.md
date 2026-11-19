<sub>[English](../../CONTRIBUTING.md) | [Tiếng Việt](../vi/CONTRIBUTING.md) | [한국어](../ko/CONTRIBUTING.md) | [简体中文](../zh/CONTRIBUTING.md) | **日本語** | [Deutsch](../de/CONTRIBUTING.md) | [Français](../fr/CONTRIBUTING.md) | [Español](../es/CONTRIBUTING.md) | [हिन्दी](../hi/CONTRIBUTING.md) | [Português (Brasil)](../pt/CONTRIBUTING.md) | [Русский](../ru/CONTRIBUTING.md)</sub>

# コントリビューションガイド

> この翻訳は英語版より更新が遅れている場合があります。内容に相違がある場合は、[英語版](../../CONTRIBUTING.md)が正式なものです。

ご協力ありがとうございます。バグ報告、ドキュメントの修正、プルリクエストのいずれも歓迎します。

参加するすべての方に、[行動規範](../ja/CODE_OF_CONDUCT.md)に従っていただくようお願いします。

## はじめる前に

- **バグや小さな修正ですか？** 直接プルリクエストを開いてください。バグかどうか確信がなければ issue でもかまいません。バグ報告では、問題を再現する最小の `.vue` ファイルと、あなたの `eslint.config.js` があると最も役に立ちます。
- **新しい rule、新しいオプション、デフォルトの変更ですか？** コードを書く前に、まず issue を開いて、方針に合意しましょう。

## セットアップ

[`.nvmrc`](../../.nvmrc) にある Node のバージョンを使ってください（`nvm use`）。このリポジトリは [pnpm](https://pnpm.io) のワークスペースです。`corepack enable` で、`package.json` に固定された pnpm のバージョンが使えます。

```sh
pnpm install     # also installs a pre-push hook that runs `pnpm check` (lint + typecheck)
pnpm build       # build both packages (the plugin tests use the parser's dist)
pnpm test        # run the test suites, on ESLint 9 and 10
pnpm docs:dev    # documentation site at http://localhost:5173
```

| パス | 内容 |
|---|---|
| `packages/pug-parser` | `pug-lint-parser`: Pug の CST パーサー。 |
| `packages/eslint-plugin` | `eslint-plugin-pug-vue`: vue-eslint-parser 用のトークナイザー、processor（抑制と fix ガード）、config、`vue-pug/*` rule。 |
| `docs` | VitePress のドキュメントサイト。 |
| `examples/vue-pug` | プラグインを手元で試すための小さな Vue プロジェクト（`docs/manual-test.md`）。 |

## 基本ルール

1. **生成されたファイルを手で編集しないでください。**
   - `packages/eslint-plugin/src/configs/generated/vue-compat.ts` と `packages/eslint-plugin/docs/vue-compatibility.md` は、互換性ハーネスから生成されます。`pnpm -C packages/eslint-plugin compat` を実行してください。手作業で決めた内容は `packages/eslint-plugin/tools/compat/overrides.ts` に置きます。
   - `<!-- begin auto-generated … -->` マーカーの間のセクション（rule の表、`vue/*` rule の一覧）は、`pnpm -C packages/eslint-plugin docs:gen` から生成されます。
2. **fix がテンプレートの描画結果を変えてはいけません。** fix ガードがほとんどの間違いを捕まえますが、rule のテストでも、その fix がクリーンであることを示すべきです。`packages/eslint-plugin/tests/all-rules` にある全 rule ハーネスは、すべてのフィクスチャを、fix の前と後に本物の `pug` でコンパイルします。
3. **新しい rule を追加しますか？** `src/rules/<name>.ts` を追加し（`createPugRule` を使います）、`src/rules/index.ts` に登録し、`tests/rules/<name>.test.ts` と `docs/rules/<name>.md` を追加します。ドキュメントには、少なくとも 2 つの `Incorrect` と 2 つの `Correct` の例が必要です。これらはドキュメントのテストで lint されます。そのあと `docs:gen` を実行し、サイトのページ `docs/rules/<name>.md` を追加します（ほかのページと同じく、`<!--@include: -->` の行が 1 つです）。
4. **フィクスチャはバイト単位で保ってください。** 一部のフィクスチャは CRLF、BOM、タブの入力をテストします。`.gitattributes` がそれらをそのまま保ちます。エディターに正規化させないでください。
5. **動作を変える場合はテストを追加してください。** パーサーでもプラグインでも同様です。

## プルリクエストを開く前に

CI が実行するのと同じチェックを実行してください。

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm -C packages/eslint-plugin compat:check   # if you touched rules, the tokenizer or the processor
pnpm -C packages/eslint-plugin docs:check     # if you touched rules or their docs
pnpm docs:build                               # if you touched the docs site
```

そのうえで、次のようにしてください。

- **パッケージの利用者が気づく変更には changeset を追加してください。** `pnpm changeset` を実行し、パッケージとバージョンの上げ幅を選び、changelog 用に 1、2 行を書きます。ドキュメントだけの変更や内部的な変更には不要です。
- **PR のタイトルは [Conventional Commits](https://www.conventionalcommits.org/) の形式にしてください。** `fix(indent): ...`、`feat: ...`、`docs: ...`、`chore: ...`、`test: ...` です。破壊的変更には `!` を付けます（`feat!: ...`）。
- 1 つのプルリクエストには、1 つの変更だけを含めてください。

## プルリクエストを開いた後

- これが初めてのコントリビューションの場合、GitHub Actions はメンテナーが CI の実行を承認するまで待ちます。これはフォークからのプルリクエストに対する GitHub の安全策で、あなたの変更への評価ではありません。
- メンテナーがレビューしてマージします。そのあと、あなたの changeset は次の「Version Packages」プルリクエストに現れ、それがマージされると公開されます（[リリース](#リリース)を参照）。

## リリース

リリースは [changesets](https://github.com/changesets/changesets) と [`release.yml`](../../.github/workflows/release.yml) で自動化されています。

1. changeset が残っている状態で `main` に push されるたびに、バージョンを上げて各パッケージの `CHANGELOG.md` を書く **Version Packages** プルリクエストが作成または更新されます。
2. そのプルリクエストをマージすると、npm の Trusted Publishing（トークンは保存されません）を通じて、provenance 付きで新しいバージョンが npm に公開され、パッケージごとに GitHub のリリースが作成されます。

Version Packages プルリクエストはワークフロー自身のトークンで作成され、GitHub はそのトークンによるイベントでは他のワークフローを開始しないため、CI は自動では動きません。CI のチェックを動かすには、プルリクエストを閉じて開き直すか、そのブランチに自分でコミットを push してください。

<details>
<summary><strong>初回のセットアップ（メンテナー向け）</strong></summary>

パッケージは、メンテナー個人の npm アカウントから公開されます。Trusted Publishing は npm にすでに存在するパッケージにしか設定できないため、最初のバージョンは手作業で公開します。

1. GitHub で、Settings → Actions → General → GitHub Actions によるプルリクエストの作成と承認を許可します（changesets が Version Packages プルリクエストを開くのに必要です）。
2. 最初の Version Packages プルリクエストをマージします。信頼できる発行元がまだ設定されていないため、その publish ジョブは失敗しますが、想定どおりです。
3. 更新された `main` で、`npm login`、`pnpm install && pnpm build` を実行し、`packages/pug-parser` と `packages/eslint-plugin` の両方で `pnpm pack` を実行します（`pnpm pack` は `workspace:*` を実際のバージョンに置き換えます）。実際のターミナルで、`npm publish ./<file>.tgz --access public` を、パーサーから先に実行します。npm はブラウザーで 2FA を求めます。npm は個人のマシンからの公開をステージングします。npmjs.com でステージングされたバージョンを承認するまで、パッケージには `0.0.0-stage` というプレースホルダーが表示されます。
4. npmjs.com で、各パッケージについて Settings → Trusted Publisher → GitHub Actions を開き、リポジトリ `HQCuong/pug-lint`、ワークフロー `release.yml` を設定します。そのあと、失敗したリリースの実行を開いて **Re-run failed jobs** を使います（または `main` に任意のコミットを push します）。すでに npm にあるバージョンは読み飛ばされ、足りない GitHub のリリースが作成されます。

</details>

## セキュリティ

脆弱性を見つけましたか？ issue は作成せず、[SECURITY.md](../ja/SECURITY.md) を参照してください。

## ライセンス

コントリビュートすることで、あなたの貢献が [MIT License](../../LICENSE) でライセンスされることに同意したものとみなされます。
