---
title: Bekannte Einschränkungen
description: "Bekannte Einschränkungen von eslint-plugin-pug-vue: mehrzeilige Attributwerte, Kurzschreibweisen, AST-Unterschiede zu HTML-Templates und die Kosten des Fix-Guards."
---

# Bekannte Einschränkungen

- **Mehrzeilige Attributwerte brauchen Backticks.** Ein Zeilenumbruch in einem `'…'`- oder
  `"…"`-Wert ist ein Pug-Syntaxfehler (Pug selbst kompiliert ihn nicht) und wird über
  `vue/no-parsing-error` gemeldet. Solange ein Template einen Parse-Fehler hat, wird darin kein Fix
  angewendet.
- **Kurzschreibweisen sind für `vue/*`-Regeln keine Attribute.** Die Kurzschreibweisen `.class` und
  `#id` werden nicht als Attribute bereitgestellt, sodass Regeln wie `vue/no-restricted-class`
  Klassen in Kurzschreibweise nicht sehen.
- **Der Vue-AST unterscheidet sich von dem eines HTML-Templates** an einigen Stellen, die
  `vue/*`-Regeln bemerken können: Jede Text-Zeile mit Pipe (`| text`) ist ein eigener Textknoten;
  Text direkt an der Wurzel des Templates hat keinen Textknoten; String-Attributwerte werden roh
  durchgereicht, sodass maskierte Anführungszeichen in einem Direktiven-String (`:x="f(\"a\")"`)
  einen unberechtigten Vue-Parse-Fehler auslösen können.
- **Unquotierte und `${}`-Attributwerte** (`a(href=url)`, ``a(title=`${x}`)``) sind Pug-Ausdrücke der
  Kompilierzeit, keine Vue-Bindings. Sie werden als einfache Attributwerte an `vue/*`-Regeln
  übergeben, und der Fix-Guard verwirft jeden Fix, der sie umschreibt.
- **Ein Wert, der mit einem Anführungszeichen beginnt, muss ein einziger String sein.**
  `a(title="x" + y)` ist gültiges Pug, wird aber absichtlich als Parse-Fehler gemeldet
  (`vue/no-parsing-error`): Schreiben Sie `a(title=("x" + y))` oder `a(:title="'x' + y")`.
- **Einzelne CR-Zeilenumbrüche.** In einem Template, dessen Zeilen mit einem einzelnen `\r`
  enden (alter Mac-Stil), melden die `vue-pug/*`-Regeln Probleme, fixen sie aber nicht, und der
  Tokenizer meldet einen Parse-Fehler. Wandeln Sie die Datei in LF oder CRLF um.
- **Manche Pug-Syntax wird vom Parser als nicht unterstützt gemeldet** oder anders als von Pug
  geparst: siehe [Nicht unterstützte Pug-Syntax](./unsupported-syntax).
- **Kosten des Fix-Guards und Teilmengen von Fixes:** siehe [Der Fix-Guard](./fix-guard#cost).
