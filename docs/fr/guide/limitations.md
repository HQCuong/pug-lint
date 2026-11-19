---
title: "Limitations connues"
description: "Limitations connues d'eslint-plugin-pug-vue : valeurs d'attributs multilignes, raccourcis, différences d'AST avec les templates HTML, et coût du fix guard."
---

# Limitations connues

- **Les valeurs d'attributs multilignes demandent des backticks.** Un saut de ligne dans une valeur
  `'…'` ou `"…"` est une erreur de syntaxe Pug (Pug lui-même ne la compile pas), signalée via
  `vue/no-parsing-error`. Tant qu'un template contient une erreur d'analyse, aucune correction n'y
  est appliquée.
- **Les raccourcis ne sont pas des attributs pour les règles `vue/*`.** Les raccourcis `.class` et
  `#id` ne sont pas exposés comme attributs : des règles comme `vue/no-restricted-class` ne voient
  donc pas les classes écrites en raccourci.
- **L'AST Vue diffère de celui d'un template HTML** sur quelques points que les règles `vue/*`
  peuvent remarquer : chaque ligne de texte avec pipe (`| text`) est son propre nœud de texte ; le
  texte placé directement à la racine du template n'a pas de nœud de texte ; les valeurs d'attributs
  chaîne sont transmises brutes, de sorte que des guillemets échappés dans une chaîne de directive
  (`:x="f(\"a\")"`) peuvent provoquer une fausse erreur d'analyse Vue.
- **Les valeurs d'attributs sans guillemets et `${}`** (`a(href=url)`, ``a(title=`${x}`)``) sont des
  expressions Pug évaluées à la compilation, pas des liaisons Vue. Elles sont transmises aux règles
  `vue/*` comme de simples valeurs d'attributs, et le fix guard écarte toute correction qui les
  réécrit.
- **Une valeur qui commence par un guillemet doit être une seule chaîne.** `a(title="x" + y)` est du
  Pug valide mais est signalé comme erreur d'analyse (`vue/no-parsing-error`), par conception :
  écrivez `a(title=("x" + y))` ou `a(:title="'x' + y")`.
- **Sauts de ligne CR seuls.** Dans un template dont les lignes se terminent par un `\r` seul
  (ancien style Mac), les règles `vue-pug/*` signalent des problèmes mais ne les corrigent pas, et le
  tokenizer signale une erreur d'analyse. Convertissez le fichier en LF ou CRLF.
- **Une partie de la syntaxe Pug est signalée comme non prise en charge**, ou analysée différemment
  de Pug, par le parser : voir [Syntaxe Pug non prise en charge](./unsupported-syntax).
- **Coût du fix guard et ensembles de corrections partiels :** voir [Le fix guard](./fix-guard#cost).
