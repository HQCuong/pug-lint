---
title: API
description: "pug-lint-parser API 레퍼런스: parsePug와 그 옵션, walk, fingerprint, literalSpans, 내보내는 타입."
---

# API

```js
import { parsePug, walk, fingerprint, literalSpans } from 'pug-lint-parser'
```

이 패키지는 ESM 전용이고 의존성이 없으며 TypeScript 타입을 함께 제공합니다. 아래의 모든 노드 타입이 export됩니다
(`import type { Tag, PugDocument } from 'pug-lint-parser'`).

**모든 위치는 전달한 `text`의 offset입니다.** `String.prototype.slice`와 같은 단위인 UTF-16 인덱스입니다.
`Range`는 `[start, end)`이므로 `text.slice(...range)`는 노드의 소스를 돌려주고,
`text.slice(0, start) + replacement + text.slice(end)`는 그 노드를 수정합니다.

## `parsePug(text, options?)` {#parsepug-text-options}

```ts
function parsePug(text: string, options?: ParseOptions): PugDocument

interface ParseOptions {
  start?: number // default 0
  end?: number   // default text.length
}
```

`text[start, end)`를 파싱해 [document](./syntax-tree#pugdocument)를 반환합니다. 예외를 던지지 않습니다.
파싱할 수 없는 부분은 `doc.errors`의 항목이 되고, 파싱은 다음 줄에서 이어집니다([에러](./errors) 참고).

`start`와 `end`를 쓰면 큰 파일의 일부를 복사하지 않고 파싱할 수 있습니다. 예를 들어 `.vue` 파일의
`<template lang="pug">` 블록 내용이 그렇습니다. 범위는 여전히 전체 `text`를 기준으로 합니다.

```js
const sfc = '<template lang="pug">\ndiv\n  p Hi\n</template>\n'
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

doc.range                 // [21, 33]
doc.children[0].name      // { value: 'div', range: [22, 25] }
```

`<template>` 아래로 들여쓴 템플릿처럼 slice의 모든 줄이 같은 양만큼 들여쓰기되어 있으면, 그 공통 들여쓰기를 기준으로
삼습니다. 파서는 Vue가 템플릿을 컴파일하기 전에 하는 것처럼 이를 0열로 취급합니다. Pug 자체는 들여쓴 `.pug`
파일을 거부하므로, 파서는 이 부분에서 Pug 컴파일러보다 관대합니다.

줄바꿈은 LF 또는 CRLF일 수 있고, 단독 CR도 줄바꿈으로 읽습니다. 맨 앞의 BOM은 제거하지 않습니다. 건너뛰려면
`start: 1`을 전달하세요.

## `walk(doc, visit)` {#walk-doc-visit}

```ts
function walk(
  doc: PugDocument,
  visit: (node: PugNode, parent: PugNode | PugDocument) => void,
): void
```

모든 노드에 대해 문서 순서(전위 순회: 노드가 자식보다 먼저)로 `visit`을 호출합니다. `children`과 각 `#[…]`
[tag interpolation](./syntax-tree#text)의 태그 안으로도 들어가며, 후자의 부모는 그것을 감싼 `Text` 노드입니다.

```js
walk(parsePug('if ok\n  p a\nelse\n  +card(1)\n- const x = 1\n//- note\n'), (node, parent) => {
  console.log(node.type, '<', parent.type)
})
// Control < Document     (if)
// Tag < Control
// Text < Tag
// Control < Document     (else)
// MixinCall < Control
// Code < Document
// Comment < Document
```

## `fingerprint(doc)` {#fingerprint-doc}

```ts
function fingerprint(doc: PugDocument): string
```

템플릿의 **구조**를 요약한 문자열입니다. fingerprint가 같은 두 템플릿은 같은 요소 트리를 렌더링합니다. ESLint
플러그인은 fingerprint를 비교해 템플릿을 바꾸는 fix를 거부합니다.

포함하는 것:

- 태그, mixin 호출, 텍스트, 주석, code와 control 블록, 그리고 그 중첩 관계
- 각 태그의 정적 class와 id 집합. **표기 형태와 무관합니다**: `p(class="a b")`와 `p.a.b`는 fingerprint가
  같고, `p.a`는 다릅니다.
- 그 밖의 속성 개수와 각 값의 종류(없음 또는 문자열, 표현식, `${}`가 있는 템플릿)
- Pug가 컴파일하는 모든 JavaScript를 들여쓰기를 제외한 텍스트로: 표현식 및 `${}` 속성 값, `&attributes(…)`, mixin
  인자, code, control head, `#{…}`
- 텍스트의 형태: 줄과 interpolation으로 나뉘는 위치

무시하는 것: 공백과 들여쓰기 너비, 따옴표, 쉼표, 속성 순서와 이름, `class`와 `id` 이외의 문자열 속성 값, 태그 이름의
대소문자, 텍스트 내용, self-closing 태그의 `/`, 블록 확장의 `:`.

```js
fingerprint(parsePug('p(class="a b") Hi')) === fingerprint(parsePug('p.a.b Hi'))  // true
fingerprint(parsePug('p.a Hi')) === fingerprint(parsePug('p.a.b Hi'))             // false
```

문자열의 형식은 API에 포함되지 않습니다. fingerprint는 비교만 하고 파싱하지 마세요.

## `literalSpans(text, range)` {#literalspans-text-range}

```ts
function literalSpans(text: string, range: [number, number]): [number, number][]
```

`text[range]`에 있는 JavaScript 표현식 안의 문자열 리터럴(`'…'`, `"…"`)과 템플릿 리터럴(`` `…` ``)의 범위입니다.
코드와 문자열 내용을 구분할 때 사용합니다. 예를 들어 여러 줄 템플릿 리터럴의 내부를 다시 들여쓰지 않으려는 경우가
있습니다. 닫히지 않은 리터럴은 `range`의 끝까지 이어집니다.

```js
const e = 'f("a", `b ${c}`, d)'
literalSpans(e, [0, e.length])              // [[2, 5], [7, 15]]
                                            // '"a"' and '`b ${c}`'
```

## 타입 {#types}

| 타입 | 설명 |
|---|---|
| `Range` | `[start: number, end: number]`, `text`의 offset |
| `PugDocument` | `parsePug`의 결과: [트리, 줄, 에러](./syntax-tree#pugdocument) |
| `PugNode` | `Tag \| MixinCall \| Text \| Comment \| Code \| Control \| Filter` |
| `Tag`, `MixinCall`, `Text`, `Comment`, `Code`, `Control`, `Filter` | [노드](./syntax-tree#nodes) |
| `AttributeBlock`, `Attribute`, `AttributeValue` | [속성](./syntax-tree#attributes) |
| `TextPart` | `Text` 안의 `Raw`, `Interpolation`, `TagInterpolation` |
| `ControlKeyword` | `Control` 노드의 키워드 |
| `PugLine` | [소스의 한 줄](./syntax-tree#lines) |
| `PugParseError` | [`{ code, message, offset }`](./errors) |
| `ParseOptions` | `{ start?, end? }` |
