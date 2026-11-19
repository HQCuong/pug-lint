<sub>[English](../../CONTRIBUTING.md) | [Tiếng Việt](../vi/CONTRIBUTING.md) | [한국어](../ko/CONTRIBUTING.md) | [简体中文](../zh/CONTRIBUTING.md) | [日本語](../ja/CONTRIBUTING.md) | [Deutsch](../de/CONTRIBUTING.md) | [Français](../fr/CONTRIBUTING.md) | [Español](../es/CONTRIBUTING.md) | [हिन्दी](../hi/CONTRIBUTING.md) | [Português (Brasil)](../pt/CONTRIBUTING.md) | **Русский**</sub>

# Участие в проекте

> Этот перевод может отставать от английской версии. При расхождениях приоритет имеет [английская версия](../../CONTRIBUTING.md).

Спасибо за помощь. Отчёты об ошибках, исправления документации и pull request'ы приветствуются.

От всех участников ожидается соблюдение [кодекса поведения](./CODE_OF_CONDUCT.md).

## Прежде чем начать

- **Ошибка или небольшое исправление?** Откройте pull request сразу или issue, если не уверены, что это
  ошибка. Отчёт об ошибке полезнее всего с минимальным файлом `.vue`, который её показывает, и вашим
  `eslint.config.js`.
- **Новое правило, новая опция или изменение значения по умолчанию?** Сначала откройте issue, чтобы
  договориться о форме до того, как вы напишете код.

## Настройка окружения

Используйте версию Node из [`.nvmrc`](../../.nvmrc) (`nvm use`). Репозиторий является рабочим пространством
[pnpm](https://pnpm.io); `corepack enable` даёт версию pnpm, закреплённую в `package.json`.

```sh
pnpm install     # also installs a pre-push hook that runs `pnpm check` (lint + typecheck)
pnpm build       # build both packages (the plugin tests use the parser's dist)
pnpm test        # run the test suites, on ESLint 9 and 10
pnpm docs:dev    # documentation site at http://localhost:5173
```

| Путь | Что это |
|---|---|
| `packages/pug-parser` | `pug-lint-parser`: парсер CST для Pug. |
| `packages/eslint-plugin` | `eslint-plugin-pug-vue`: токенизатор для vue-eslint-parser, процессор (подавление + защита исправлений), конфиги и правила `vue-pug/*`. |
| `docs` | Сайт документации на VitePress. |
| `examples/vue-pug` | Небольшой проект на Vue, чтобы попробовать плагин вручную (`docs/manual-test.md`). |

## Основные правила

1. **Никогда не правьте сгенерированные файлы вручную.**
   - `packages/eslint-plugin/src/configs/generated/vue-compat.ts` и
     `packages/eslint-plugin/docs/vue-compatibility.md` создаются набором проверок совместимости: запустите
     `pnpm -C packages/eslint-plugin compat`. Решения, принятые вручную, записываются в
     `packages/eslint-plugin/tools/compat/overrides.ts`.
   - Разделы между маркерами `<!-- begin auto-generated … -->` (таблицы правил, списки правил `vue/*`)
     создаются командой `pnpm -C packages/eslint-plugin docs:gen`.
2. **Исправление никогда не должно менять то, что отображает шаблон.** Защита исправлений ловит большинство
   ошибок, но тесты правила должны доказывать, что его исправления чисты: набор проверок всех правил в
   `packages/eslint-plugin/tests/all-rules` компилирует каждую фикстуру настоящим `pug` до и после
   исправления.
3. **Новое правило?** Добавьте `src/rules/<name>.ts` (используйте `createPugRule`), зарегистрируйте его в
   `src/rules/index.ts`, добавьте `tests/rules/<name>.test.ts` и `docs/rules/<name>.md`. В документации
   нужно как минимум два примера `Incorrect` и два `Correct`: они линтятся тестами документации. Затем
   запустите `docs:gen` и добавьте страницу сайта `docs/rules/<name>.md` (одна строка
   `<!--@include: -->`, как у остальных).
4. **Храните фикстуры побайтово точными.** Некоторые фикстуры проверяют ввод с CRLF, BOM и табуляцией;
   `.gitattributes` оставляет их как есть. Не позволяйте редактору их нормализовать.
5. **Добавляйте тест** для любого изменения поведения, в парсере или в плагине.

## Перед открытием pull request

Запустите те же проверки, что и CI:

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm -C packages/eslint-plugin compat:check   # if you touched rules, the tokenizer or the processor
pnpm -C packages/eslint-plugin docs:check     # if you touched rules or their docs
pnpm docs:build                               # if you touched the docs site
```

Затем:

- **Добавьте changeset** для всего, что заметит пользователь пакета: запустите `pnpm changeset`, выберите
  пакеты и повышение версии и напишите одну-две строки для changelog. Изменениям только в документации и
  внутренним изменениям он не нужен.
- **Назовите PR в стиле [Conventional Commits](https://www.conventionalcommits.org/)**:
  `fix(indent): ...`, `feat: ...`, `docs: ...`, `chore: ...`, `test: ...`. Критические изменения
  помечайте `!` (`feat!: ...`).
- Одно изменение в одном pull request.

## Что происходит после открытия pull request

- Если это ваш первый вклад, GitHub Actions ждёт, пока мейнтейнер одобрит запуск CI. Это защита GitHub для
  pull request'ов из форков, а не оценка вашего изменения.
- Мейнтейнер проверяет и вливает. Ваш changeset затем появляется в следующем pull request «Version
  Packages» и выходит в релиз после его слияния (см. [Выпуск релизов](#выпуск-релизов)).

## Выпуск релизов

Релизы автоматизированы с помощью [changesets](https://github.com/changesets/changesets) и
[`release.yml`](../../.github/workflows/release.yml):

1. Каждый push в `main` с ожидающими changeset'ами открывает или обновляет pull request **Version
   Packages**, который повышает версии и записывает `CHANGELOG.md` каждого пакета.
2. Слияние этого pull request публикует новые версии в npm с provenance через npm Trusted Publishing
   (токен не хранится) и создаёт GitHub release для каждого пакета.

Pull request Version Packages открывается собственным токеном workflow, а GitHub не запускает другие
workflow для событий, созданных этим токеном, поэтому CI на нём сам по себе не запускается. Чтобы получить
проверки CI, закройте и заново откройте pull request (или сами отправьте коммит в его ветку).

<details>
<summary><strong>Однократная настройка (для мейнтейнеров)</strong></summary>

Пакеты публикуются из личной учётной записи npm мейнтейнера. Trusted Publishing можно настроить только для
пакета, который уже существует в npm, поэтому первая версия публикуется вручную:

1. На GitHub: Settings → Actions → General → разрешите GitHub Actions создавать и одобрять pull request'ы
   (changesets это нужно, чтобы открыть pull request Version Packages).
2. Слейте первый pull request Version Packages. Его задача публикации завершится ошибкой, поскольку доверенный
   издатель ещё не настроен; это ожидаемо.
3. В обновлённом `main`: `npm login`, `pnpm install && pnpm build`, затем `pnpm pack` в
   `packages/pug-parser` и в `packages/eslint-plugin` (`pnpm pack` заменяет `workspace:*` реальной
   версией). В настоящем терминале `npm publish ./<file>.tgz --access public`, сначала парсер; npm
   запрашивает 2FA в браузере. npm откладывает публикацию, сделанную с личной машины: пакет показывает
   заглушку `0.0.0-stage`, пока вы не подтвердите отложенную версию на npmjs.com.
4. На npmjs.com для каждого пакета: Settings → Trusted Publisher → GitHub Actions, репозиторий
   `HQCuong/pug-lint`, workflow `release.yml`. Затем откройте упавший запуск релиза и нажмите
   **Re-run failed jobs** (или отправьте любой коммит в `main`): он пропустит версии, уже имеющиеся в npm, и
   создаст недостающие GitHub release.

</details>

## Безопасность

Нашли уязвимость? Не открывайте issue; см. [SECURITY.md](./SECURITY.md).

## Лицензия

Участвуя в проекте, вы соглашаетесь, что ваш вклад распространяется по [лицензии MIT](../../LICENSE).
