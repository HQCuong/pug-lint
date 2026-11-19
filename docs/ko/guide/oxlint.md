---
title: oxlint와 함께 사용하기
description: "oxlint를 쓰는 프로젝트에서 eslint-plugin-pug-vue 사용하기: 스크립트는 oxlint, Vue 템플릿은 ESLint, 중복 보고는 eslint-plugin-oxlint로 방지."
---

# oxlint와 함께 사용하기

[Oxlint](https://oxc.rs/docs/guide/usage/linter)는 Rust로 작성된 훨씬 빠른 linter입니다. `.vue` 파일에서는
`<script>` 블록만 lint하며, `<template>`, HTML, Pug는 lint하지 않습니다. 템플릿을 읽으려면 vue-eslint-parser가
필요한 이 플러그인도 불러올 수 없습니다.

따라서 oxlint를 쓰는 프로젝트에서는 둘 다 실행합니다.

- **oxlint**는 `.vue` 파일의 `<script>`를 포함한 JavaScript와 TypeScript에 사용합니다.
- **ESLint**는 oxlint가 아직 하지 못하는 일, 즉 eslint-plugin-vue와 `eslint-plugin-pug-vue`로 템플릿을 검사하는 데
  사용합니다.

[`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint)는 oxlint 설정이 이미 실행하는
모든 규칙을 ESLint에서 꺼 주므로, 같은 문제가 두 번 보고되지 않고 ESLint가 하는 일도 줄어듭니다.

## 설치 {#install}

```sh
npm install --save-dev oxlint eslint-plugin-oxlint \
  eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

## oxlint 설정 {#configure-oxlint}

`npx oxlint --init`으로 `.oxlintrc.json`을 만들고, oxlint가 `<script>` 블록에도 Vue 규칙을 실행하도록 plugins에
`vue`를 추가합니다.

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "vue"],
  "categories": {
    "correctness": "error"
  }
}
```

## ESLint 설정 {#configure-eslint}

oxlint config는 `vuePug.configs.recommended` 뒤, **맨 마지막**에 둡니다.

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'
import oxlint from 'eslint-plugin-oxlint'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  // Last: turn off the rules that .oxlintrc.json already runs.
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
]
```

이 config가 끄는 규칙은 스크립트 규칙(`no-debugger`, `vue/no-dupe-keys`, `vue/valid-define-props` 등)입니다.
템플릿 규칙과 `vue-pug/*` 규칙은 하나도 끄지 않으므로, Pug 템플릿은 oxlint를 쓰지 않을 때와 똑같이 lint되고
포맷됩니다.

## 실행하기 {#run-them}

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint:fix": "oxlint --fix && eslint . --fix"
  }
}
```

oxlint를 먼저 실행합니다. 몇 밀리초면 끝나고, ESLint가 시작하기 전에 에러가 나타납니다. Oxlint는 `.gitignore`에 적힌
파일을 건너뛰므로, 아직 없다면 `node_modules`를 추가하세요.

`&&`는 에러를 보고하는 첫 번째 linter에서 멈춥니다. oxlint가 고칠 수 없는 에러(예: `debugger` 문)를 찾으면
`lint:fix`는 거기서 멈추고 ESLint는 템플릿을 포맷하지 않습니다. 그 에러를 고치거나 `npx eslint . --fix`를
따로 실행하세요.

## VS Code {#vs-code}

ESLint 확장 옆에 [Oxc 확장](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)도 설치하고,
[ESLint 확장](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)과 함께 둘 다 저장할 때
fix하게 하세요.

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```

둘은 같은 것을 고치지 않습니다. oxlint는 스크립트를, ESLint는 템플릿을 고치며, ESLint가 Pug 템플릿에 하는 모든 fix는
여전히 [fix guard](./fix-guard)를 거칩니다.

## ESLint 없이는? {#without-eslint}

아직은 안 됩니다. Oxlint는 JavaScript로 작성된 ESLint 플러그인을 실행할 수 있지만 `.vue` 파일의 `<script>` 블록만
넘겨 주며, Vue 템플릿 같은 커스텀 parser와 파일 언어는 oxc에서 아직 진행 중입니다. oxlint가 Vue 템플릿을 lint할 수
있게 되면 이 플러그인도 뒤따를 수 있습니다. 파서인 `pug-lint-parser`는 ESLint에 의존하지 않기 때문입니다. 그때까지는
`.vue` 템플릿에 ESLint를 계속 사용하세요.
