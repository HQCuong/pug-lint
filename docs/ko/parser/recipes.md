---
title: 레시피
description: "pug-lint-parser로 만드는 작은 프로그램: class 목록 뽑기, fingerprint로 검증하는 안전한 codemod, .vue 파일의 템플릿 검사, 노드 찾기."
---

# 레시피

`pug-lint-parser`로 만드는 작은 프로그램들입니다. 각각 `npm install pug-lint-parser`만 하면 ES 모듈(`.mjs`
또는 `package.json`의 `"type": "module"`)에서 그대로 실행됩니다.

## 템플릿에서 쓰는 class 목록 뽑기 {#list-the-classes-a-template-uses}

class는 `.class` 축약 표기와 정적 `class="…"` 값에서 나옵니다. `:class`는 Vue 바인딩이고 `class=expr`은 Pug
JavaScript이므로, 둘 다 이름 목록이 아닙니다.

```js
import { parsePug, walk } from 'pug-lint-parser'

const text = `nav.menu(class="dark wide")
  a.item#home(href="/") Home
  a(class="item", :class="{ active }") Docs
`
const doc = parsePug(text)
const classes = new Set()

walk(doc, (node) => {
  if (node.type !== 'Tag') return
  for (const s of node.shorthands) {
    if (s.kind === 'class') classes.add(s.value)
  }
  for (const block of node.attributeBlocks) {
    for (const attr of block.attributes) {
      // Only static strings: `:class` is a Vue binding, `class=expr` is Pug JavaScript.
      if (attr.key.raw !== 'class' || attr.value?.kind !== 'string') continue
      for (const name of text.slice(...attr.value.inner).split(/\s+/)) {
        if (name) classes.add(name)
      }
    }
  }
})

console.log([...classes]) // [ 'menu', 'dark', 'wide', 'item' ]
```

## 따옴표를 안전하게 바꾸기 {#rewrite-quotes-safely}

codemod는 범위 기준으로 소스를 수정하되, 앞쪽 범위가 유효하게 유지되도록 마지막 수정부터 첫 수정 순으로 적용합니다.
그런 다음 ESLint 플러그인처럼 자신의 출력을 검사합니다. 결과가 파싱되어야 하고 [fingerprint](./api#fingerprint-doc)가
같아야 합니다.

```js
import { fingerprint, parsePug, walk } from 'pug-lint-parser'

/** Rewrite '…' attribute values as "…", unless the value contains a double quote. */
function doubleQuotes(text) {
  const doc = parsePug(text)
  if (doc.errors.length > 0) return text // never edit a template that does not parse

  const edits = []
  walk(doc, (node) => {
    if (node.type !== 'Tag' && node.type !== 'MixinCall') return
    for (const block of node.attributeBlocks) {
      for (const { value } of block.attributes) {
        if (value?.kind !== 'string' || value.quote !== "'") continue
        const inner = text.slice(...value.inner)
        if (inner.includes('"')) continue
        edits.push({ range: value.range, text: `"${inner}"` })
      }
    }
  })

  // Apply from the end, so the earlier ranges stay valid.
  let out = text
  for (const { range, text: replacement } of edits.sort((a, b) => b.range[0] - a.range[0])) {
    out = out.slice(0, range[0]) + replacement + out.slice(range[1])
  }

  // The same check the ESLint plugin makes: the structure must not change.
  const after = parsePug(out)
  if (after.errors.length > 0 || fingerprint(after) !== fingerprint(doc)) return text
  return out
}

console.log(doubleQuotes(`a(href='/docs' title='Say "hi"') Docs\n`))
// a(href="/docs" title='Say "hi"') Docs
```

## `.vue` 파일의 템플릿 검사하기 {#check-the-template-of-a-vue-file}

`start`와 `end`로 템플릿의 내용만 파싱합니다. offset은 여전히 전체 파일을 가리키므로 에디터 위치로 바로 바꿀 수
있습니다.

```js
import { parsePug } from 'pug-lint-parser'

const sfc = `<template lang="pug">
div
  p(class="oops) Hi
</template>
`
// Parse only the template's content; ranges and offsets still refer to the whole file.
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

for (const error of doc.errors) {
  const before = sfc.slice(0, error.offset)
  const line = before.split('\n').length
  const column = error.offset - before.lastIndexOf('\n')
  console.log(`${line}:${column} ${error.code}: ${error.message}`)
}
// 3:11 unterminated-string: Unterminated string
```

## 한 종류의 노드 찾기 {#find-nodes-of-one-kind}

`walk`는 모든 노드를 부모와 함께 방문합니다. `vue-pug/no-pug-control-flow` 규칙처럼 Vue 템플릿에서 쓰지 말아야 할
Pug 전용 구문을 찾으려면 다음과 같이 합니다.

```js
import { parsePug, walk } from 'pug-lint-parser'

const text = 'ul\n  each item in items\n    li= item\n'
walk(parsePug(text), (node) => {
  if (node.type === 'Control' || node.type === 'Code') {
    console.log(node.type, text.slice(...node.range))
  }
})
// Control each item in items
// Code = item
```
