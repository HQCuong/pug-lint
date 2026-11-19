---
title: 지원하지 않는 Pug 구문
description: "pug-lint-parser가 지원하지 않는 것으로 보고하거나 Pug 컴파일러와 다르게 파싱하는 Pug 구문과, 이를 다시 쓰는 방법."
---

# `unsupported-syntax`로 보고되는 구문

파서는 예외를 던지지 않습니다. 모델링하지 않는 입력은 읽을 수 없는 첫 offset에서 `unsupported-syntax` 에러가
되고, 그 줄의 나머지는 건너뜁니다. 이 문서는 이 에러가 나는 모든 알려진 경우를 나열합니다. 이외의 이유로
`unsupported-syntax`가 나온다면 버그입니다.

"Invalid Pug"는 Pug 자체가 거부하는 형태를 뜻합니다. 파서가 이런 형태에도 이 코드를 보고하기 때문에 목록에
포함했습니다.

## 줄 {#lines}

| 형태 | 예시 | 비고 |
| --- | --- | --- |
| 보간된 태그 이름 | `#{tag} text`, `#{tag}/` | |
| 보간된 mixin 이름 | `+#{name}()` | `+ name`(`+` 뒤에 공백)은 mixin 호출입니다. |
| 태그 없는 텍스트 블록 | `.`만 있는 줄과 그 아래에 중첩된 텍스트 줄 | Pug는 텍스트를 부모에 넣습니다. `\|` 줄을 사용하세요. |
| 줄 시작의 tag interpolation 또는 mustache | `#[b x] y`, `{{ x }}` | `\| #[b x] y` / `\| {{ x }}`를 사용하세요. |
| 그 밖에 Pug 구문으로 시작하지 않는 것 | `)`, `@x`, `.5` | |
| 파이프 텍스트 아래에 중첩된 줄 | `\| a` 아래에 들여쓴 `p` | Invalid Pug. 첫 번째 중첩된 줄에서 한 번만 보고하고, 중첩된 줄은 건너뛰어 에러 복구 영역(`doc.lines`의 `continuation` 종류)이 됩니다. 리터럴 HTML(`<ul>`) 아래에 중첩된 줄은 유효합니다. Pug는 이를 형제로 만들고 파서도 마찬가지입니다. |
| buffered code 아래에 중첩된 줄 | `= x` 또는 `!= x` 아래에 들여쓴 `p` | Invalid Pug. 파이프 텍스트 아래와 같이 보고하고 복구합니다. `p= x` 아래의 줄은 Pug와 같이 `p`의 자식입니다. |

## 태그 또는 mixin 호출 head 뒤 {#after-a-tag-or-mixin-call-head}

| 형태 | 예시 | 비고 |
| --- | --- | --- |
| 태그 뒤의 unbuffered code | `p- x` | |
| `.` 뒤에 같은 줄의 내용이 더 있음 | `p. text`, `p.: a` | Invalid Pug. |
| mixin 호출 뒤의 텍스트 블록 | `+m.` | |
| mixin 호출 뒤의 블록 확장 | `+m: p` | `MixinCall`에는 `expansion` 필드가 없습니다. 자식으로는 괜찮습니다: `li: +m`. |
| mixin 호출 뒤의 `/` | `+m/` | |
| `/` 뒤의 블록 확장 | `img/: x` | Invalid Pug. |
| `:` 뒤에 공백과 자식이 오지 않음 | `li:`, `li(x):b`, `when 1:` | Invalid Pug. |
| 태그나 mixin 호출이 아닌 확장 자식 | `li: \| x`, `li: <b>x</b>`, `li: = x`, `li: // c`, `li: if x`, `when 1: each x in y` | 여기서 control 키워드는 태그 이름으로 읽지 않습니다. |
| 인라인 filter가 뒤따르는 태그 | `p: :markdown text` | |

## Control head {#control-heads}

| 형태 | 예시 | 비고 |
| --- | --- | --- |
| 조건문 또는 반복문 뒤의 블록 확장 | `else: p`, `else : p`, `if x: p`, `unless x: p`, `else if x: p`, `while x: p`, `case x: p`, `each a in b: p`, `for a in b: p` | Invalid Pug. 문자열과 괄호 밖에 있고 최상위 `?`를 닫지 않는 head의 첫 `:`에서 보고합니다(그래서 `if a ? b : c`와 `each v in {a: 1}`은 괜찮습니다). 확장은 `when`과 `default` 뒤에서는 동작합니다: `when 1: p a`. |

## Filter {#filters}

| 형태 | 예시 | 비고 |
| --- | --- | --- |
| filter head 뒤에 텍스트가 아닌 것 | `:a(x):b`, `:md.x` | 중첩된 filter는 `:a:b(attrs)` 형태로만 읽으며, 속성은 마지막 이름 뒤에 둡니다. |

## Tag interpolation `#[…]` {#tag-interpolation}

| 형태 | 예시 | 비고 |
| --- | --- | --- |
| 태그로 시작하지 않음 | `#[+m]`, `#[\| x]`, `#[- x]`, `#[:cdata x]` | mixin 호출, 텍스트, code, filter는 `#[…]` 안에서 읽지 않습니다. |
| head 뒤에 텍스트, `=`/`!=` code, `: child`가 아닌 것이 옴 | `#[p.]`, `#[p- x]`, `#[img/: x]` | |

## 에러 없이 파싱되지만 Pug와는 다르게 파싱되는 것 {#parsed-without-an-error-but-not-as-pug-does}

차등 oracle(`tests/oracle`, Task 17)에서 발견했습니다.

| 형태 | 예시 | 비고 |
| --- | --- | --- |
| block 이름 뒤의 주석 | `block content // c` | Pug는 이름을 `//`에서 끝내고 나머지를 형제 주석으로 만들며, 이 주석이 중첩된 줄도 가져갑니다. 파서는 이를 `block` head에 둡니다. |
| 중복된 속성 또는 id | `a(x=1 x=2)`, `#a#b` | Pug는 거부하지만 파서는 받아들입니다. |
| `each` 뒤의 빈 `else` | `each x in y` … 중첩된 것이 없는 `else` | Pug는 거부하지만 파서는 받아들입니다. |
