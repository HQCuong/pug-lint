---
title: Nicht unterstützte Pug-Syntax
description: "Die Pug-Formen, die pug-lint-parser als nicht unterstützt meldet oder anders als der Pug-Compiler parst, und wie Sie sie umschreiben."
---

# Als `unsupported-syntax` gemeldete Syntax

Der Parser wirft nie einen Fehler. Eingaben, die er nicht abbildet, werden an dem ersten Offset,
den er nicht lesen kann, zu einem `unsupported-syntax`-Fehler, und der Rest dieser Zeile wird
übersprungen. Diese Datei listet jede bekannte Quelle dieses Fehlers auf. Alles andere, was
`unsupported-syntax` erzeugt, ist ein Bug.

„Ungültiges Pug" kennzeichnet Formen, die Pug selbst ablehnt; sie stehen hier, weil der Parser sie
ebenfalls mit diesem Code meldet.

## Zeilen {#lines}

| Form | Beispiel | Hinweise |
| --- | --- | --- |
| Interpolierter Tag-Name | `#{tag} text`, `#{tag}/` | |
| Interpolierter Mixin-Name | `+#{name}()` | `+ name` (Leerzeichen nach `+`) ist ein Mixin-Aufruf. |
| Textblock ohne Tag | eine Zeile, die nur `.` enthält, mit eingerückten Textzeilen darunter | Pug setzt den Text in den Elternknoten. Verwenden Sie `\|`-Zeilen. |
| Tag-Interpolation oder Mustache am Zeilenanfang | `#[b x] y`, `{{ x }}` | Verwenden Sie `\| #[b x] y` / `\| {{ x }}`. |
| Alles andere, was kein Pug-Konstrukt beginnt | `)`, `@x`, `.5` | |
| Zeilen unter Text mit Pipe | `\| a` mit einem eingerückten `p` darunter | Ungültiges Pug. Wird einmal gemeldet, an der ersten verschachtelten Zeile; die verschachtelten Zeilen werden übersprungen und bilden eine Fehlerbehebungsregion (`doc.lines`, Art `continuation`). Zeilen unter literalem HTML (`<ul>`) sind gültig: Pug macht sie zu Geschwistern, und der Parser auch. |
| Zeilen unter gepuffertem Code | `= x` oder `!= x` mit einem eingerückten `p` darunter | Ungültiges Pug. Wird gemeldet und behandelt wie unter Text mit Pipe. Unter `p= x` sind die Zeilen Kinder von `p`, wie in Pug. |

## Nach dem Kopf eines Tags oder Mixin-Aufrufs {#after-a-tag-or-mixin-call-head}

| Form | Beispiel | Hinweise |
| --- | --- | --- |
| Ungepufferter Code nach einem Tag | `p- x` | |
| `.` gefolgt von mehr in der Zeile | `p. text`, `p.: a` | Ungültiges Pug. |
| Textblock nach einem Mixin-Aufruf | `+m.` | |
| Block-Expansion nach einem Mixin-Aufruf | `+m: p` | `MixinCall` hat kein Feld `expansion`. Als Kind ist es in Ordnung: `li: +m`. |
| `/` nach einem Mixin-Aufruf | `+m/` | |
| Block-Expansion nach `/` | `img/: x` | Ungültiges Pug. |
| `:` ohne folgendes Leerzeichen und Kind | `li:`, `li(x):b`, `when 1:` | Ungültiges Pug. |
| Expansions-Kind, das kein Tag oder Mixin-Aufruf ist | `li: \| x`, `li: <b>x</b>`, `li: = x`, `li: // c`, `li: if x`, `when 1: each x in y` | Ein Kontrollschlüsselwort wird hier nie als Tag-Name gelesen. |
| Tag gefolgt von einem Inline-Filter | `p: :markdown text` | |

## Kontrollköpfe {#control-heads}

| Form | Beispiel | Hinweise |
| --- | --- | --- |
| Block-Expansion nach einer Bedingung oder Schleife | `else: p`, `else : p`, `if x: p`, `unless x: p`, `else if x: p`, `while x: p`, `case x: p`, `each a in b: p`, `for a in b: p` | Ungültiges Pug. Wird am ersten `:` des Kopfes gemeldet, das außerhalb von Strings und Klammern steht und kein `?` der obersten Ebene schließt (`if a ? b : c` und `each v in {a: 1}` sind also in Ordnung). Die Expansion funktioniert nach `when` und `default`: `when 1: p a`. |

## Filter {#filters}

| Form | Beispiel | Hinweise |
| --- | --- | --- |
| Alles außer Text nach dem Filterkopf | `:a(x):b`, `:md.x` | Verschachtelte Filter werden nur als `:a:b(attrs)` gelesen, mit Attributen nach dem letzten Namen. |

## Tag-Interpolation `#[…]` {#tag-interpolation}

| Form | Beispiel | Hinweise |
| --- | --- | --- |
| Beginnt nicht mit einem Tag | `#[+m]`, `#[\| x]`, `#[- x]`, `#[:cdata x]` | Mixin-Aufrufe, Text, Code und Filter werden innerhalb von `#[…]` nicht gelesen. |
| Kopf gefolgt von etwas anderem als Text, `=`/`!=`-Code oder `: child` | `#[p.]`, `#[p- x]`, `#[img/: x]` | |

## Ohne Fehler geparst, aber nicht wie von Pug {#parsed-without-an-error-but-not-as-pug-does}

Gefunden vom Differential-Oracle (`tests/oracle`, Task 17).

| Form | Beispiel | Hinweise |
| --- | --- | --- |
| Kommentar nach einem Block-Namen | `block content // c` | Pug beendet den Namen bei `//` und macht den Rest zu einem Geschwister-Kommentar, der auch die verschachtelten Zeilen übernimmt. Der Parser belässt ihn im `block`-Kopf. |
| Doppeltes Attribut oder doppelte ID | `a(x=1 x=2)`, `#a#b` | Pug lehnt sie ab; der Parser akzeptiert sie. |
| Leeres `else` nach `each` | `each x in y` … `else` ohne etwas Verschachteltes | Pug lehnt es ab; der Parser akzeptiert es. |
