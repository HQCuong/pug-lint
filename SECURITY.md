<sub>**English** | [Tiếng Việt](./i18n/vi/SECURITY.md) | [한국어](./i18n/ko/SECURITY.md) | [简体中文](./i18n/zh/SECURITY.md) | [日本語](./i18n/ja/SECURITY.md) | [Deutsch](./i18n/de/SECURITY.md) | [Français](./i18n/fr/SECURITY.md) | [Español](./i18n/es/SECURITY.md) | [हिन्दी](./i18n/hi/SECURITY.md) | [Português (Brasil)](./i18n/pt/SECURITY.md) | [Русский](./i18n/ru/SECURITY.md)</sub>

# Security policy

## Supported versions

Only the latest release of `eslint-plugin-pug-vue` and `pug-lint-parser` receives fixes.

## Reporting a vulnerability

Please don't open a public issue. Report it privately through
[GitHub's private vulnerability reporting](https://github.com/HQCuong/pug-lint/security/advisories/new)
with a description, the affected version and steps to reproduce.

You should get a reply within a week. Once a fix is released, the advisory is published with
credit to you unless you'd rather stay anonymous.

Both packages run inside ESLint on your own source files and make no network requests. A bug that
only produces a wrong lint result or a wrong fix is not a vulnerability; report it as a normal
[issue](https://github.com/HQCuong/pug-lint/issues/new/choose).
