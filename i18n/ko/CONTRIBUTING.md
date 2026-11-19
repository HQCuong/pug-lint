<sub>[English](../../CONTRIBUTING.md) | [Tiếng Việt](../vi/CONTRIBUTING.md) | **한국어** | [简体中文](../zh/CONTRIBUTING.md) | [日本語](../ja/CONTRIBUTING.md) | [Deutsch](../de/CONTRIBUTING.md) | [Français](../fr/CONTRIBUTING.md) | [Español](../es/CONTRIBUTING.md) | [हिन्दी](../hi/CONTRIBUTING.md) | [Português (Brasil)](../pt/CONTRIBUTING.md) | [Русский](../ru/CONTRIBUTING.md)</sub>

# 기여 가이드

> 이 번역은 영어 원문보다 늦게 갱신될 수 있습니다. 내용이 다를 경우 [영어 원문](../../CONTRIBUTING.md)이 기준입니다.

도움을 주셔서 감사합니다. 버그 리포트, 문서 수정, pull request 모두 환영합니다.

참여하는 모든 분은 [행동 강령](./CODE_OF_CONDUCT.md)을 따라야 합니다.

## 시작하기 전에

- **버그이거나 작은 수정인가요?** pull request를 바로 열어 주세요. 버그인지 확실하지 않다면 issue를 열어도
  좋습니다. 버그 리포트에는 문제를 보여 주는 가장 작은 `.vue` 파일과 `eslint.config.js`가 있으면 가장 도움이
  됩니다.
- **새 규칙, 새 옵션, 기본값 변경인가요?** 코드를 작성하기 전에 먼저 issue를 열어 방향을 맞춰 주세요.

## 설정

[`.nvmrc`](../../.nvmrc)에 지정된 Node 버전을 사용하세요(`nvm use`). 이 저장소는
[pnpm](https://pnpm.io) workspace이며, `corepack enable`을 실행하면 `package.json`에 고정된 pnpm 버전을 쓸 수
있습니다.

```sh
pnpm install     # also installs a pre-push hook that runs `pnpm check` (lint + typecheck)
pnpm build       # build both packages (the plugin tests use the parser's dist)
pnpm test        # run the test suites, on ESLint 9 and 10
pnpm docs:dev    # documentation site at http://localhost:5173
```

| 경로 | 설명 |
|---|---|
| `packages/pug-parser` | `pug-lint-parser`: Pug CST 파서. |
| `packages/eslint-plugin` | `eslint-plugin-pug-vue`: vue-eslint-parser용 tokenizer, processor(억제 + fix guard), config, `vue-pug/*` 규칙. |
| `docs` | VitePress 문서 사이트. |
| `examples/vue-pug` | 플러그인을 직접 사용해 볼 수 있는 작은 Vue 프로젝트(`docs/manual-test.md`). |

## 기본 규칙

1. **생성된 파일은 절대 직접 수정하지 마세요.**
   - `packages/eslint-plugin/src/configs/generated/vue-compat.ts`와
     `packages/eslint-plugin/docs/vue-compatibility.md`는 호환성 하네스에서 만들어집니다.
     `pnpm -C packages/eslint-plugin compat`을 실행하세요. 사람이 내린 판단은
     `packages/eslint-plugin/tools/compat/overrides.ts`에 둡니다.
   - `<!-- begin auto-generated … -->` 마커 사이의 섹션(규칙 표, `vue/*` 규칙 목록)은
     `pnpm -C packages/eslint-plugin docs:gen`에서 만들어집니다.
2. **fix는 템플릿이 렌더링하는 결과를 절대 바꾸면 안 됩니다.** fix guard가 대부분의 실수를 잡아내지만, 규칙의
   테스트도 그 fix가 깨끗하다는 것을 증명해야 합니다.
   `packages/eslint-plugin/tests/all-rules`의 all-rules 하네스는 모든 fixture를 fix 전과 후에 실제 `pug`로
   컴파일합니다.
3. **새 규칙을 추가하나요?** `src/rules/<name>.ts`를 추가하고(`createPugRule` 사용), `src/rules/index.ts`에
   등록하고, `tests/rules/<name>.test.ts`와 `docs/rules/<name>.md`를 추가하세요. 문서에는 `Incorrect` 예시와
   `Correct` 예시가 각각 두 개 이상 있어야 하며, 이 예시는 docs 테스트에서 lint됩니다. 그런 다음 `docs:gen`을
   실행하고, 다른 페이지와 마찬가지로 사이트 페이지 `docs/rules/<name>.md`(`<!--@include: -->` 한 줄)를
   추가하세요.
4. **fixture는 바이트 단위로 정확하게 유지하세요.** 일부 fixture는 CRLF, BOM, 탭 입력을 테스트하며,
   `.gitattributes`가 이를 그대로 유지합니다. 에디터가 이를 정규화하지 않게 하세요.
5. 파서든 플러그인이든 동작이 바뀌면 **테스트를 추가**하세요.

## Pull request를 열기 전에

CI가 실행하는 것과 같은 검사를 실행하세요.

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm -C packages/eslint-plugin compat:check   # if you touched rules, the tokenizer or the processor
pnpm -C packages/eslint-plugin docs:check     # if you touched rules or their docs
pnpm docs:build                               # if you touched the docs site
```

그다음 다음을 따라 주세요.

- 패키지 사용자가 알아챌 만한 변경이라면 **changeset을 추가하세요.** `pnpm changeset`을 실행해 패키지와 버전
  증가 수준을 고르고, changelog에 들어갈 한두 줄을 작성합니다. 문서만 바꾼 변경이나 내부 변경에는 필요 없습니다.
- **PR 제목은 [Conventional Commits](https://www.conventionalcommits.org/) 스타일로 쓰세요.**
  `fix(indent): ...`, `feat: ...`, `docs: ...`, `chore: ...`, `test: ...`. 호환성을 깨는 변경은 `!`로
  표시합니다(`feat!: ...`).
- pull request 하나에는 변경 하나만 담으세요.

## Pull request를 연 후에

- 첫 기여라면 GitHub Actions는 메인테이너가 CI 실행을 승인할 때까지 기다립니다. 이는 fork에서 온 pull
  request를 위한 GitHub의 안전장치이며, 변경 내용에 대한 평가가 아닙니다.
- 메인테이너가 리뷰하고 merge합니다. 그러면 changeset은 다음 "Version Packages" pull request에 나타나고, 그것이
  merge될 때 배포됩니다([릴리스](#릴리스) 참고).

## 릴리스

릴리스는 [changesets](https://github.com/changesets/changesets)와
[`release.yml`](../../.github/workflows/release.yml)로 자동화되어 있습니다.

1. 대기 중인 changeset이 있는 상태로 `main`에 push할 때마다 버전을 올리고 각 패키지의 `CHANGELOG.md`를 쓰는
   **Version Packages** pull request가 열리거나 갱신됩니다.
2. 그 pull request를 merge하면 npm Trusted Publishing(토큰을 저장하지 않음)을 통해 provenance와 함께 새
   버전이 npm에 배포되고, 패키지마다 GitHub release가 만들어집니다.

Version Packages pull request는 워크플로 자체의 토큰으로 열리고, GitHub는 그 토큰이 만든 이벤트에 대해서는 다른
워크플로를 시작하지 않으므로 CI가 저절로 실행되지 않습니다. CI 검사를 받으려면 pull request를 닫았다가 다시 열거나, 그 브랜치에
직접 커밋을 push하세요.

<details>
<summary><strong>일회성 설정 (메인테이너용)</strong></summary>

패키지는 메인테이너의 개인 npm 계정으로 배포됩니다. Trusted Publishing은 npm에 이미 존재하는 패키지에만 설정할 수
있으므로, 첫 버전은 직접 배포합니다.

1. GitHub에서: Settings → Actions → General → GitHub Actions가 pull request를 만들고 승인하도록 허용합니다
   (changesets가 Version Packages pull request를 열려면 필요합니다).
2. 첫 Version Packages pull request를 merge합니다. 아직 trusted publisher가 설정되지 않았으므로 배포 job은
   실패하며, 이는 예상된 동작입니다.
3. 업데이트된 `main`에서: `npm login`, `pnpm install && pnpm build`를 실행한 뒤 `packages/pug-parser`와
   `packages/eslint-plugin`에서 각각 `pnpm pack`을 실행합니다(`pnpm pack`은 `workspace:*`를 실제 버전으로
   바꿉니다). 실제 터미널에서 파서를 먼저 `npm publish ./<file>.tgz --access public`으로 배포합니다. npm은
   브라우저에서 2FA를 요구합니다. npm은 개인 컴퓨터에서 한 배포를 staged 상태로 두므로, npmjs.com에서 staged
   버전을 승인할 때까지 패키지에는 `0.0.0-stage` 자리표시자가 표시됩니다.
4. npmjs.com에서 각 패키지마다: Settings → Trusted Publisher → GitHub Actions, 저장소 `HQCuong/pug-lint`,
   워크플로 `release.yml`을 설정합니다. 그런 다음 실패한 release 실행을 열어 **Re-run failed jobs**를 사용하세요
   (또는 `main`에 아무 커밋이나 push). 이미 npm에 있는 버전은 건너뛰고, 빠진 GitHub release를 만듭니다.

</details>

## 보안

취약점을 발견하셨나요? issue를 열지 말고 [SECURITY.md](./SECURITY.md)를 참고하세요.

## 라이선스

기여하면 기여한 내용이 [MIT License](../../LICENSE)로 라이선스된다는 데 동의하는 것입니다.
