---
title: Fehler
description: "Fehlercodes von pug-lint-parser mit Beispielen, wie der Parser sich nach einem Fehler erholt und wie Sie einen Offset in Zeile und Spalte umrechnen."
---

# Fehler

`parsePug` wirft nie einen Fehler. Was nicht geparst werden kann, wird zu einem Eintrag in
`doc.errors`, und der Rest des Templates wird weiter geparst:

```ts
interface PugParseError {
  code: string     // one of the codes below
  message: string  // for people; may change between versions
  offset: number   // where the problem is, as an offset into text
}
```

Vergleichen Sie über `code`, nicht über `message`. Um Zeile und Spalte anzuzeigen, zählen Sie ab dem
Offset:

```js
const before = text.slice(0, error.offset)
const line = before.split('\n').length                    // 1-based
const column = error.offset - before.lastIndexOf('\n')    // 1-based
```

## Fehlerbehebung beim Parsen {#recovery}

Ein Fehler stoppt das Parsen nicht. Der Parser springt zum Ende des fehlerhaften Konstrukts oder
zum Zeilenende und macht mit der nächsten Zeile weiter. Zeilen, die sich nach einem Fehler nicht
einordnen lassen, etwa Zeilen unter einem Konstrukt, das keine Kinder haben kann, bleiben in
`doc.lines` mit der Art `continuation`, und für sie wird kein Knoten gebaut.

```js
parsePug('div\n  p(class="a)\n  span ok\n  li(a=1 a=2)\n').errors
// [
//   { code: 'unterminated-string', message: 'Unterminated string', offset: 14 },
//   { code: 'duplicate-attribute', message: 'Duplicate attribute "a"', offset: 37 },
// ]
```

Das ESLint-Plugin wendet in einem Template mit Fehlern keinen Fix an, da es sie nicht prüfen kann.

## Codes {#codes}

| `code` | Beispiel | Meldung |
|---|---|---|
| `unterminated-string` | `p(title="hi) x` | Unterminated string |
| `unclosed-attributes` | `p(title="hi"` | Attribute block is not closed with ")" |
| `unclosed-arguments` | `+card(1, 2` | Mixin arguments are not closed with ")" |
| `missing-attribute-value` | `p(title=) x` | Expected a value after the operator |
| `duplicate-attribute` | `p(a="1" a="2")` | Duplicate attribute "a" |
| `unexpected-character` | `p(a!b) x` | Expected "=" after "!" |
| `unbalanced-key` | `p([a="1") x` | Unclosed "[" in an attribute key |
| `bad-escape` | `p(a="\x")` | Invalid escape sequence in a JavaScript string |
| `inconsistent-indentation` | eine mit Tabs eingerückte Zeile zwischen mit Leerzeichen eingerückten | Invalid indentation, you can use tabs or spaces but not both |
| `unterminated-interpolation` | `p Hi #{name` | Interpolation is not closed with "}" |
| `unsupported-syntax` | `#{tag} x` | Unsupported syntax: "#{tag} x" |

Jeder Code deckt eine Familie von Problemen ab; `unexpected-character`, `unbalanced-key`,
`inconsistent-indentation` und `unsupported-syntax` haben mehrere Meldungen.

Sie entsprechen dem, was der Pug-Compiler ablehnt, mit einem bewussten Unterschied: Ein
Zeilenumbruch in einem `'…'`- oder `"…"`-Attributwert ist `unterminated-string`, wie in JavaScript.
Verwenden Sie Backticks für mehrzeilige Werte.

## `unsupported-syntax` {#unsupported-syntax}

Dieser Code kennzeichnet gültiges Pug, das der Parser nicht behandelt, etwa interpolierte Tag-Namen
(`#{tag}`) oder Textblöcke ohne Tag. Einige Formen werden zudem ohne Fehler, aber anders als von Pug
geparst. Beide Listen stehen unter [Nicht unterstützte Pug-Syntax](/de/guide/unsupported-syntax).
