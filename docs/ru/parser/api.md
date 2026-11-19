---
title: "API"
description: "Справочник API pug-lint-parser: parsePug и его опции, walk, fingerprint, literalSpans и экспортируемые типы."
---

# API {#api}

```js
import { parsePug, walk, fingerprint, literalSpans } from 'pug-lint-parser'
```

Пакет только ESM, без зависимостей и поставляется со своими типами TypeScript: каждый приведённый ниже
тип узла экспортируется (`import type { Tag, PugDocument } from 'pug-lint-parser'`).

**Каждая позиция является смещением в переданном вами `text`**: индекс UTF-16, та же единица, что у
`String.prototype.slice`. `Range` — это `[start, end)`, поэтому `text.slice(...range)` возвращает исходник
узла, а `text.slice(0, start) + replacement + text.slice(end)` его правит.

## `parsePug(text, options?)` {#parsepug-text-options}

```ts
function parsePug(text: string, options?: ParseOptions): PugDocument

interface ParseOptions {
  start?: number // default 0
  end?: number   // default text.length
}
```

Разбирает `text[start, end)` и возвращает [документ](./syntax-tree#pugdocument). Он никогда не бросает
исключений: то, что не удалось разобрать, становится записью в `doc.errors`, а разбор продолжается со
следующей строки (см. [Ошибки](./errors)).

`start` и `end` позволяют разобрать часть большого файла без его копирования, например содержимое блока
`<template lang="pug">` в файле `.vue`. Диапазоны по-прежнему относятся ко всему `text`:

```js
const sfc = '<template lang="pug">\ndiv\n  p Hi\n</template>\n'
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

doc.range                 // [21, 33]
doc.children[0].name      // { value: 'div', range: [22, 25] }
```

Когда каждая строка фрагмента имеет один и тот же отступ, как в шаблоне, сдвинутом под `<template>`,
этот общий отступ становится базовым: парсер считает его колонкой 0, как Vue перед компиляцией шаблона.
Сам Pug отвергает файл `.pug` с отступом, так что здесь парсер снисходительнее компилятора Pug.

Окончания строк могут быть LF или CRLF; одиночный CR тоже читается как перевод строки. Ведущий BOM не
отбрасывается: передайте `start: 1`, чтобы его пропустить.

## `walk(doc, visit)` {#walk-doc-visit}

```ts
function walk(
  doc: PugDocument,
  visit: (node: PugNode, parent: PugNode | PugDocument) => void,
): void
```

Вызывает `visit` для каждого узла в порядке документа (прямой обход: узел перед его дочерними). Обход
заходит в `children` и в тег каждой [интерполяции тега](./syntax-tree#text) `#[…]`, родителем которого
является охватывающий узел `Text`.

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

Строка, суммирующая **структуру** шаблона: два шаблона с одинаковым отпечатком отображают одно и то же
дерево элементов. Плагин ESLint сравнивает отпечатки, чтобы отклонять исправления, которые изменили бы
шаблон.

Что она включает:

- теги, вызовы mixin, текст, комментарии, код и управляющие блоки, а также их вложенность;
- набор статических классов и id каждого тега, **в какой бы форме они ни были записаны**: у `p(class="a b")`
  и `p.a.b` одинаковый отпечаток, а у `p.a` другой;
- число остальных атрибутов и вид каждого значения (нет или строка, выражение, шаблон с `${}`);
- каждый фрагмент JavaScript, который компилирует Pug, по его тексту с точностью до отступа: значения
  атрибутов-выражений и с `${}`, `&attributes(…)`, аргументы mixin, код, заголовки управляющих конструкций
  и `#{…}`;
- форму текста: где он разбит на строки и интерполяции.

Что она игнорирует: пробельные символы и ширину отступа, кавычки, запятые, порядок и имена атрибутов,
строковые значения атрибутов, кроме `class` и `id`, регистр имён тегов, содержимое текста, `/` у
самозакрывающегося тега и `:` у раскрытия блока.

```js
fingerprint(parsePug('p(class="a b") Hi')) === fingerprint(parsePug('p.a.b Hi'))  // true
fingerprint(parsePug('p.a Hi')) === fingerprint(parsePug('p.a.b Hi'))             // false
```

Формат строки не входит в API: сравнивайте отпечатки, не разбирайте их.

## `literalSpans(text, range)` {#literalspans-text-range}

```ts
function literalSpans(text: string, range: [number, number]): [number, number][]
```

Диапазоны строковых литералов (`'…'`, `"…"`) и шаблонных литералов (`` `…` ``) внутри выражения
JavaScript в `text[range]`. Используйте её, чтобы отличать код от содержимого строк, например чтобы не
переотступать внутренность многострочного шаблонного литерала. Незавершённый литерал тянется до конца
`range`.

```js
const e = 'f("a", `b ${c}`, d)'
literalSpans(e, [0, e.length])              // [[2, 5], [7, 15]]
                                            // '"a"' and '`b ${c}`'
```

## Типы {#types}

| Тип | Что это |
|---|---|
| `Range` | `[start: number, end: number]`, смещения в `text` |
| `PugDocument` | Результат `parsePug`: [дерево, строки и ошибки](./syntax-tree#pugdocument) |
| `PugNode` | `Tag \| MixinCall \| Text \| Comment \| Code \| Control \| Filter` |
| `Tag`, `MixinCall`, `Text`, `Comment`, `Code`, `Control`, `Filter` | [Узлы](./syntax-tree#nodes) |
| `AttributeBlock`, `Attribute`, `AttributeValue` | [Атрибуты](./syntax-tree#attributes) |
| `TextPart` | `Raw`, `Interpolation` или `TagInterpolation` внутри `Text` |
| `ControlKeyword` | Ключевое слово узла `Control` |
| `PugLine` | [Одна строка исходника](./syntax-tree#lines) |
| `PugParseError` | [`{ code, message, offset }`](./errors) |
| `ParseOptions` | `{ start?, end? }` |
