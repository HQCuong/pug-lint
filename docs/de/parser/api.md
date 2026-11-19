---
title: API
description: "API-Referenz von pug-lint-parser: parsePug und seine Optionen, walk, fingerprint, literalSpans und die exportierten Typen."
---

# API

```js
import { parsePug, walk, fingerprint, literalSpans } from 'pug-lint-parser'
```

Das Paket ist nur ESM, hat keine Abhängigkeiten und liefert seine TypeScript-Typen mit: Jeder
Knotentyp unten wird exportiert (`import type { Tag, PugDocument } from 'pug-lint-parser'`).

**Jede Position ist ein Offset in den übergebenen `text`**: ein UTF-16-Index, dieselbe Einheit wie
bei `String.prototype.slice`. Ein `Range` ist `[start, end)`, sodass `text.slice(...range)` den
Quelltext eines Knotens liefert und `text.slice(0, start) + replacement + text.slice(end)` ihn
bearbeitet.

## `parsePug(text, options?)` {#parsepug-text-options}

```ts
function parsePug(text: string, options?: ParseOptions): PugDocument

interface ParseOptions {
  start?: number // default 0
  end?: number   // default text.length
}
```

Parst `text[start, end)` und gibt das [Dokument](./syntax-tree#pugdocument) zurück. Die Funktion
wirft nie einen Fehler: Was sie nicht parsen kann, wird zu einem Eintrag in `doc.errors`, und das
Parsen geht in der nächsten Zeile weiter (siehe [Fehler](./errors)).

Mit `start` und `end` parsen Sie einen Teil einer größeren Datei, ohne ihn zu kopieren, zum
Beispiel den Inhalt eines `<template lang="pug">`-Blocks in einer `.vue`-Datei. Die Bereiche
beziehen sich weiterhin auf den ganzen `text`:

```js
const sfc = '<template lang="pug">\ndiv\n  p Hi\n</template>\n'
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

doc.range                 // [21, 33]
doc.children[0].name      // { value: 'div', range: [22, 25] }
```

Ist jede Zeile des Ausschnitts um denselben Betrag eingerückt, wie bei einem unter `<template>`
eingerückten Template, ist diese gemeinsame Einrückung die Basis: Der Parser behandelt sie als
Spalte 0, wie Vue es tut, bevor es das Template kompiliert. Pug selbst lehnt eine eingerückte
`.pug`-Datei ab, der Parser ist hier also nachsichtiger als der Pug-Compiler.

Zeilenenden dürfen LF oder CRLF sein; auch ein einzelnes CR wird als Zeilenumbruch gelesen. Ein
führendes BOM wird nicht entfernt: Übergeben Sie `start: 1`, um es zu überspringen.

## `walk(doc, visit)` {#walk-doc-visit}

```ts
function walk(
  doc: PugDocument,
  visit: (node: PugNode, parent: PugNode | PugDocument) => void,
): void
```

Ruft `visit` für jeden Knoten in Dokumentreihenfolge auf (Pre-Order: ein Knoten vor seinen Kindern).
Sie geht in `children` und in das Tag jeder [Tag-Interpolation](./syntax-tree#text) `#[…]`, deren
Elternknoten der umgebende `Text`-Knoten ist.

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

Ein String, der die **Struktur** eines Templates zusammenfasst: Zwei Templates mit demselben
Fingerprint rendern denselben Elementbaum. Das ESLint-Plugin vergleicht Fingerprints, um Fixes
abzulehnen, die ein Template ändern würden.

Was er einschließt:

- die Tags, Mixin-Aufrufe, Texte, Kommentare, Code- und Kontrollblöcke und ihre Verschachtelung;
- die Menge der statischen Klassen und IDs jedes Tags, **in welcher Form auch immer**:
  `p(class="a b")` und `p.a.b` haben denselben Fingerprint, `p.a` nicht;
- die Anzahl der übrigen Attribute und die Art jedes Werts (keiner oder String, Ausdruck,
  Template mit `${}`);
- jedes JavaScript-Stück, das Pug kompiliert, mit seinem Text bis auf die Einrückung: Ausdrucks-
  und `${}`-Attributwerte, `&attributes(…)`, Mixin-Argumente, Code, Kontrollköpfe und `#{…}`;
- die Form des Texts: wo er in Zeilen und Interpolationen geteilt ist.

Was er ignoriert: Leerraum und Einrückungsbreite, Anführungszeichen, Kommas, Attributreihenfolge
und -namen, String-Attributwerte außer `class` und `id`, die Groß-/Kleinschreibung von Tag-Namen,
Textinhalt, das `/` eines selbstschließenden Tags und das `:` einer Block-Expansion.

```js
fingerprint(parsePug('p(class="a b") Hi')) === fingerprint(parsePug('p.a.b Hi'))  // true
fingerprint(parsePug('p.a Hi')) === fingerprint(parsePug('p.a.b Hi'))             // false
```

Das Format des Strings gehört nicht zur API: Vergleichen Sie Fingerprints, parsen Sie sie nicht.

## `literalSpans(text, range)` {#literalspans-text-range}

```ts
function literalSpans(text: string, range: [number, number]): [number, number][]
```

Die Bereiche der String-Literale (`'…'`, `"…"`) und Template-Literale (`` `…` ``) in einem
JavaScript-Ausdruck bei `text[range]`. Damit unterscheiden Sie Code von String-Inhalt, zum Beispiel
um das Innere eines mehrzeiligen Template-Literals nicht neu einzurücken. Ein nicht beendetes Literal
reicht bis zum Ende von `range`.

```js
const e = 'f("a", `b ${c}`, d)'
literalSpans(e, [0, e.length])              // [[2, 5], [7, 15]]
                                            // '"a"' and '`b ${c}`'
```

## Typen {#types}

| Typ | Was er ist |
|---|---|
| `Range` | `[start: number, end: number]`, Offsets in `text` |
| `PugDocument` | Das Ergebnis von `parsePug`: [Baum, Zeilen und Fehler](./syntax-tree#pugdocument) |
| `PugNode` | `Tag \| MixinCall \| Text \| Comment \| Code \| Control \| Filter` |
| `Tag`, `MixinCall`, `Text`, `Comment`, `Code`, `Control`, `Filter` | [Die Knoten](./syntax-tree#nodes) |
| `AttributeBlock`, `Attribute`, `AttributeValue` | [Attribute](./syntax-tree#attributes) |
| `TextPart` | `Raw`, `Interpolation` oder `TagInterpolation` in einem `Text` |
| `ControlKeyword` | Das Schlüsselwort eines `Control`-Knotens |
| `PugLine` | [Eine Quellzeile](./syntax-tree#lines) |
| `PugParseError` | [`{ code, message, offset }`](./errors) |
| `ParseOptions` | `{ start?, end? }` |
