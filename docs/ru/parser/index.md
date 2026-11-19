---
title: pug-lint-parser
description: "pug-lint-parser: парсер Pug для инструментов линтинга и форматирования, с точными диапазонами в исходнике и восстановлением после ошибок. Он никогда не бросает исключений и не имеет зависимостей."
---

# pug-lint-parser

Парсер конкретного синтаксического дерева (CST) для шаблонов Pug, созданный для инструментов линтинга и
форматирования. Это парсер, на котором работает [`eslint-plugin-pug-vue`](https://github.com/HQCuong/pug-lint/tree/main/packages/eslint-plugin).

- **Никогда не бросает исключений.** Ввод, который он не может разобрать, становится записью в `errors`,
  а разбор продолжается со следующей строки.
- **Точные диапазоны в исходнике.** У каждого узла, атрибута, значения, сокращения, запятой и строки есть
  диапазон `[start, end)`: смещения UTF-16 в переданном вами тексте, так что можно вырезать фрагмент
  исходника или построить минимальную правку без пересчёта позиций.
- **Разбирает фрагмент на месте.** `parsePug(text, { start, end })` разбирает только `text[start, end)`
  (например, содержимое блока `<template lang="pug">`); диапазоны по-прежнему относятся ко всему `text`.
- **Сохраняет окончания строк.** Поддерживаются LF и CRLF; `doc.eol` — первое найденное окончание строки.
- Без зависимостей времени выполнения. Только ESM. Node.js `^20.19.0 || ^22.13.0 || >=24`.

## Использование {#usage}

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

Полный справочник со всеми типами узлов находится на сайте: [API](/ru/parser/api),
[синтаксическое дерево](/ru/parser/syntax-tree), [ошибки](/ru/parser/errors) и
[рецепты](/ru/parser/recipes).

- `parsePug(text, options?)` → `PugDocument`. `options.start` / `options.end` ограничивают разбор этим
  диапазоном `text`.
- `walk(doc, visit)`: вызывает `visit(node, parent)` для каждого узла в порядке документа, включая теги
  внутри интерполяций тегов (`#[…]`).
- `fingerprint(doc)` → `string`: структурная сводка дерева (теги и их вложенность, наборы классов и id,
  число атрибутов, форма текста и интерполяции). Она игнорирует пробельные символы, кавычки, порядок
  атрибутов, имена и значения атрибутов, кроме статических `class` и `id`, регистр имён тегов, содержимое
  текста и содержимое кода и заголовков управляющих конструкций, поэтому у `p(class="a b")` и `p.a.b`
  одинаковый отпечаток. Плагин ESLint сравнивает отпечатки, чтобы отклонять исправления, меняющие структуру
  шаблона.
- `literalSpans(text, range)` → диапазоны строковых и шаблонных литералов в выражении JavaScript.
- Типы для каждого узла: `PugDocument`, `PugNode`, `Tag`, `AttributeBlock`, `Attribute`,
  `AttributeValue`, `Text`, `Comment`, `Code`, `Control`, `MixinCall`, `Filter`, `PugLine`,
  `PugParseError` и другие (см. `src/ast.ts`).

У `PugDocument` есть `children` (дерево), `errors` (`{ code, message, offset }`), `lines` (по записи на
каждую строку исходника с диапазоном её отступа, видом и логической глубиной), `eol` и `indentUnit`.

## Неподдерживаемый синтаксис {#unsupported-syntax}

О некоторых формах Pug сообщается с кодом ошибки `unsupported-syntax`, а несколько форм разбираются без
ошибки, но не так, как в Pug. Они перечислены в
[docs/unsupported-syntax.md](https://github.com/HQCuong/pug-lint/blob/main/packages/pug-parser/docs/unsupported-syntax.md).

## Лицензия {#license}

MIT
