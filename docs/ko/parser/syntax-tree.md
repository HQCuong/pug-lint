---
title: 구문 트리
description: "pug-lint-parser의 구체 구문 트리: 모든 노드 타입, 속성과 그 값, 텍스트 부분, 포매터에 필요한 줄별 정보."
---

# 구문 트리

`parsePug`는 **구체(concrete)** 구문 트리를 반환합니다. 템플릿이 무엇을 의미하는지뿐 아니라 어떻게 쓰였는지도
유지합니다. 모든 축약 표기, 괄호, 쉼표, 따옴표, 줄에 [range](./api)가 있으므로, 도구는 그중 어느 것이든
가리킬 수 있고 나머지를 건드리지 않고 하나만 고쳐 쓸 수도 있습니다.

## `PugDocument` {#pugdocument}

```ts
interface PugDocument {
  type: 'Document'
  text: string             // the text passed to parsePug
  range: Range             // [start, end) that was parsed
  children: PugNode[]      // the top-level nodes
  errors: PugParseError[]  // see Errors
  lines: PugLine[]         // one entry per source line, see Lines
  eol: '\n' | '\r\n'       // the first line ending found; '\n' if there is none
  indentUnit: string       // the indentation of the first nested line, relative to its parent; '  ' if none
}
```

`eol`과 `indentUnit`은 파일이 이미 어떤 줄바꿈과 들여쓰기를 쓰는지 포매터에게 알려 줍니다.

## 노드 {#nodes}

```ts
type PugNode = Tag | MixinCall | Text | Comment | Code | Control | Filter
```

노드의 `range`는 **자기 자신의 줄**만 포함하고, 그 아래에 중첩된 줄은 포함하지 않습니다. 중첩된 줄은
`children`에 있습니다. 중첩된 줄을 가질 수 있는 노드는 `Tag`, `MixinCall`, `Code`, `Control`입니다.

### `Tag` {#tag}

`a.btn#go(href="/x" :title="t") Go`는 다음과 같이 파싱됩니다.

```js
{
  type: 'Tag',
  range: [0, 33],                                   // the whole head line
  name: { value: 'a', range: [0, 1] },              // null for an implicit div: .card
  shorthands: [
    { kind: 'class', value: 'btn', range: [1, 5] }, // range includes the '.'
    { kind: 'id', value: 'go', range: [5, 8] },     // and the '#'
  ],
  attributeBlocks: [{ range: [8, 30], attributes: [/* see Attributes */], commas: [] }],
  andAttributes: [],                                // &attributes(obj): { range, expression }
  selfClose: null,                                  // the '/' of img/
  dot: null,                                        // the '.' of p. (text block)
  expansion: null,                                  // the ':' of li: a
  children: [{ type: 'Text', form: 'inline', range: [31, 33], content: [31, 33], parts: [/* … */] }],
}
```

인라인 텍스트(`p Hi`), buffered code(`p= msg`), 블록 확장의 자식(`li: a`), 중첩된 줄은 모두 `children`에
들어갑니다.

### `MixinCall` {#mixincall}

`+card(title, 2).wide(x="1")`: 태그와 비슷하며, `name`(`+`를 뺀 `card`)과 `args`(괄호를 포함한 인자의 range,
`(title, 2)`, 괄호가 없으면 `null`)가 있습니다. 태그와 마찬가지로 `shorthands`, `attributeBlocks`,
`andAttributes`, `children`을 가집니다.

### `Text` {#text}

```ts
interface Text {
  type: 'Text'
  form: 'inline' | 'pipe' | 'block' | 'html'
  range: Range
  content: Range       // the text itself, after `| ` or the tag
  parts: TextPart[]
}
```

| `form` | 소스 |
|---|---|
| `inline` | `p Hello` (같은 줄에서 태그 뒤에 오는 텍스트) |
| `pipe` | `\| Hello` (줄마다 노드 하나) |
| `block` | `p.`, `script.` 등의 아래에 있는 줄들 |
| `html` | 리터럴 HTML 한 줄, `<b>Hello</b>` |

`parts`는 텍스트를 일반 텍스트와 interpolation으로 나눕니다. `p Hello #{name}, #[b bold] and {{ x }}`의 경우는
다음과 같습니다.

| Part | 소스 |
|---|---|
| `{ type: 'Raw' }` | `Hello ` |
| `{ type: 'Interpolation', escaped, expression }` | `#{name}` (`!{…}`는 `escaped: false`) |
| `{ type: 'Raw' }` | `, ` |
| `{ type: 'TagInterpolation', tag }` | `#[b bold]`, `tag`는 완전한 `Tag` 노드 |
| `{ type: 'Raw' }` | ` and {{ x }}` |

`{{ }}`는 나누지 않습니다. Vue의 것이므로 일반 텍스트에 남습니다.

### `Comment`, `Code`, `Control`, `Filter` {#comment-code-control-filter}

| 노드 | 소스 | 필드 |
|---|---|---|
| `Comment` | `// shown`, `//- hidden`, 그리고 그 아래에 중첩된 줄 | `buffered`(`//`는 true, `//-`는 false), `content` |
| `Code` | `- const x = 1`, `= value`, `!= html`, 태그의 자식인 `p= value` | `buffered`, `escaped`, `expression`, `children` |
| `Control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default`, `mixin`, `block`, `append`, `prepend`, `include`, `extends`, `doctype`, `yield` | `keyword`, `head`(줄의 나머지), `children` |
| `Filter` | `:markdown-it`과 그 텍스트 줄 | `name`, `attributeBlocks`, `children`(`Text` 노드) |

## 속성 {#attributes}

```ts
interface AttributeBlock {
  range: Range        // includes '(' and ')'
  attributes: Attribute[]
  commas: Range[]     // the commas between attributes, if any
}

interface Attribute {
  range: Range
  key: { raw: string; range: Range }                  // href, :title, @click, v-model.trim
  operator: { value: '=' | '!='; range: Range } | null // null for a boolean attribute: disabled
  value: AttributeValue | null
}

interface AttributeValue {
  range: Range
  raw: string
  kind: 'string' | 'template' | 'expression'
  quote: '"' | "'" | '`' | null
  inner: Range | null       // between the quotes; null for an expression
  hasSubstitution: boolean  // a template literal with ${…}
}
```

태그는 블록을 둘 이상 가질 수 있으므로(`a(x)(y)`는 유효한 Pug) `attributeBlocks`는 목록입니다. 보통은 비어 있거나
항목이 하나입니다.

| `kind` | 해당하는 경우 | 예시 |
|---|---|---|
| `string` | 값 **전체**가 `'…'` 또는 `"…"` 리터럴 하나 | `href="/x"` |
| `template` | 값 전체가 `` `…` `` 리터럴 하나 | ``title=`Hi ${name}` `` |
| `expression` | 그 밖의 모든 경우: Pug가 JavaScript로 컴파일합니다 | `href=url`, `title="a" + b` |

Vue 입장에서 `string` 값은 directive나 속성이 받는 값입니다(`:title="t"`는 `t`를 바인딩합니다). `expression`
값은 Vue가 보기 전에 Pug가 컴파일 타임에 평가합니다.

## 줄 {#lines}

`doc.lines`에는 파싱한 범위의 소스 줄마다 항목이 하나씩 있습니다. "이 줄에 무엇이 있고 얼마나 깊이 들여써야
하는가"에 답하는 정보로, 포매터에는 필요하지만 트리만으로는 알 수 없습니다.

```ts
interface PugLine {
  range: Range          // the line, without its line ending
  indent: Range         // its leading whitespace
  kind: 'node' | 'attribute' | 'paren-close' | 'raw' | 'continuation' | 'blank'
  depth: number
  anchor: number | null // index into lines; see below
}
```

다음 템플릿을 예로 들면:

```pug
ul#list
  li(
    v-for="x in xs"
    :key="x"
  ) {{ x }}
  p.
    some text
```

| 줄 | `kind` | `depth` |
|---|---|---|
| `ul#list` | `node` | 0 |
| `  li(` | `node` | 1 |
| `    v-for="x in xs"` | `attribute` | 2 |
| `    :key="x"` | `attribute` | 2 |
| `  ) {{ x }}` | `paren-close` | 1 |
| `  p.` | `node` | 1 |
| `    some text` | `raw` | 2 |
| *(마지막 줄바꿈 뒤)* | `blank` | 0 |

| `kind` | 줄 | `depth` |
|---|---|---|
| `node` | 노드를 시작함 | 노드의 중첩 깊이 |
| `attribute` | 여러 줄 속성 블록 안 | 태그의 depth + 1 |
| `paren-close` | 블록을 닫는 `)`로 시작함 | 태그의 depth |
| `raw` | 텍스트 블록, 주석, code 블록, filter 안 | 소유자의 depth + 1 |
| `continuation` | 위의 줄에서 이어짐(여러 줄 값), 또는 에러 뒤에 건너뜀 | 그 줄의 depth + 1 |
| `blank` | 비어 있거나 공백뿐임 | 0 |

`anchor`는 `depth`를 따르지 않고 **다른 줄을 기준으로 한 열**을 유지해야 하는 줄에 설정됩니다. 텍스트 블록의 첫
줄 이후 줄들(첫 줄에 anchor됨)과 continuation 줄(이어지는 줄에 anchor됨)이 그렇습니다. 다음 예에서

```pug
p.
  one
    two
p(title=`a
  b`) x
```

`two` 줄은 `one` 줄에 anchor되고, `title` 값의 두 번째 줄은 바로 위 줄에 anchor됩니다. 포매터가 anchor가 되는 줄을
옮기면 이 줄들도 같은 만큼 옮깁니다.
