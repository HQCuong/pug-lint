<sub>**English** | [Tiếng Việt](./i18n/vi/CONTRIBUTING.md) | [한국어](./i18n/ko/CONTRIBUTING.md) | [简体中文](./i18n/zh/CONTRIBUTING.md) | [日本語](./i18n/ja/CONTRIBUTING.md) | [Deutsch](./i18n/de/CONTRIBUTING.md) | [Français](./i18n/fr/CONTRIBUTING.md) | [Español](./i18n/es/CONTRIBUTING.md) | [हिन्दी](./i18n/hi/CONTRIBUTING.md) | [Português (Brasil)](./i18n/pt/CONTRIBUTING.md) | [Русский](./i18n/ru/CONTRIBUTING.md)</sub>

# Contributing

Thanks for helping out. Bug reports, docs fixes and pull requests are all welcome.

Everyone taking part is expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Before you start

- **Bug or small fix?** Open a pull request directly, or an issue if you're not sure it's a bug.
  A bug report is most useful with the smallest `.vue` file that shows it and your
  `eslint.config.js`.
- **New rule, new option or a change to a default?** Open an issue first so we can agree on the
  shape before you write the code.

## Setup

Use the Node version in [`.nvmrc`](./.nvmrc) (`nvm use`). The repository is a
[pnpm](https://pnpm.io) workspace; `corepack enable` gives you the pnpm version pinned in
`package.json`.

```sh
pnpm install     # also installs a pre-push hook that runs `pnpm check` (lint + typecheck)
pnpm build       # build both packages (the plugin tests use the parser's dist)
pnpm test        # run the test suites, on ESLint 9 and 10
pnpm docs:dev    # documentation site at http://localhost:5173
```

| Path | What it is |
|---|---|
| `packages/pug-parser` | `pug-lint-parser`: the Pug CST parser. |
| `packages/eslint-plugin` | `eslint-plugin-pug-vue`: tokenizer for vue-eslint-parser, processor (suppression + fix guard), configs and the `vue-pug/*` rules. |
| `docs` | The VitePress documentation site. |
| `examples/vue-pug` | A small Vue project for trying the plugin by hand (`docs/manual-test.md`). |

## Ground rules

1. **Never edit generated files by hand.**
   - `packages/eslint-plugin/src/configs/generated/vue-compat.ts` and
     `packages/eslint-plugin/docs/vue-compatibility.md` come from the compatibility harness: run
     `pnpm -C packages/eslint-plugin compat`. Hand-made decisions go in
     `packages/eslint-plugin/tools/compat/overrides.ts`.
   - The sections between `<!-- begin auto-generated … -->` markers (rules tables, `vue/*` rule
     lists) come from `pnpm -C packages/eslint-plugin docs:gen`.
2. **A fix must never change what a template renders.** The fix guard catches most mistakes, but a
   rule's tests should prove its fixes are clean: the all-rules harness in
   `packages/eslint-plugin/tests/all-rules` compiles every fixture with the real `pug` before and
   after fixing.
3. **New rule?** Add `src/rules/<name>.ts` (use `createPugRule`), register it in
   `src/rules/index.ts`, add `tests/rules/<name>.test.ts` and `docs/rules/<name>.md`. The doc needs
   at least two `Incorrect` and two `Correct` examples: they are linted by the docs tests. Then run
   `docs:gen` and add the site page `docs/rules/<name>.md` (one `<!--@include: -->` line, like the
   others).
4. **Keep fixtures byte-exact.** Some fixtures test CRLF, BOM and tab input; `.gitattributes`
   keeps them as they are. Do not let your editor normalize them.
5. **Add a test** for any behavior change, in the parser or the plugin.

## Before opening a pull request

Run the same checks CI runs:

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm -C packages/eslint-plugin compat:check   # if you touched rules, the tokenizer or the processor
pnpm -C packages/eslint-plugin docs:check     # if you touched rules or their docs
pnpm docs:build                               # if you touched the docs site
```

Then:

- **Add a changeset** for anything a user of a package would notice: run `pnpm changeset`, pick the
  packages and the bump, and write one or two lines for the changelog. Docs-only and internal
  changes don't need one.
- **Title the PR in [Conventional Commits](https://www.conventionalcommits.org/) style**:
  `fix(indent): ...`, `feat: ...`, `docs: ...`, `chore: ...`, `test: ...`. Mark breaking changes
  with `!` (`feat!: ...`).
- Keep one change per pull request.

## What happens after you open a pull request

- If this is your first contribution, GitHub Actions waits for a maintainer to approve the CI run.
  That's a GitHub safeguard for pull requests from forks, not a judgment on your change.
- The maintainer reviews and merges. Your changeset then appears in the next "Version Packages"
  pull request, and ships when that is merged (see [Releasing](#releasing)).

## Releasing

Releases are automated with [changesets](https://github.com/changesets/changesets) and
[`release.yml`](.github/workflows/release.yml):

1. Every push to `main` with pending changesets opens or updates a **Version Packages** pull
   request that bumps the versions and writes each package's `CHANGELOG.md`.
2. Merging that pull request publishes the new versions to npm with provenance, through npm
   Trusted Publishing (no token is stored), and creates a GitHub release per package.

The Version Packages pull request is opened with the workflow's own token, and GitHub does not
start other workflows for events made by that token, so CI does not run on it by itself. To get
CI checks on it, close and reopen the pull request (or push a commit to its branch yourself).

<details>
<summary><strong>One-time setup (maintainers)</strong></summary>

The packages are published from the maintainer's personal npm account. Trusted Publishing can
only be configured on a package that already exists on npm, so the first version is published by
hand:

1. On GitHub: Settings → Actions → General → allow GitHub Actions to create and approve pull
   requests (changesets needs it to open the Version Packages pull request).
2. Merge the first Version Packages pull request. Its publish job fails, since no trusted publisher
   is set up yet; that is expected.
3. On the updated `main`: `npm login`, `pnpm install && pnpm build`, then `pnpm pack` in
   `packages/pug-parser` and in `packages/eslint-plugin` (`pnpm pack` replaces `workspace:*`
   with the real version). In a real terminal, `npm publish ./<file>.tgz --access public`, parser
   first; npm asks for 2FA in the browser. npm stages a publish made from a personal machine: the
   package shows a `0.0.0-stage` placeholder until you approve the staged version on npmjs.com.
4. On npmjs.com, for each package: Settings → Trusted Publisher → GitHub Actions, repository
   `HQCuong/pug-lint`, workflow `release.yml`. Then open the failed release run and use
   **Re-run failed jobs** (or push any commit to `main`): it skips the versions already on npm and
   creates the missing GitHub releases.

</details>

## Security

Found a vulnerability? Don't open an issue; see [SECURITY.md](./SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE).
