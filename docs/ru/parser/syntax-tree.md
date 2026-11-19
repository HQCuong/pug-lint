---
title: "Синтаксическое дерево"
description: "Конкретное синтаксическое дерево pug-lint-parser: все типы узлов, атрибуты и их значения, части текста и построчная информация, нужная форматировщикам."
---

# Синтаксическое дерево {#syntax-tree}

`parsePug` возвращает **конкретное** синтаксическое дерево: помимо того, что шаблон означает, оно хранит,
как он записан. У каждого сокращения, скобки, запятой, кавычки и строки есть [диапазон](./api), так что
инструмент может указать на любую из них или переписать одну, не трогая остальные.

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

`eol` и `indentUnit` сообщают форматировщику, какие окончания строк и какой отступ файл уже использует.

## Узлы {#nodes}

```ts
type PugNode = Tag | MixinCall | Text | Comment | Code | Control | Filter
```

`range` узла охватывает **его собственные строки**, а не вложенные под ним строки; те находятся в
`children`. Узлы, принимающие вложенные строки, — это `Tag`, `MixinCall`, `Code` и `Control`.

### `Tag` {#tag}

`a.btn#go(href="/x" :title="t") Go` разбирается в:

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

Встроенный текст (`p Hi`), буферизованный код (`p= msg`), дочерний элемент раскрытия блока (`li: a`) и
вложенные строки — всё это попадает в `children`.

### `MixinCall` {#mixincall}

`+card(title, 2).wide(x="1")`: как тег, с `name` (`card`, без `+`) и `args` — диапазоном аргументов вместе со
скобками, `(title, 2)` (`null`, если их нет). У него есть `shorthands`, `attributeBlocks`, `andAttributes` и
`children`, как у тега.

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

| `form` | Исходник |
|---|---|
| `inline` | `p Hello` (текст после тега на той же строке) |
| `pipe` | `\| Hello` (по одному узлу на строку) |
| `block` | строки под `p.`, `script.`, … |
| `html` | строка литерального HTML, `<b>Hello</b>` |

`parts` разбивает текст на обычный текст и интерполяции. Для `p Hello #{name}, #[b bold] and {{ x }}`:

| Часть | Исходник |
|---|---|
| `{ type: 'Raw' }` | `Hello ` |
| `{ type: 'Interpolation', escaped, expression }` | `#{name}` (у `!{…}` `escaped: false`) |
| `{ type: 'Raw' }` | `, ` |
| `{ type: 'TagInterpolation', tag }` | `#[b bold]`, где `tag` — полный узел `Tag` |
| `{ type: 'Raw' }` | ` and {{ x }}` |

`{{ }}` не разбивается: он принадлежит Vue и остаётся в обычном тексте.

### `Comment`, `Code`, `Control`, `Filter` {#comment-code-control-filter}

| Узел | Исходник | Поля |
|---|---|---|
| `Comment` | `// shown`, `//- hidden` и строки, вложенные под ними | `buffered` (у `//` да, у `//-` нет), `content` |
| `Code` | `- const x = 1`, `= value`, `!= html` и `p= value` как дочерний элемент тега | `buffered`, `escaped`, `expression`, `children` |
| `Control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default`, `mixin`, `block`, `append`, `prepend`, `include`, `extends`, `doctype`, `yield` | `keyword`, `head` (остаток строки), `children` |
| `Filter` | `:markdown-it` и его строки текста | `name`, `attributeBlocks`, `children` (узлы `Text`) |

## Атрибуты {#attributes}

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

У тега может быть больше одного блока (`a(x)(y)` — допустимый Pug), поэтому `attributeBlocks` — это
список; обычно он пуст или содержит одну запись.

| `kind` | Когда | Пример |
|---|---|---|
| `string` | **всё** значение — один литерал `'…'` или `"…"` | `href="/x"` |
| `template` | всё значение — один литерал `` `…` `` | ``title=`Hi ${name}` `` |
| `expression` | всё остальное: Pug компилирует это как JavaScript | `href=url`, `title="a" + b` |

Для Vue значение `string` — это то, что получает директива или атрибут (`:title="t"` привязывает `t`);
значение `expression` вычисляется Pug при компиляции, до того как его увидит Vue.

## Строки {#lines}

В `doc.lines` по одной записи на каждую строку исходника разбираемого диапазона. Она отвечает на вопрос
«что находится на этой строке и на какую глубину её нужно отступить», который нужен форматировщику и на
который одно дерево не отвечает.

```ts
interface PugLine {
  range: Range          // the line, without its line ending
  indent: Range         // its leading whitespace
  kind: 'node' | 'attribute' | 'paren-close' | 'raw' | 'continuation' | 'blank'
  depth: number
  anchor: number | null // index into lines; see below
}
```

Для этого шаблона:

```pug
ul#list
  li(
    v-for="x in xs"
    :key="x"
  ) {{ x }}
  p.
    some text
```

| Строка | `kind` | `depth` |
|---|---|---|
| `ul#list` | `node` | 0 |
| `  li(` | `node` | 1 |
| `    v-for="x in xs"` | `attribute` | 2 |
| `    :key="x"` | `attribute` | 2 |
| `  ) {{ x }}` | `paren-close` | 1 |
| `  p.` | `node` | 1 |
| `    some text` | `raw` | 2 |
| *(после последнего перевода строки)* | `blank` | 0 |

| `kind` | Строка | `depth` |
|---|---|---|
| `node` | начинает узел | его глубина вложенности |
| `attribute` | внутри многострочного блока атрибутов | глубина тега + 1 |
| `paren-close` | начинается с `)`, закрывающей блок | глубина тега |
| `raw` | внутри текстового блока, комментария, блока кода или фильтра | глубина владельца + 1 |
| `continuation` | продолжает строку выше (многострочное значение) или пропущена после ошибки | глубина той строки + 1 |
| `blank` | пустая или только из пробельных символов | 0 |

`anchor` задан у строк, которые должны сохранять свою колонку **относительно другой строки**, а не следовать
`depth`: строки текстового блока после первой (привязаны к этой первой строке) и строки продолжения
(привязаны к строке, которую продолжают). В

```pug
p.
  one
    two
p(title=`a
  b`) x
```

строка `two` привязана к строке `one`, а вторая строка значения `title` — к строке выше. Когда форматировщик
сдвигает опорную строку, он сдвигает эти строки на ту же величину.
