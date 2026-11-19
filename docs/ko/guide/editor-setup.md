---
title: 에디터 설정
description: "두 번째 포매터 없이 ESLint 연동만으로 VS Code, WebStorm, Neovim에서 저장할 때 Pug 템플릿을 lint하고 fix합니다."
---

# 에디터 설정

플러그인에는 전용 에디터 확장이 필요 없습니다. ESLint를 실행하는 에디터 연동이라면 어떤 것이든
`eslint.config.js`에서 플러그인을 가져다 씁니다.

## VS Code {#vs-code}

[ESLint 확장](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)을 설치한 뒤
`.vscode/settings.json`에 다음을 추가하세요.

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

저장 시 fix도 `eslint --fix`와 같은 [fix guard](./fix-guard)를 거치므로, 템플릿을 깨뜨릴 fix는 적용되지
않습니다.

다른 포매터(Prettier, Volar의 포매터)도 저장할 때 `.vue` 파일을 포맷한다면, Vue 파일에서는 그 포매터를
끄세요. 그렇지 않으면 Pug를 두고 ESLint와 충돌합니다.

```json
{
  "[vue]": { "editor.formatOnSave": false }
}
```

## 다른 에디터 {#other-editors}

- **WebStorm / JetBrains IDE:** Settings → Languages & Frameworks → JavaScript → Code Quality
  Tools → ESLint에서 *Automatic ESLint configuration*을 선택하고, *Run for files*에 `vue`를 추가한 다음
  *Run eslint --fix on save*를 체크하세요.
- **Neovim:** ESLint language server(nvim-lspconfig의 `eslint`)를 사용하고 `filetypes`에 `vue`를 넣은 뒤,
  저장할 때 `EslintFixAll`을 실행하세요.
