---
title: Der Fix-Guard
description: "Wie der Fix-Guard verhindert, dass eslint --fix Pug-Templates kaputt macht: Jeder Fix wird erneut geparst und seine Struktur verglichen, bevor ESLint ihn anwendet."
---

# Der Fix-Guard

Ein Autofix, der ein Template kaputt macht, ist schlimmer als gar keiner. Pug macht das leicht:
Die Einrückung ist die Struktur, und wer eine Zeile ohne ihre Kinder verschiebt, ändert den Baum.
Deshalb wird jeder Fix, der ein Pug-Template berührt, geprüft, bevor ESLint ihn anwendet.

## Was geprüft wird {#what-is-checked}

Für jedes Pug-Template wird ein Fix nur angewendet, wenn sich das Template danach noch parsen lässt
und seine Struktur unverändert ist:

- die Tags und ihre Verschachtelung;
- die Klassen- und ID-Menge jedes Tags und die Anzahl seiner Attribute (`p(class="a b")` und `p.a.b`
  sind also gleich, eine verlorene Klasse aber nicht);
- die Form von Text und Interpolationen;
- jedes JavaScript-Stück, das Pug kompiliert (unquotierte und `${}`-Attributwerte, `&attributes`,
  Mixin-Argumente, Code, Kontrollstruktur-Köpfe, `#{}`), bis auf die Einrückung.

Der Parser meldet, was Pug selbst ablehnt (zum Beispiel eine Mischung aus Tabs und Leerzeichen oder
ein wiederholtes Attribut), sodass auch ein Fix verworfen wird, der so etwas einführen würde.

## Wie Fixes angewendet werden {#how-fixes-are-applied}

1. Jeder Fix wird einzeln geprüft.
2. Die verbliebenen Fixes werden noch einmal als die Gesamtmenge geprüft, die ESLint anwenden wird.
3. Ein Fix, der durchfällt, wird verworfen, und sein Problem wird weiterhin gemeldet, sodass Sie es
   von Hand beheben können.

Das gilt für jede Regel, die `.vue`-Dateien fixt, auch für `vue/*`-Regeln und Regeln von Drittanbietern.
Solange ein Template einen Pug-Syntaxfehler hat, wird darin kein Fix angewendet.

## Kosten {#cost}

Der Guard parst das Template für jeden eigenständigen Fix erneut, die Kosten wachsen also mit der
Zahl der Fixes mal der Template-Größe. Ein normales Template braucht Millisekunden; ein komplett
falsch formatiertes Template mit 3000 Zeilen kann einige Sekunden brauchen. Die Kosten entstehen nur,
solange ein Template Probleme hat, die zu beheben sind.

## Teilmengen von Fixes {#partial-fix-sets}

Der Guard prüft die volle Menge der verbliebenen Fixes. Wendet ESLint nur einige davon an
(`--fix-type` oder ein eigenes `fix`-Prädikat in der Node.js-API), wurde diese Teilmenge nicht als
Menge geprüft.
