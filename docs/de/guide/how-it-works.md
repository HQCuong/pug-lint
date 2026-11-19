---
title: So funktioniert es
description: "Wie eslint-plugin-pug-vue Pug in Vue lintet: ein Pug-Tokenizer für vue-eslint-parser, vue/*- und vue-pug/*-Regeln und ein Fix-Guard, der jeden Fix prüft."
---

# So funktioniert es

ESLint kann Pug von sich aus nicht lesen, und eslint-plugin-vue kennt nur HTML-Templates. Das
Plugin verbindet beides und prüft dann jeden Fix, bevor ESLint ihn schreibt.

<HowItWorks />

## 1. Parsen {#_1-parse}

[vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser) parst `.vue`-Dateien für
eslint-plugin-vue. Für ein Template in einer anderen Sprache bittet er einen *Tokenizer*, diese
Sprache in die Tokens zu verwandeln, die er von HTML bekäme. Das Plugin registriert einen für
`lang="pug"` und `lang="jade"`.

Der Tokenizer parst das Template mit [`pug-lint-parser`](/de/parser/) und gibt dann für jedes
Pug-Element ein Start-Tag, ein End-Tag, Text und `{{ }}`-Tokens aus, an den exakten Positionen des
Pug-Quelltexts. vue-eslint-parser baut daraus seinen üblichen Template-AST, sodass `vue/*`-Regeln
auf die richtige Zeile und Spalte in Ihrem Pug zeigen.

Ein Pug-Syntaxfehler wird zu einem Parse-Fehler, den `vue/no-parsing-error` meldet.

## 2. Linten {#_2-lint}

Zwei Arten von Regeln laufen auf derselben Datei:

- **`vue/*`-Regeln** aus eslint-plugin-vue lesen den Vue-Template-AST, wie sie es bei einem
  HTML-Template täten: fehlende Keys, ungenutzte Variablen, Attributreihenfolge, veraltete Syntax.
- **`vue-pug/*`-Regeln** lesen den Pug-Syntaxbaum von `pug-lint-parser` direkt. Dieser Baum behält,
  was der Vue-AST verliert: Einrückung, Kommas, Anführungszeichen, Klammern sowie die
  Kurzschreibweisen `.class` und `#id`. Hier arbeiten die Formatierungsregeln.

## 3. Prüfen {#_3-check}

Das Plugin umhüllt den Prozessor von eslint-plugin-vue, der jede Meldung sieht, bevor ESLint sie verwendet:

- **Unterdrücken.** Einige `vue/*`-Regeln können auf Pug nicht funktionieren: Sie melden falsche
  Probleme, oder ihre Fixes würden HTML in ein Pug-Template schreiben. Ihre Meldungen werden
  verworfen, wenn sie in einem Pug-Template liegen, und nur dort, sodass sie Ihre HTML-Templates
  weiter prüfen. Die wenigen Regeln, die auf Pug abstürzen, werden stattdessen abgeschaltet.
  [Die Listen](./vue-rules).
- **Fix-Guard.** Jeder Fix, der ein Pug-Template berührt, wird auf einer Kopie der Datei
  angewendet, die `pug-lint-parser` erneut parst. Das Plugin vergleicht die Struktur davor und
  danach: die Tags und ihre Verschachtelung, Klassen und IDs, Attributanzahlen, die Form von Text
  und jeden JavaScript-Ausdruck. Hat sich etwas geändert oder lässt sich die Kopie nicht mehr
  parsen, wird der Fix verworfen und seine Warnung bleibt.
  [Details](./fix-guard).

ESLint wendet dann die übrigen Fixes an, mit `eslint --fix` oder dem Fix beim Speichern Ihres Editors.

## Die zwei Pakete {#the-two-packages}

| Paket | Rolle |
|---|---|
| [`eslint-plugin-pug-vue`](https://www.npmjs.com/package/eslint-plugin-pug-vue) | Das ESLint-Plugin: der Tokenizer, die `vue-pug/*`-Regeln, der Prozessor und die Configs. Das Paket, das Sie installieren. |
| [`pug-lint-parser`](/de/parser/) | Der Pug-Parser, auf dem alles oben aufbaut. Er weiß nichts von ESLint oder Vue, und Sie können ihn allein verwenden. |
