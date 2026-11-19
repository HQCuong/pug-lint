<sub>[English](../../CONTRIBUTING.md) | [Tiếng Việt](../vi/CONTRIBUTING.md) | [한국어](../ko/CONTRIBUTING.md) | [简体中文](../zh/CONTRIBUTING.md) | [日本語](../ja/CONTRIBUTING.md) | [Deutsch](../de/CONTRIBUTING.md) | **Français** | [Español](../es/CONTRIBUTING.md) | [हिन्दी](../hi/CONTRIBUTING.md) | [Português (Brasil)](../pt/CONTRIBUTING.md) | [Русский](../ru/CONTRIBUTING.md)</sub>

# Contribuer

> Cette traduction peut être en retard sur la version anglaise. En cas de divergence, la [version anglaise](../../CONTRIBUTING.md) fait foi.

Merci de votre aide. Les signalements de bugs, corrections de documentation et pull requests sont tous les bienvenus.

Toutes les personnes qui participent doivent respecter le [code de conduite](./CODE_OF_CONDUCT.md).

## Avant de commencer

- **Un bug ou une petite correction ?** Ouvrez directement une pull request, ou une issue si vous
  n'êtes pas sûr qu'il s'agisse d'un bug. Un signalement de bug est plus utile avec le plus petit
  fichier `.vue` qui le montre et votre `eslint.config.js`.
- **Une nouvelle règle, une nouvelle option ou un changement de valeur par défaut ?** Ouvrez d'abord
  une issue afin que nous nous mettions d'accord sur la forme avant que vous n'écriviez le code.

## Configuration

Utilisez la version de Node indiquée dans [`.nvmrc`](../../.nvmrc) (`nvm use`). Le dépôt est un
workspace [pnpm](https://pnpm.io) ; `corepack enable` vous donne la version de pnpm épinglée dans
`package.json`.

```sh
pnpm install     # also installs a pre-push hook that runs `pnpm check` (lint + typecheck)
pnpm build       # build both packages (the plugin tests use the parser's dist)
pnpm test        # run the test suites, on ESLint 9 and 10
pnpm docs:dev    # documentation site at http://localhost:5173
```

| Chemin | Ce que c'est |
|---|---|
| `packages/pug-parser` | `pug-lint-parser` : le parser CST de Pug. |
| `packages/eslint-plugin` | `eslint-plugin-pug-vue` : tokenizer pour vue-eslint-parser, processor (suppression + fix guard), configs et règles `vue-pug/*`. |
| `docs` | Le site de documentation VitePress. |
| `examples/vue-pug` | Un petit projet Vue pour essayer le plugin à la main (`docs/manual-test.md`). |

## Règles de base

1. **Ne modifiez jamais les fichiers générés à la main.**
   - `packages/eslint-plugin/src/configs/generated/vue-compat.ts` et
     `packages/eslint-plugin/docs/vue-compatibility.md` viennent du harnais de compatibilité :
     lancez `pnpm -C packages/eslint-plugin compat`. Les décisions manuelles vont dans
     `packages/eslint-plugin/tools/compat/overrides.ts`.
   - Les sections entre les marqueurs `<!-- begin auto-generated … -->` (tableaux de règles, listes
     de règles `vue/*`) viennent de `pnpm -C packages/eslint-plugin docs:gen`.
2. **Une correction ne doit jamais changer ce qu'un template affiche.** Le fix guard attrape la
   plupart des erreurs, mais les tests d'une règle doivent prouver que ses corrections sont propres :
   le harnais all-rules dans `packages/eslint-plugin/tests/all-rules` compile chaque fixture avec le
   vrai `pug` avant et après la correction.
3. **Une nouvelle règle ?** Ajoutez `src/rules/<name>.ts` (utilisez `createPugRule`), enregistrez-la
   dans `src/rules/index.ts`, ajoutez `tests/rules/<name>.test.ts` et `docs/rules/<name>.md`. La
   documentation doit contenir au moins deux exemples `Incorrect` et deux `Correct` : ils sont
   lintés par les tests de la documentation. Lancez ensuite `docs:gen` et ajoutez la page du site
   `docs/rules/<name>.md` (une seule ligne `<!--@include: -->`, comme les autres).
4. **Gardez les fixtures identiques à l'octet près.** Certaines fixtures testent des entrées CRLF,
   BOM et tabulations ; `.gitattributes` les conserve telles quelles. Ne laissez pas votre éditeur
   les normaliser.
5. **Ajoutez un test** pour tout changement de comportement, dans le parser ou le plugin.

## Avant d'ouvrir une pull request

Lancez les mêmes vérifications que la CI :

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm -C packages/eslint-plugin compat:check   # if you touched rules, the tokenizer or the processor
pnpm -C packages/eslint-plugin docs:check     # if you touched rules or their docs
pnpm docs:build                               # if you touched the docs site
```

Ensuite :

- **Ajoutez un changeset** pour tout ce qu'un utilisateur d'un package remarquerait : lancez
  `pnpm changeset`, choisissez les packages et l'incrément, et écrivez une ou deux lignes pour le
  changelog. Les changements qui ne touchent que la documentation ou l'interne n'en ont pas besoin.
- **Donnez à la PR un titre au style [Conventional Commits](https://www.conventionalcommits.org/)** :
  `fix(indent): ...`, `feat: ...`, `docs: ...`, `chore: ...`, `test: ...`. Marquez les changements
  incompatibles avec `!` (`feat!: ...`).
- Gardez un seul changement par pull request.

## Ce qui se passe après l'ouverture d'une pull request

- S'il s'agit de votre première contribution, GitHub Actions attend qu'un mainteneur approuve
  l'exécution de la CI. C'est une protection de GitHub pour les pull requests venant de forks, pas
  un jugement sur votre changement.
- Le mainteneur relit et fusionne. Votre changeset apparaît alors dans la prochaine pull request
  « Version Packages », et est publié quand celle-ci est fusionnée (voir [Publication des versions](#releasing)).

## Publication des versions {#releasing}

Les versions sont automatisées avec [changesets](https://github.com/changesets/changesets) et
[`release.yml`](../../.github/workflows/release.yml) :

1. Chaque push sur `main` avec des changesets en attente ouvre ou met à jour une pull request
   **Version Packages** qui incrémente les versions et écrit le `CHANGELOG.md` de chaque package.
2. Fusionner cette pull request publie les nouvelles versions sur npm avec provenance, via le
   Trusted Publishing de npm (aucun token n'est stocké), et crée une release GitHub par package.

La pull request Version Packages est ouverte avec le propre token du workflow, et GitHub ne lance
pas d'autres workflows pour les événements créés par ce token : la CI ne s'exécute donc pas toute
seule sur elle. Pour obtenir les vérifications de la CI, fermez et rouvrez la pull request (ou
poussez vous-même un commit sur sa branche).

<details>
<summary><strong>Configuration initiale (mainteneurs)</strong></summary>

Les packages sont publiés depuis le compte npm personnel du mainteneur. Le Trusted Publishing ne
peut être configuré que sur un package qui existe déjà sur npm : la première version est donc
publiée à la main :

1. Sur GitHub : Settings → Actions → General → autoriser GitHub Actions à créer et approuver des
   pull requests (changesets en a besoin pour ouvrir la pull request Version Packages).
2. Fusionnez la première pull request Version Packages. Son job de publication échoue, puisqu'aucun
   trusted publisher n'est encore configuré ; c'est attendu.
3. Sur le `main` mis à jour : `npm login`, `pnpm install && pnpm build`, puis `pnpm pack` dans
   `packages/pug-parser` et dans `packages/eslint-plugin` (`pnpm pack` remplace `workspace:*` par
   la vraie version). Dans un vrai terminal, `npm publish ./<file>.tgz --access public`, le parser
   d'abord ; npm demande la 2FA dans le navigateur. npm met en attente une publication faite depuis
   une machine personnelle : le package affiche un placeholder `0.0.0-stage` jusqu'à ce que vous
   approuviez la version en attente sur npmjs.com.
4. Sur npmjs.com, pour chaque package : Settings → Trusted Publisher → GitHub Actions, dépôt
   `HQCuong/pug-lint`, workflow `release.yml`. Ouvrez ensuite l'exécution de release en échec et
   utilisez **Re-run failed jobs** (ou poussez n'importe quel commit sur `main`) : elle ignore les
   versions déjà sur npm et crée les releases GitHub manquantes.

</details>

## Sécurité

Vous avez trouvé une vulnérabilité ? N'ouvrez pas d'issue ; voir [SECURITY.md](./SECURITY.md).

## Licence

En contribuant, vous acceptez que vos contributions soient placées sous la [licence MIT](../../LICENSE).
