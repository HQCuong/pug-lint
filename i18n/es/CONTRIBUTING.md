<sub>[English](../../CONTRIBUTING.md) | [Tiếng Việt](../vi/CONTRIBUTING.md) | [한국어](../ko/CONTRIBUTING.md) | [简体中文](../zh/CONTRIBUTING.md) | [日本語](../ja/CONTRIBUTING.md) | [Deutsch](../de/CONTRIBUTING.md) | [Français](../fr/CONTRIBUTING.md) | **Español** | [हिन्दी](../hi/CONTRIBUTING.md) | [Português (Brasil)](../pt/CONTRIBUTING.md) | [Русский](../ru/CONTRIBUTING.md)</sub>

# Contribuir

> Esta traducción puede ir por detrás de la versión en inglés. En caso de discrepancia, prevalece la [versión en inglés](../../CONTRIBUTING.md).

Gracias por echar una mano. Los informes de errores, las correcciones de documentación y las pull requests son bienvenidos.

Se espera que todas las personas que participan sigan el [código de conducta](./CODE_OF_CONDUCT.md).

## Antes de empezar

- **¿Un error o una corrección pequeña?** Abre directamente una pull request, o un issue si no
  estás seguro de que sea un error. Un informe de error es más útil con el archivo `.vue` más
  pequeño que lo muestre y tu `eslint.config.js`.
- **¿Una regla nueva, una opción nueva o un cambio en un valor por defecto?** Abre primero un issue
  para que acordemos la forma antes de que escribas el código.

## Configuración

Usa la versión de Node de [`.nvmrc`](../../.nvmrc) (`nvm use`). El repositorio es un workspace de
[pnpm](https://pnpm.io); `corepack enable` te da la versión de pnpm fijada en `package.json`.

```sh
pnpm install     # also installs a pre-push hook that runs `pnpm check` (lint + typecheck)
pnpm build       # build both packages (the plugin tests use the parser's dist)
pnpm test        # run the test suites, on ESLint 9 and 10
pnpm docs:dev    # documentation site at http://localhost:5173
```

| Ruta | Qué es |
|---|---|
| `packages/pug-parser` | `pug-lint-parser`: el parser CST de Pug. |
| `packages/eslint-plugin` | `eslint-plugin-pug-vue`: tokenizador para vue-eslint-parser, procesador (supresión + guarda de correcciones), configuraciones y las reglas `vue-pug/*`. |
| `docs` | El sitio de documentación de VitePress. |
| `examples/vue-pug` | Un pequeño proyecto Vue para probar el plugin a mano (`docs/manual-test.md`). |

## Normas básicas

1. **Nunca edites a mano los archivos generados.**
   - `packages/eslint-plugin/src/configs/generated/vue-compat.ts` y
     `packages/eslint-plugin/docs/vue-compatibility.md` proceden del arnés de compatibilidad:
     ejecuta `pnpm -C packages/eslint-plugin compat`. Las decisiones tomadas a mano van en
     `packages/eslint-plugin/tools/compat/overrides.ts`.
   - Las secciones entre marcadores `<!-- begin auto-generated … -->` (tablas de reglas, listas de
     reglas `vue/*`) proceden de `pnpm -C packages/eslint-plugin docs:gen`.
2. **Una corrección nunca debe cambiar lo que renderiza una plantilla.** La guarda de correcciones
   atrapa la mayoría de los errores, pero las pruebas de una regla deberían demostrar que sus
   correcciones son limpias: el arnés de todas las reglas en
   `packages/eslint-plugin/tests/all-rules` compila cada fixture con el `pug` real antes y después
   de corregir.
3. **¿Una regla nueva?** Añade `src/rules/<name>.ts` (usa `createPugRule`), regístrala en
   `src/rules/index.ts`, añade `tests/rules/<name>.test.ts` y `docs/rules/<name>.md`. La
   documentación necesita al menos dos ejemplos `Incorrect` y dos `Correct`: las pruebas de la
   documentación los analizan con el linter. Después ejecuta `docs:gen` y añade la página del sitio
   `docs/rules/<name>.md` (una sola línea `<!--@include: -->`, como las demás).
4. **Mantén los fixtures byte a byte.** Algunos fixtures prueban entradas con CRLF, BOM y
   tabuladores; `.gitattributes` los mantiene tal como están. No dejes que tu editor los normalice.
5. **Añade una prueba** para cualquier cambio de comportamiento, en el parser o en el plugin.

## Antes de abrir una pull request

Ejecuta las mismas comprobaciones que ejecuta la CI:

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm -C packages/eslint-plugin compat:check   # if you touched rules, the tokenizer or the processor
pnpm -C packages/eslint-plugin docs:check     # if you touched rules or their docs
pnpm docs:build                               # if you touched the docs site
```

Después:

- **Añade un changeset** para todo lo que notaría un usuario de un paquete: ejecuta
  `pnpm changeset`, elige los paquetes y el tipo de incremento, y escribe una o dos líneas para el
  changelog. Los cambios solo de documentación y los internos no necesitan uno.
- **Titula la PR al estilo de [Conventional Commits](https://www.conventionalcommits.org/)**:
  `fix(indent): ...`, `feat: ...`, `docs: ...`, `chore: ...`, `test: ...`. Marca los cambios que
  rompen compatibilidad con `!` (`feat!: ...`).
- Haz un solo cambio por pull request.

## Qué ocurre después de abrir una pull request

- Si es tu primera contribución, GitHub Actions espera a que un mantenedor apruebe la ejecución de
  la CI. Es una salvaguarda de GitHub para las pull requests desde forks, no un juicio sobre tu
  cambio.
- El mantenedor revisa y fusiona. Tu changeset aparece entonces en la siguiente pull request
  «Version Packages», y se publica cuando esa se fusiona (consulta [Publicación de versiones](#publicación-de-versiones)).

## Publicación de versiones

Las versiones se automatizan con [changesets](https://github.com/changesets/changesets) y
[`release.yml`](../../.github/workflows/release.yml):

1. Cada push a `main` con changesets pendientes abre o actualiza una pull request **Version
   Packages** que sube las versiones y escribe el `CHANGELOG.md` de cada paquete.
2. Fusionar esa pull request publica las nuevas versiones en npm con provenance, mediante npm
   Trusted Publishing (no se guarda ningún token), y crea un release de GitHub por paquete.

La pull request Version Packages se abre con el token propio del workflow, y GitHub no inicia otros
workflows por eventos creados con ese token, así que la CI no se ejecuta sobre ella por sí sola.
Para obtener las comprobaciones de la CI, cierra y reabre la pull request (o haz tú mismo un commit
en su rama).

<details>
<summary><strong>Configuración única (mantenedores)</strong></summary>

Los paquetes se publican desde la cuenta personal de npm del mantenedor. Trusted Publishing solo
puede configurarse en un paquete que ya existe en npm, así que la primera versión se publica a mano:

1. En GitHub: Settings → Actions → General → permite que GitHub Actions cree y apruebe pull
   requests (changesets lo necesita para abrir la pull request Version Packages).
2. Fusiona la primera pull request Version Packages. Su trabajo de publicación falla, ya que aún no
   hay ningún publicador de confianza configurado; es lo esperado.
3. Sobre el `main` actualizado: `npm login`, `pnpm install && pnpm build`, y después `pnpm pack` en
   `packages/pug-parser` y en `packages/eslint-plugin` (`pnpm pack` sustituye `workspace:*` por la
   versión real). En una terminal real, `npm publish ./<file>.tgz --access public`, primero el
   parser; npm pide 2FA en el navegador. npm deja en espera una publicación hecha desde una máquina
   personal: el paquete muestra un marcador `0.0.0-stage` hasta que apruebes la versión en espera en
   npmjs.com.
4. En npmjs.com, para cada paquete: Settings → Trusted Publisher → GitHub Actions, repositorio
   `HQCuong/pug-lint`, workflow `release.yml`. Después abre la ejecución de release fallida y usa
   **Re-run failed jobs** (o haz push de cualquier commit a `main`): omite las versiones que ya
   están en npm y crea los releases de GitHub que faltan.

</details>

## Seguridad

¿Has encontrado una vulnerabilidad? No abras un issue; consulta [SECURITY.md](./SECURITY.md).

## Licencia

Al contribuir, aceptas que tus contribuciones se licencian bajo la [licencia MIT](../../LICENSE).
