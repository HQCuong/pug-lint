---
title: 에러
description: "pug-lint-parser 에러 코드와 예시, 에러 후 파서가 복구하는 방법, offset을 줄과 열로 바꾸는 방법."
---

# 에러

`parsePug`는 예외를 던지지 않습니다. 파싱할 수 없는 부분은 `doc.errors`의 항목이 되고, 템플릿의 나머지는 계속
파싱됩니다.

```ts
interface PugParseError {
  code: string     // one of the codes below
  message: string  // for people; may change between versions
  offset: number   // where the problem is, as an offset into text
}
```

`message`가 아니라 `code`로 구분하세요. 줄과 열을 보여 주려면 offset에서 계산합니다.

```js
const before = text.slice(0, error.offset)
const line = before.split('\n').length                    // 1-based
const column = error.offset - before.lastIndexOf('\n')    // 1-based
```

## 복구 {#recovery}

에러가 나도 파싱은 멈추지 않습니다. 파서는 잘못된 구문의 끝, 또는 줄의 끝까지 건너뛰고 다음 줄에서 이어 갑니다.
자식을 가질 수 없는 구문 아래에 중첩된 줄처럼 에러 뒤에 자리를 잡을 수 없는 줄은 `doc.lines`에 `continuation`
종류로 남고, 그 줄에 대한 노드는 만들어지지 않습니다.

```js
parsePug('div\n  p(class="a)\n  span ok\n  li(a=1 a=2)\n').errors
// [
//   { code: 'unterminated-string', message: 'Unterminated string', offset: 14 },
//   { code: 'duplicate-attribute', message: 'Duplicate attribute "a"', offset: 37 },
// ]
```

ESLint 플러그인은 에러가 있는 템플릿 안에서는 검사할 수 없으므로 어떤 fix도 적용하지 않습니다.

## 코드 {#codes}

| `code` | 예시 | 메시지 |
|---|---|---|
| `unterminated-string` | `p(title="hi) x` | Unterminated string |
| `unclosed-attributes` | `p(title="hi"` | Attribute block is not closed with ")" |
| `unclosed-arguments` | `+card(1, 2` | Mixin arguments are not closed with ")" |
| `missing-attribute-value` | `p(title=) x` | Expected a value after the operator |
| `duplicate-attribute` | `p(a="1" a="2")` | Duplicate attribute "a" |
| `unexpected-character` | `p(a!b) x` | Expected "=" after "!" |
| `unbalanced-key` | `p([a="1") x` | Unclosed "[" in an attribute key |
| `bad-escape` | `p(a="\x")` | Invalid escape sequence in a JavaScript string |
| `inconsistent-indentation` | 공백으로 들여쓴 줄들 사이에 탭으로 들여쓴 줄 | Invalid indentation, you can use tabs or spaces but not both |
| `unterminated-interpolation` | `p Hi #{name` | Interpolation is not closed with "}" |
| `unsupported-syntax` | `#{tag} x` | Unsupported syntax: "#{tag} x" |

각 코드는 비슷한 문제들을 묶은 것입니다. `unexpected-character`, `unbalanced-key`,
`inconsistent-indentation`, `unsupported-syntax`에는 메시지가 여러 개 있습니다.

이 코드들은 Pug 컴파일러가 거부하는 것과 일치하지만, 의도적인 차이가 하나 있습니다. `'…'`나 `"…"` 속성 값 안의
줄바꿈은 JavaScript처럼 `unterminated-string`입니다. 여러 줄 값에는 백틱을 사용하세요.

## `unsupported-syntax` {#unsupported-syntax}

이 코드는 파서가 처리하지 않는 유효한 Pug를 나타냅니다. 보간된 태그 이름(`#{tag}`)이나 태그 없는 텍스트 블록이 그
예입니다. 일부 구문은 에러 없이 파싱되지만 Pug와는 다르게 파싱됩니다. 두 목록은
[지원하지 않는 Pug 구문](/ko/guide/unsupported-syntax)에 있습니다.
