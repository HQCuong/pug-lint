---
title: "Ошибки"
description: "Коды ошибок pug-lint-parser с примерами, как парсер восстанавливается после ошибки и как превратить смещение в строку и колонку."
---

# Ошибки {#errors}

`parsePug` никогда не бросает исключений. То, что не удалось разобрать, становится записью в `doc.errors`,
а остальная часть шаблона всё равно разбирается:

```ts
interface PugParseError {
  code: string     // one of the codes below
  message: string  // for people; may change between versions
  offset: number   // where the problem is, as an offset into text
}
```

Ориентируйтесь на `code`, а не на `message`. Чтобы показать строку и колонку, отсчитайте от смещения:

```js
const before = text.slice(0, error.offset)
const line = before.split('\n').length                    // 1-based
const column = error.offset - before.lastIndexOf('\n')    // 1-based
```

## Восстановление {#recovery}

Ошибка не останавливает разбор. Парсер пропускает остаток неверной конструкции или остаток строки и
продолжает со следующей строки. Строки, которые нельзя разместить после ошибки, например строки,
вложенные под конструкцию, не имеющую дочерних элементов, сохраняются в `doc.lines` с видом
`continuation`, и для них узел не строится.

```js
parsePug('div\n  p(class="a)\n  span ok\n  li(a=1 a=2)\n').errors
// [
//   { code: 'unterminated-string', message: 'Unterminated string', offset: 14 },
//   { code: 'duplicate-attribute', message: 'Duplicate attribute "a"', offset: 37 },
// ]
```

Плагин ESLint не применяет исправлений внутри шаблона с ошибками, так как не может их проверить.

## Коды {#codes}

| `code` | Пример | Сообщение |
|---|---|---|
| `unterminated-string` | `p(title="hi) x` | Unterminated string |
| `unclosed-attributes` | `p(title="hi"` | Attribute block is not closed with ")" |
| `unclosed-arguments` | `+card(1, 2` | Mixin arguments are not closed with ")" |
| `missing-attribute-value` | `p(title=) x` | Expected a value after the operator |
| `duplicate-attribute` | `p(a="1" a="2")` | Duplicate attribute "a" |
| `unexpected-character` | `p(a!b) x` | Expected "=" after "!" |
| `unbalanced-key` | `p([a="1") x` | Unclosed "[" in an attribute key |
| `bad-escape` | `p(a="\x")` | Invalid escape sequence in a JavaScript string |
| `inconsistent-indentation` | строка с табуляцией среди строк с пробелами | Invalid indentation, you can use tabs or spaces but not both |
| `unterminated-interpolation` | `p Hi #{name` | Interpolation is not closed with "}" |
| `unsupported-syntax` | `#{tag} x` | Unsupported syntax: "#{tag} x" |

Каждый код охватывает семейство проблем; у `unexpected-character`, `unbalanced-key`,
`inconsistent-indentation` и `unsupported-syntax` несколько сообщений. Сообщения приведены на английском,
как их выдаёт парсер.

Они совпадают с тем, что отвергает компилятор Pug, с одним намеренным отличием: перенос строки внутри
значения атрибута `'…'` или `"…"` даёт `unterminated-string`, как в JavaScript. Для многострочных значений
используйте обратные кавычки.

## `unsupported-syntax` {#unsupported-syntax}

Этим кодом отмечен допустимый Pug, который парсер не обрабатывает, например теги с интерполированными
именами (`#{tag}`) или текстовые блоки без тега. Несколько форм также разбираются без ошибки, но не так,
как в Pug. Оба списка приведены в [Неподдерживаемом синтаксисе Pug](/ru/guide/unsupported-syntax).
