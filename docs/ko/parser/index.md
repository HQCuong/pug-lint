---
title: pug-lint-parser
description: "pug-lint-parser: lint 및 포맷 도구를 위한 Pug 파서. 정확한 소스 범위와 에러 복구를 제공하고, 예외를 던지지 않으며, 의존성이 없습니다."
---

# pug-lint-parser

lint 및 포맷 도구를 위해 만든 Pug 템플릿용 구체 구문 트리(CST) 파서입니다.
[`eslint-plugin-pug-vue`](https://github.com/HQCuong/pug-lint/tree/main/packages/eslint-plugin)의 바탕이 되는
파서입니다.

- **예외를 던지지 않습니다.** 파싱할 수 없는 입력은 `errors`의 항목이 되고, 파싱은 다음 줄에서 계속됩니다.
- **정확한 소스 범위.** 모든 노드, 속성, 값, 축약 표기, 쉼표, 줄에 `[start, end)` 범위가 있습니다. 전달한 텍스트에
  대한 UTF-16 offset이므로, 위치를 보정하지 않고도 소스를 잘라 내거나 최소한의 수정을 만들 수 있습니다.
- **일부만 그 자리에서 파싱합니다.** `parsePug(text, { start, end })`는 `text[start, end)`만 파싱합니다(예: `<template lang="pug">`
  블록의 내용). 범위는 여전히 전체 `text`를 기준으로 합니다.
- **줄바꿈을 유지합니다.** LF와 CRLF를 모두 처리하며, `doc.eol`은 처음 발견된 줄바꿈입니다.
- 런타임 의존성이 없습니다. ESM 전용입니다. Node.js `^22.13.0 || >=24`.

## 사용법 {#usage}

```js
import { parsePug, walk } from 'pug-lint-parser'

const text = 'ul#list\n  li.item(v-for="x in xs" :key="x") {{ x }}\n'
const doc = parsePug(text)

console.log(doc.errors) // []
walk(doc, (node) => {
  if (node.type === 'Tag') console.log(node.name?.value ?? 'div', text.slice(...node.range))
})
// ul ul#list
// li li.item(v-for="x in xs" :key="x") {{ x }}
```

## API {#api}

모든 노드 타입을 포함한 전체 레퍼런스는 사이트에 있습니다: [API](/ko/parser/api),
[구문 트리](/ko/parser/syntax-tree), [에러](/ko/parser/errors), [레시피](/ko/parser/recipes).

- `parsePug(text, options?)` → `PugDocument`. `options.start` / `options.end`는 파싱을 `text`의 해당 범위로
  제한합니다.
- `walk(doc, visit)`: 태그 interpolation(`#[…]`) 안의 태그를 포함해 모든 노드에 대해 문서 순서대로
  `visit(node, parent)`를 호출합니다.
- `fingerprint(doc)` → `string`: 트리의 구조 요약(태그와 그 중첩, class와 id 집합, 속성 개수, 텍스트와
  interpolation의 형태). 공백, 따옴표, 속성 순서, 정적 `class`와 `id`를 제외한 속성 이름과 값, 태그 이름의 대소문자,
  텍스트 내용, code와 control head의 내용은 무시하므로 `p(class="a b")`와 `p.a.b`의 fingerprint는 같습니다.
  ESLint 플러그인은 fingerprint를 비교해 템플릿의 구조를 바꾸는 fix를 거부합니다.
- `literalSpans(text, range)` → JavaScript 표현식 안의 문자열 리터럴과 템플릿 리터럴의 범위.
- 모든 노드의 타입: `PugDocument`, `PugNode`, `Tag`, `AttributeBlock`, `Attribute`, `AttributeValue`, `Text`,
  `Comment`, `Code`, `Control`, `MixinCall`, `Filter`, `PugLine`, `PugParseError` 등(`src/ast.ts` 참고).

`PugDocument`에는 `children`(트리), `errors`(`{ code, message, offset }`), `lines`(들여쓰기 범위, 종류, 논리적
depth를 담은 소스 줄별 항목), `eol`, `indentUnit`이 있습니다.

## 지원하지 않는 구문 {#unsupported-syntax}

일부 Pug 구문은 에러 코드 `unsupported-syntax`로 보고되고, 몇몇은 에러 없이 파싱되지만 Pug와는 다르게 파싱됩니다.
이들은
[docs/unsupported-syntax.md](https://github.com/HQCuong/pug-lint/blob/main/packages/pug-parser/docs/unsupported-syntax.md)에
나열되어 있습니다.

## 라이선스 {#license}

MIT
