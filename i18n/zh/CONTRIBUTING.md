<sub>[English](../../CONTRIBUTING.md) | [Tiếng Việt](../vi/CONTRIBUTING.md) | [한국어](../ko/CONTRIBUTING.md) | **简体中文** | [日本語](../ja/CONTRIBUTING.md) | [Deutsch](../de/CONTRIBUTING.md) | [Français](../fr/CONTRIBUTING.md) | [Español](../es/CONTRIBUTING.md) | [हिन्दी](../hi/CONTRIBUTING.md) | [Português (Brasil)](../pt/CONTRIBUTING.md) | [Русский](../ru/CONTRIBUTING.md)</sub>

# 贡献指南

> 本译文可能落后于英文版。如有出入，以[英文版](../../CONTRIBUTING.md)为准。

感谢你愿意出一份力。无论是 bug 报告、文档修正还是 pull request，我们都非常欢迎。

所有参与者都应遵守[行为准则](./CODE_OF_CONDUCT.md)。

## 开始之前

- **Bug 或小修复？** 可以直接提 pull request；如果不确定是不是 bug，就先提 issue。
  Bug 报告最好附上能复现问题的最小 `.vue` 文件和你的 `eslint.config.js`。
- **新增 rule、新增选项或修改默认值？** 请先提 issue，在你动手写代码之前，我们先对方案达成一致。

## 环境准备

请使用 [`.nvmrc`](../../.nvmrc) 中指定的 Node 版本（`nvm use`）。本仓库是一个
[pnpm](https://pnpm.io) workspace；运行 `corepack enable` 即可使用 `package.json` 中固定的 pnpm 版本。

```sh
pnpm install     # also installs a pre-push hook that runs `pnpm check` (lint + typecheck)
pnpm build       # build both packages (the plugin tests use the parser's dist)
pnpm test        # run the test suites, on ESLint 9 and 10
pnpm docs:dev    # documentation site at http://localhost:5173
```

| 路径 | 说明 |
|---|---|
| `packages/pug-parser` | `pug-lint-parser`：Pug CST 解析器。 |
| `packages/eslint-plugin` | `eslint-plugin-pug-vue`：vue-eslint-parser 的 tokenizer、processor（屏蔽消息 + fix guard）、配置，以及 `vue-pug/*` rules。 |
| `docs` | VitePress 文档站点。 |
| `examples/vue-pug` | 一个用来手动试用插件的小型 Vue 项目（`docs/manual-test.md`）。 |

## 基本规则

1. **不要手动编辑生成的文件。**
   - `packages/eslint-plugin/src/configs/generated/vue-compat.ts` 和
     `packages/eslint-plugin/docs/vue-compatibility.md` 由兼容性测试工具生成：运行
     `pnpm -C packages/eslint-plugin compat`。需要人工决定的内容写在
     `packages/eslint-plugin/tools/compat/overrides.ts`。
   - `<!-- begin auto-generated … -->` 标记之间的部分（rules 表格、`vue/*` rule
     列表）由 `pnpm -C packages/eslint-plugin docs:gen` 生成。
2. **修复绝不能改变模板的渲染结果。** fix guard 能拦住大多数错误，但 rule 自己的测试也应当证明它的修复是干净的：
   `packages/eslint-plugin/tests/all-rules` 中的 all-rules 测试会用真实的 `pug` 编译每个 fixture，并在修复前后各编译一次。
3. **新增 rule？** 添加 `src/rules/<name>.ts`（使用 `createPugRule`），在
   `src/rules/index.ts` 中注册，再添加 `tests/rules/<name>.test.ts` 和 `docs/rules/<name>.md`。文档里至少需要两个
   `Incorrect` 和两个 `Correct` 示例：文档测试会对它们执行 lint。然后运行
   `docs:gen`，并添加站点页面 `docs/rules/<name>.md`（只有一行 `<!--@include: -->`，和其他页面一样）。
4. **保持 fixture 的字节完全一致。** 有些 fixture 用来测试 CRLF、BOM 和 Tab 输入；`.gitattributes`
   会让它们保持原样。请不要让编辑器对它们做规范化。
5. **为任何行为变更补充测试**，无论是在 parser 还是 plugin 中。

## 提交 pull request 之前

运行与 CI 相同的检查：

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm -C packages/eslint-plugin compat:check   # if you touched rules, the tokenizer or the processor
pnpm -C packages/eslint-plugin docs:check     # if you touched rules or their docs
pnpm docs:build                               # if you touched the docs site
```

然后：

- **为用户能感知到的改动添加 changeset**：运行 `pnpm changeset`，选择相关的包和版本升级类型，并写一两行更新日志。仅文档和内部改动不需要。
- **PR 标题采用 [Conventional Commits](https://www.conventionalcommits.org/) 风格**：
  `fix(indent): ...`、`feat: ...`、`docs: ...`、`chore: ...`、`test: ...`。破坏性变更用 `!`
  标记（`feat!: ...`）。
- 每个 pull request 只包含一项改动。

## 提交 pull request 之后

- 如果这是你的第一次贡献，GitHub Actions 会等待维护者批准 CI 运行。
  这是 GitHub 对来自 fork 的 pull request 设置的安全措施，并不是对你改动的评判。
- 维护者会审查并合并。你的 changeset 随后会出现在下一个 “Version Packages”
  pull request 中，并在该 PR 合并后发布（见[发布](#发布)）。

## 发布

发布通过 [changesets](https://github.com/changesets/changesets) 和
[`release.yml`](../../.github/workflows/release.yml) 自动完成：

1. 每次推送到 `main` 且存在待处理的 changeset 时，都会打开或更新一个 **Version Packages** pull
   request，用来升级版本号并写入各个包的 `CHANGELOG.md`。
2. 合并该 pull request 后，新版本会通过 npm Trusted Publishing（不保存任何 token）带 provenance
   发布到 npm，并为每个包创建一个 GitHub release。

Version Packages pull request 是用 workflow 自己的 token 打开的，而 GitHub 不会为该 token 触发的事件启动其他
workflow，所以 CI 不会自动在它上面运行。要让 CI 检查运行，请关闭并重新打开这个 pull request（或者自己向它的分支推送一个 commit）。

<details>
<summary><strong>一次性设置（维护者）</strong></summary>

这些包是从维护者的个人 npm 账号发布的。Trusted Publishing 只能在 npm 上已存在的包上配置，所以第一个版本需要手动发布：

1. 在 GitHub 上：Settings → Actions → General → 允许 GitHub Actions 创建和批准 pull
   request（changesets 需要它来打开 Version Packages pull request）。
2. 合并第一个 Version Packages pull request。它的发布任务会失败，因为还没有设置 trusted publisher；这是预期的。
3. 在更新后的 `main` 上：`npm login`，`pnpm install && pnpm build`，然后在
   `packages/pug-parser` 和 `packages/eslint-plugin` 中分别运行 `pnpm pack`（`pnpm pack` 会把 `workspace:*`
   替换为真实版本号）。在真实的终端里运行 `npm publish ./<file>.tgz --access public`，先发布 parser；npm 会在浏览器中要求进行 2FA 验证。从个人电脑发布时，npm 会先暂存这次发布：在你到 npmjs.com 批准暂存的版本之前，该包会显示 `0.0.0-stage` 占位版本。
4. 在 npmjs.com 上，对每个包：Settings → Trusted Publisher → GitHub Actions，仓库填
   `HQCuong/pug-lint`，workflow 填 `release.yml`。然后打开失败的 release 运行记录并点击
   **Re-run failed jobs**（或向 `main` 推送任意 commit）：它会跳过 npm 上已有的版本，并创建缺失的 GitHub release。

</details>

## 安全

发现了漏洞？请不要提 issue，参见 [SECURITY.md](./SECURITY.md)。

## 许可证

提交贡献即表示你同意你的贡献以 [MIT License](../../LICENSE) 授权。
