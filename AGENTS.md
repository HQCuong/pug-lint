# pug-lint: guide for coding agents

> Using `eslint-plugin-pug-vue` in an app rather than working on this repository? Read
> [packages/eslint-plugin/AGENTS.md](packages/eslint-plugin/AGENTS.md) instead.

This repository is a pnpm workspace with two published packages, `pug-lint-parser`
(`packages/pug-parser`) and `eslint-plugin-pug-vue` (`packages/eslint-plugin`), plus the
VitePress site in `docs/`. [CONTRIBUTING.md](CONTRIBUTING.md) is the source of truth for setup,
ground rules and checks; the points below are the ones agents most often get wrong.

- Run pnpm through corepack if `pnpm` is not on `PATH` (`corepack pnpm …`). Build before testing:
  the plugin's tests import the parser's `dist`.
- Never hand-edit generated files: `packages/eslint-plugin/src/configs/generated/vue-compat.ts`,
  `packages/eslint-plugin/docs/vue-compatibility.md`, and anything between
  `<!-- begin auto-generated … -->` markers. Pages under `docs/rules/`, `docs/parser/` and
  `docs/guide/{vue-compatibility,unsupported-syntax}.md` only include files from `packages/`:
  edit those files instead.
  Regenerate with `pnpm -C packages/eslint-plugin compat` and `… docs:gen`.
- Fixtures under `packages/*/tests/fixtures` are byte-exact (CRLF, BOM, tabs). Do not normalize
  them.
- A fix must never change what a template renders. Rule tests and the all-rules harness check
  this against the real `pug` compiler; keep them passing rather than loosening them.
- User-visible change: add a changeset (`pnpm changeset`). PR titles use Conventional Commits.
- Full check: `pnpm build && pnpm lint && pnpm typecheck && pnpm test`, then
  `pnpm -C packages/eslint-plugin compat:check`, `… docs:check`, and `pnpm docs:build` for site
  changes.
