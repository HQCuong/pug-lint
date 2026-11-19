<sub>[English](../../CONTRIBUTING.md) | [Tiếng Việt](../vi/CONTRIBUTING.md) | [한국어](../ko/CONTRIBUTING.md) | [简体中文](../zh/CONTRIBUTING.md) | [日本語](../ja/CONTRIBUTING.md) | **Deutsch** | [Français](../fr/CONTRIBUTING.md) | [Español](../es/CONTRIBUTING.md) | [हिन्दी](../hi/CONTRIBUTING.md) | [Português (Brasil)](../pt/CONTRIBUTING.md) | [Русский](../ru/CONTRIBUTING.md)</sub>

# Mitwirken

> Diese Übersetzung kann hinter der englischen Fassung zurückliegen. Bei Abweichungen ist die [englische Fassung](../../CONTRIBUTING.md) maßgeblich.

Danke für die Unterstützung. Fehlerberichte, Korrekturen an der Dokumentation und Pull Requests sind gleichermaßen willkommen.

Alle Beteiligten sollen den [Verhaltenskodex](../de/CODE_OF_CONDUCT.md) einhalten.

## Bevor Sie anfangen

- **Fehler oder kleine Korrektur?** Öffnen Sie direkt einen Pull Request oder ein Issue, wenn Sie
  nicht sicher sind, ob es ein Fehler ist. Ein Fehlerbericht ist am nützlichsten mit der kleinsten
  `.vue`-Datei, die ihn zeigt, und Ihrer `eslint.config.js`.
- **Neue Regel, neue Option oder Änderung eines Standardwerts?** Öffnen Sie zuerst ein Issue, damit
  wir uns auf die Form einigen, bevor Sie den Code schreiben.

## Einrichtung

Verwenden Sie die Node-Version aus [`.nvmrc`](../../.nvmrc) (`nvm use`). Das Repository ist ein
[pnpm](https://pnpm.io)-Workspace; `corepack enable` liefert die in `package.json` festgelegte
pnpm-Version.

```sh
pnpm install     # also installs a pre-push hook that runs `pnpm check` (lint + typecheck)
pnpm build       # build both packages (the plugin tests use the parser's dist)
pnpm test        # run the test suites, on ESLint 9 and 10
pnpm docs:dev    # documentation site at http://localhost:5173
```

| Pfad | Was es ist |
|---|---|
| `packages/pug-parser` | `pug-lint-parser`: der Pug-CST-Parser. |
| `packages/eslint-plugin` | `eslint-plugin-pug-vue`: Tokenizer für vue-eslint-parser, Prozessor (Unterdrückung + Fix-Guard), Configs und die `vue-pug/*`-Regeln. |
| `docs` | Die VitePress-Dokumentationsseite. |
| `examples/vue-pug` | Ein kleines Vue-Projekt, um das Plugin von Hand auszuprobieren (`docs/manual-test.md`). |

## Grundregeln

1. **Bearbeiten Sie erzeugte Dateien nie von Hand.**
   - `packages/eslint-plugin/src/configs/generated/vue-compat.ts` und
     `packages/eslint-plugin/docs/vue-compatibility.md` stammen aus dem Kompatibilitäts-Harness:
     Führen Sie `pnpm -C packages/eslint-plugin compat` aus. Von Hand getroffene Entscheidungen
     gehören in `packages/eslint-plugin/tools/compat/overrides.ts`.
   - Die Abschnitte zwischen den `<!-- begin auto-generated … -->`-Markern (Regeltabellen,
     `vue/*`-Regellisten) stammen aus `pnpm -C packages/eslint-plugin docs:gen`.
2. **Ein Fix darf nie ändern, was ein Template rendert.** Der Fix-Guard fängt die meisten Fehler,
   aber die Tests einer Regel sollten beweisen, dass ihre Fixes sauber sind: Das All-Rules-Harness in
   `packages/eslint-plugin/tests/all-rules` kompiliert jede Fixture vor und nach dem Fixen mit dem
   echten `pug`.
3. **Neue Regel?** Ergänzen Sie `src/rules/<name>.ts` (mit `createPugRule`), registrieren Sie sie in
   `src/rules/index.ts`, fügen Sie `tests/rules/<name>.test.ts` und `docs/rules/<name>.md` hinzu. Die
   Dokumentation braucht mindestens zwei `Incorrect`- und zwei `Correct`-Beispiele: Sie werden von den
   Docs-Tests gelintet. Führen Sie dann `docs:gen` aus und fügen Sie die Seite `docs/rules/<name>.md`
   der Website hinzu (eine `<!--@include: -->`-Zeile, wie bei den anderen).
4. **Fixtures bytegenau halten.** Manche Fixtures testen CRLF-, BOM- und Tab-Eingaben;
   `.gitattributes` hält sie unverändert. Lassen Sie Ihren Editor sie nicht normalisieren.
5. **Fügen Sie einen Test hinzu** für jede Verhaltensänderung, im Parser oder im Plugin.

## Bevor Sie einen Pull Request öffnen

Führen Sie dieselben Prüfungen aus wie die CI:

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm -C packages/eslint-plugin compat:check   # if you touched rules, the tokenizer or the processor
pnpm -C packages/eslint-plugin docs:check     # if you touched rules or their docs
pnpm docs:build                               # if you touched the docs site
```

Danach:

- **Fügen Sie ein Changeset hinzu** für alles, was ein Nutzer eines Pakets bemerken würde: Führen Sie
  `pnpm changeset` aus, wählen Sie die Pakete und den Versionssprung und schreiben Sie ein bis zwei
  Zeilen für das Changelog. Änderungen nur an der Dokumentation und interne Änderungen brauchen
  keines.
- **Benennen Sie den PR im Stil von [Conventional Commits](https://www.conventionalcommits.org/)**:
  `fix(indent): ...`, `feat: ...`, `docs: ...`, `chore: ...`, `test: ...`. Kennzeichnen Sie
  Breaking Changes mit `!` (`feat!: ...`).
- Halten Sie sich an eine Änderung pro Pull Request.

## Was nach dem Öffnen eines Pull Requests passiert

- Ist das Ihr erster Beitrag, wartet GitHub Actions, bis ein Maintainer den CI-Lauf freigibt. Das
  ist eine GitHub-Schutzmaßnahme für Pull Requests aus Forks, kein Urteil über Ihre Änderung.
- Der Maintainer prüft und merged. Ihr Changeset erscheint dann im nächsten „Version Packages"-Pull-Request
  und wird veröffentlicht, wenn dieser gemerged wird (siehe [Veröffentlichung](#veröffentlichung)).

## Veröffentlichung

Releases sind mit [changesets](https://github.com/changesets/changesets) und
[`release.yml`](../../.github/workflows/release.yml) automatisiert:

1. Jeder Push auf `main` mit ausstehenden Changesets öffnet oder aktualisiert einen
   **Version Packages**-Pull-Request, der die Versionen erhöht und die `CHANGELOG.md` jedes Pakets
   schreibt.
2. Das Mergen dieses Pull Requests veröffentlicht die neuen Versionen auf npm mit Provenance, über
   npm Trusted Publishing (es wird kein Token gespeichert), und erstellt pro Paket ein GitHub-Release.

Der Version-Packages-Pull-Request wird mit dem eigenen Token des Workflows geöffnet, und GitHub
startet für Ereignisse dieses Tokens keine anderen Workflows, sodass die CI darauf nicht von selbst
läuft. Um CI-Prüfungen dafür zu bekommen, schließen und öffnen Sie den Pull Request erneut (oder
pushen Sie selbst einen Commit auf seinen Branch).

<details>
<summary><strong>Einmalige Einrichtung (Maintainer)</strong></summary>

Die Pakete werden vom persönlichen npm-Konto des Maintainers veröffentlicht. Trusted Publishing lässt
sich nur für ein Paket einrichten, das auf npm bereits existiert, daher wird die erste Version von
Hand veröffentlicht:

1. Auf GitHub: Settings → Actions → General → GitHub Actions erlauben, Pull Requests zu erstellen und
   zu genehmigen (changesets braucht das, um den Version-Packages-Pull-Request zu öffnen).
2. Mergen Sie den ersten Version-Packages-Pull-Request. Sein Publish-Job schlägt fehl, da noch kein
   Trusted Publisher eingerichtet ist; das ist erwartet.
3. Auf dem aktualisierten `main`: `npm login`, `pnpm install && pnpm build`, dann `pnpm pack` in
   `packages/pug-parser` und in `packages/eslint-plugin` (`pnpm pack` ersetzt `workspace:*` durch die
   echte Version). In einem echten Terminal `npm publish ./<file>.tgz --access public`, zuerst den
   Parser; npm fragt im Browser nach 2FA. npm stellt ein von einem persönlichen Rechner ausgeführtes
   Publish zurück: Das Paket zeigt einen `0.0.0-stage`-Platzhalter, bis Sie die zurückgestellte
   Version auf npmjs.com genehmigen.
4. Auf npmjs.com, für jedes Paket: Settings → Trusted Publisher → GitHub Actions, Repository
   `HQCuong/pug-lint`, Workflow `release.yml`. Öffnen Sie dann den fehlgeschlagenen Release-Lauf und
   verwenden Sie **Re-run failed jobs** (oder pushen Sie irgendeinen Commit auf `main`): Er überspringt
   die Versionen, die schon auf npm sind, und erstellt die fehlenden GitHub-Releases.

</details>

## Sicherheit

Eine Sicherheitslücke gefunden? Eröffnen Sie kein Issue; siehe [SECURITY.md](../de/SECURITY.md).

## Lizenz

Mit Ihrem Beitrag erklären Sie sich einverstanden, dass Ihre Beiträge unter der [MIT-Lizenz](../../LICENSE) lizenziert werden.
