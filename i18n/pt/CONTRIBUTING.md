<sub>[English](../../CONTRIBUTING.md) | [Tiếng Việt](../vi/CONTRIBUTING.md) | [한국어](../ko/CONTRIBUTING.md) | [简体中文](../zh/CONTRIBUTING.md) | [日本語](../ja/CONTRIBUTING.md) | [Deutsch](../de/CONTRIBUTING.md) | [Français](../fr/CONTRIBUTING.md) | [Español](../es/CONTRIBUTING.md) | [हिन्दी](../hi/CONTRIBUTING.md) | **Português (Brasil)** | [Русский](../ru/CONTRIBUTING.md)</sub>

# Como contribuir

> Esta tradução pode estar desatualizada em relação à versão em inglês. Em caso de divergência, prevalece a [versão em inglês](../../CONTRIBUTING.md).

Obrigado por ajudar. Relatos de bugs, correções na documentação e pull requests são todos bem-vindos.

Todas as pessoas que participam devem seguir o [Código de Conduta](./CODE_OF_CONDUCT.md).

## Antes de começar

- **Bug ou correção pequena?** Abra um pull request diretamente, ou uma issue se não tiver certeza
  de que é um bug. Um relato de bug fica mais útil com o menor arquivo `.vue` que o reproduz e o seu
  `eslint.config.js`.
- **Regra nova, opção nova ou mudança em um padrão?** Abra uma issue antes, para combinarmos o
  formato antes de você escrever o código.

## Configuração

Use a versão do Node que está em [`.nvmrc`](../../.nvmrc) (`nvm use`). O repositório é um workspace
do [pnpm](https://pnpm.io); `corepack enable` dá a você a versão do pnpm fixada em `package.json`.

```sh
pnpm install     # also installs a pre-push hook that runs `pnpm check` (lint + typecheck)
pnpm build       # build both packages (the plugin tests use the parser's dist)
pnpm test        # run the test suites, on ESLint 9 and 10
pnpm docs:dev    # documentation site at http://localhost:5173
```

| Caminho | O que é |
|---|---|
| `packages/pug-parser` | `pug-lint-parser`: o parser CST de Pug. |
| `packages/eslint-plugin` | `eslint-plugin-pug-vue`: tokenizer para o vue-eslint-parser, processor (supressão + fix guard), configs e as regras `vue-pug/*`. |
| `docs` | O site de documentação em VitePress. |
| `examples/vue-pug` | Um pequeno projeto Vue para experimentar o plugin à mão (`docs/manual-test.md`). |

## Regras básicas

1. **Nunca edite arquivos gerados à mão.**
   - `packages/eslint-plugin/src/configs/generated/vue-compat.ts` e
     `packages/eslint-plugin/docs/vue-compatibility.md` vêm do harness de compatibilidade: rode
     `pnpm -C packages/eslint-plugin compat`. Decisões manuais vão em
     `packages/eslint-plugin/tools/compat/overrides.ts`.
   - As seções entre marcadores `<!-- begin auto-generated … -->` (tabelas de regras, listas de
     regras `vue/*`) vêm de `pnpm -C packages/eslint-plugin docs:gen`.
2. **Uma correção nunca deve mudar o que um template renderiza.** O fix guard pega a maioria dos
   erros, mas os testes de uma regra devem provar que as correções dela são limpas: o harness de
   todas as regras em `packages/eslint-plugin/tests/all-rules` compila cada fixture com o `pug` de
   verdade antes e depois da correção.
3. **Regra nova?** Adicione `src/rules/<name>.ts` (use `createPugRule`), registre-a em
   `src/rules/index.ts`, adicione `tests/rules/<name>.test.ts` e `docs/rules/<name>.md`. A
   documentação precisa de pelo menos dois exemplos `Incorrect` e dois `Correct`: eles passam por
   lint nos testes da documentação. Depois rode `docs:gen` e adicione a página do site
   `docs/rules/<name>.md` (uma única linha `<!--@include: -->`, como as outras).
4. **Mantenha as fixtures idênticas byte a byte.** Algumas fixtures testam entrada com CRLF, BOM e
   tabs; o `.gitattributes` as mantém como estão. Não deixe seu editor normalizá-las.
5. **Adicione um teste** para qualquer mudança de comportamento, no parser ou no plugin.

## Antes de abrir um pull request

Rode os mesmos checks que o CI roda:

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm -C packages/eslint-plugin compat:check   # if you touched rules, the tokenizer or the processor
pnpm -C packages/eslint-plugin docs:check     # if you touched rules or their docs
pnpm docs:build                               # if you touched the docs site
```

Depois:

- **Adicione um changeset** para tudo que quem usa um dos pacotes notaria: rode `pnpm changeset`,
  escolha os pacotes e o tipo de incremento, e escreva uma ou duas linhas para o changelog. Mudanças
  só na documentação e mudanças internas não precisam de um.
- **Dê ao PR um título no estilo [Conventional Commits](https://www.conventionalcommits.org/)**:
  `fix(indent): ...`, `feat: ...`, `docs: ...`, `chore: ...`, `test: ...`. Marque breaking changes
  com `!` (`feat!: ...`).
- Mantenha uma mudança por pull request.

## O que acontece depois que você abre um pull request

- Se esta é a sua primeira contribuição, o GitHub Actions espera um mantenedor aprovar a execução do
  CI. É uma proteção do GitHub para pull requests vindos de forks, não um julgamento da sua mudança.
- O mantenedor revisa e faz o merge. Seu changeset então aparece no próximo pull request "Version
  Packages" e é publicado quando esse for mesclado (veja [Publicação de versões](#publicação-de-versões)).

## Publicação de versões

As versões são publicadas de forma automatizada com [changesets](https://github.com/changesets/changesets)
e o [`release.yml`](../../.github/workflows/release.yml):

1. Todo push para `main` com changesets pendentes abre ou atualiza um pull request **Version
   Packages**, que incrementa as versões e escreve o `CHANGELOG.md` de cada pacote.
2. Fazer o merge desse pull request publica as novas versões no npm com provenance, por meio do npm
   Trusted Publishing (nenhum token é armazenado), e cria uma release do GitHub por pacote.

O pull request Version Packages é aberto com o próprio token do workflow, e o GitHub não dispara
outros workflows para eventos feitos por esse token, então o CI não roda nele sozinho. Para obter
os checks do CI nele, feche e reabra o pull request (ou envie você mesmo um commit para a branch dele).

<details>
<summary><strong>Configuração única (mantenedores)</strong></summary>

Os pacotes são publicados a partir da conta pessoal do mantenedor no npm. O Trusted Publishing só
pode ser configurado em um pacote que já existe no npm, então a primeira versão é publicada à mão:

1. No GitHub: Settings → Actions → General → permita que o GitHub Actions crie e aprove pull
   requests (o changesets precisa disso para abrir o pull request Version Packages).
2. Faça o merge do primeiro pull request Version Packages. O job de publicação dele falha, pois
   ainda não há um publicador confiável configurado; isso é esperado.
3. Na `main` atualizada: `npm login`, `pnpm install && pnpm build`, depois `pnpm pack` em
   `packages/pug-parser` e em `packages/eslint-plugin` (o `pnpm pack` troca `workspace:*` pela
   versão real). Em um terminal de verdade, `npm publish ./<file>.tgz --access public`, primeiro o
   parser; o npm pede 2FA no navegador. O npm deixa em staging uma publicação feita de uma máquina
   pessoal: o pacote mostra um placeholder `0.0.0-stage` até você aprovar a versão em staging em
   npmjs.com.
4. Em npmjs.com, para cada pacote: Settings → Trusted Publisher → GitHub Actions, repositório
   `HQCuong/pug-lint`, workflow `release.yml`. Depois abra a execução de release que falhou e use
   **Re-run failed jobs** (ou envie qualquer commit para `main`): ela pula as versões que já estão
   no npm e cria as releases do GitHub que faltam.

</details>

## Segurança

Encontrou uma vulnerabilidade? Não abra uma issue; veja [SECURITY.md](./SECURITY.md).

## Licença

Ao contribuir, você concorda que suas contribuições são licenciadas sob a [Licença MIT](../../LICENSE).
