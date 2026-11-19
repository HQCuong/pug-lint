---
title: pug-lint-parser
description: "pug-lint-parser: ein Pug-Parser für Lint- und Formatierungswerkzeuge, mit exakten Quellbereichen und Fehlerbehebung. Er wirft nie einen Fehler und hat keine Abhängigkeiten."
---

# pug-lint-parser

Ein Parser für konkrete Syntaxbäume (CST) von Pug-Templates, gebaut für Lint- und
Formatierungswerkzeuge. Er ist der Parser hinter
[`eslint-plugin-pug-vue`](https://github.com/HQCuong/pug-lint/tree/main/packages/eslint-plugin).

- **Wirft nie einen Fehler.** Eingaben, die er nicht parsen kann, werden zu einem Eintrag in
  `errors`, und das Parsen geht in der nächsten Zeile weiter.
- **Exakte Quellbereiche.** Jeder Knoten, jedes Attribut, jeder Wert, jede Kurzschreibweise, jedes
  Komma und jede Zeile hat einen `[start, end)`-Bereich: UTF-16-Offsets in den übergebenen Text, sodass
  Sie den Quelltext ausschneiden oder eine minimale Änderung bauen können, ohne Positionen
  umzurechnen.
- **Parst einen Ausschnitt an Ort und Stelle.** `parsePug(text, { start, end })` parst nur
  `text[start, end)` (zum Beispiel den Inhalt eines `<template lang="pug">`-Blocks); die Bereiche
  beziehen sich weiterhin auf den ganzen `text`.
- **Behält Zeilenenden.** LF und CRLF werden beide verarbeitet; `doc.eol` ist das erste gefundene
  Zeilenende.
- Keine Laufzeit-Abhängigkeiten. Nur ESM. Node.js `^20.19.0 || ^22.13.0 || >=24`.

## Verwendung {#usage}

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

Die vollständige Referenz mit jedem Knotentyp steht auf der Website: [API](https://pug-lint.dev/de/parser/api),
[Syntaxbaum](https://pug-lint.dev/de/parser/syntax-tree), [Fehler](https://pug-lint.dev/de/parser/errors) und
[Rezepte](https://pug-lint.dev/de/parser/recipes).

- `parsePug(text, options?)` → `PugDocument`. `options.start` / `options.end` begrenzen das Parsen
  auf diesen Bereich von `text`.
- `walk(doc, visit)`: ruft `visit(node, parent)` für jeden Knoten in Dokumentreihenfolge auf,
  einschließlich der Tags in Tag-Interpolationen (`#[…]`).
- `fingerprint(doc)` → `string`: eine strukturelle Zusammenfassung des Baums (Tags und ihre
  Verschachtelung, Klassen- und ID-Mengen, Attributanzahlen, die Form von Text und Interpolation).
  Sie ignoriert Leerraum, Anführungszeichen, Attributreihenfolge, Attributnamen und -werte außer
  statischem `class` und `id`, die Groß-/Kleinschreibung von Tag-Namen, Textinhalt und den Inhalt
  von Code- und Kontrollköpfen, sodass `p(class="a b")` und `p.a.b` denselben Fingerprint haben.
  Das ESLint-Plugin vergleicht Fingerprints, um Fixes abzulehnen, die die Struktur eines Templates
  ändern.
- `literalSpans(text, range)` → die Bereiche der String- und Template-Literale in einem
  JavaScript-Ausdruck.
- Typen für jeden Knoten: `PugDocument`, `PugNode`, `Tag`, `AttributeBlock`, `Attribute`,
  `AttributeValue`, `Text`, `Comment`, `Code`, `Control`, `MixinCall`, `Filter`, `PugLine`,
  `PugParseError` und mehr (siehe `src/ast.ts`).

Ein `PugDocument` hat `children` (den Baum), `errors` (`{ code, message, offset }`), `lines` (ein
Eintrag pro Quellzeile mit ihrem Einrückungsbereich, ihrer Art und logischen Tiefe), `eol` und
`indentUnit`.

## Nicht unterstützte Syntax {#unsupported-syntax}

Einige Pug-Formen werden mit dem Fehlercode `unsupported-syntax` gemeldet, und einige werden ohne
Fehler, aber anders als von Pug geparst. Sie sind in
[docs/unsupported-syntax.md](https://github.com/HQCuong/pug-lint/blob/main/packages/pug-parser/docs/unsupported-syntax.md)
aufgelistet.

## Lizenz {#license}

MIT
