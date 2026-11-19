---
title: Syntaxe Pug non prise en charge
description: "Les formes Pug que pug-lint-parser signale comme non prises en charge ou analyse différemment du compilateur Pug, et comment les réécrire."
---

# Syntaxe signalée comme `unsupported-syntax`

Le parser ne lève jamais d'exception. Une entrée qu'il ne modélise pas devient une erreur
`unsupported-syntax` au premier offset qu'il ne sait pas lire, et le reste de la ligne est ignoré.
Cette page liste toutes les sources connues de cette erreur. Tout autre cas qui produit
`unsupported-syntax` est un bug.

« Pug invalide » désigne les formes que Pug lui-même rejette ; elles sont listées parce que le
parser les signale aussi avec ce code.

## Lignes {#lines}

| Forme | Exemple | Remarques |
| --- | --- | --- |
| Nom de balise interpolé | `#{tag} text`, `#{tag}/` | |
| Nom de mixin interpolé | `+#{name}()` | `+ name` (espaces après `+`) est un appel de mixin. |
| Bloc de texte sans balise | une ligne qui est seulement `.`, avec des lignes de texte imbriquées dessous | Pug place le texte dans le parent. Utilisez des lignes `\|`. |
| Interpolation de balise ou moustache en début de ligne | `#[b x] y`, `{{ x }}` | Utilisez `\| #[b x] y` / `\| {{ x }}`. |
| Tout ce qui ne commence pas une construction Pug | `)`, `@x`, `.5` | |
| Lignes imbriquées sous du texte avec pipe | `\| a` avec un `p` indenté dessous | Pug invalide. Signalé une fois, à la première ligne imbriquée ; les lignes imbriquées sont ignorées et forment une région de récupération d'erreur (`doc.lines` de type `continuation`). Les lignes imbriquées sous du HTML littéral (`<ul>`) sont valides : Pug en fait des sœurs, et le parser aussi. |
| Lignes imbriquées sous du code avec sortie | `= x` ou `!= x` avec un `p` indenté dessous | Pug invalide. Signalé et récupéré comme sous du texte avec pipe. Sous `p= x`, les lignes sont des enfants de `p`, comme dans Pug. |

## Après l'en-tête d'une balise ou d'un appel de mixin {#after-a-tag-or-mixin-call-head}

| Forme | Exemple | Remarques |
| --- | --- | --- |
| Code sans sortie après une balise | `p- x` | |
| `.` suivi d'autre chose sur la ligne | `p. text`, `p.: a` | Pug invalide. |
| Bloc de texte après un appel de mixin | `+m.` | |
| Expansion de bloc après un appel de mixin | `+m: p` | `MixinCall` n'a pas de champ `expansion`. En tant qu'enfant, c'est correct : `li: +m`. |
| `/` après un appel de mixin | `+m/` | |
| Expansion de bloc après `/` | `img/: x` | Pug invalide. |
| `:` non suivi d'un espace et d'un enfant | `li:`, `li(x):b`, `when 1:` | Pug invalide. |
| Enfant d'expansion qui n'est ni une balise ni un appel de mixin | `li: \| x`, `li: <b>x</b>`, `li: = x`, `li: // c`, `li: if x`, `when 1: each x in y` | Un mot-clé de contrôle n'est jamais lu comme un nom de balise ici. |
| Balise suivie d'un filtre en ligne | `p: :markdown text` | |

## En-têtes de contrôle {#control-heads}

| Forme | Exemple | Remarques |
| --- | --- | --- |
| Expansion de bloc après une condition ou une boucle | `else: p`, `else : p`, `if x: p`, `unless x: p`, `else if x: p`, `while x: p`, `case x: p`, `each a in b: p`, `for a in b: p` | Pug invalide. Signalé au premier `:` de l'en-tête, hors chaînes et crochets, qui ne ferme pas un `?` de premier niveau (`if a ? b : c` et `each v in {a: 1}` sont donc corrects). L'expansion fonctionne après `when` et `default` : `when 1: p a`. |

## Filtres {#filters}

| Forme | Exemple | Remarques |
| --- | --- | --- |
| Autre chose que du texte après l'en-tête du filtre | `:a(x):b`, `:md.x` | Les filtres imbriqués ne sont lus que sous la forme `:a:b(attrs)`, avec les attributs après le dernier nom. |

## Interpolation de balise `#[…]` {#tag-interpolation}

| Forme | Exemple | Remarques |
| --- | --- | --- |
| Ne commence pas par une balise | `#[+m]`, `#[\| x]`, `#[- x]`, `#[:cdata x]` | Les appels de mixin, le texte, le code et les filtres ne sont pas lus dans `#[…]`. |
| En-tête suivi d'autre chose que du texte, du code `=`/`!=` ou `: child` | `#[p.]`, `#[p- x]`, `#[img/: x]` | |

## Analysé sans erreur, mais pas comme Pug {#parsed-without-an-error-but-not-as-pug-does}

Trouvé par l'oracle différentiel (`tests/oracle`, Task 17).

| Forme | Exemple | Remarques |
| --- | --- | --- |
| Commentaire après un nom de block | `block content // c` | Pug termine le nom à `//` et fait du reste un commentaire frère qui prend aussi les lignes imbriquées. Le parser le garde dans l'en-tête du `block`. |
| Attribut ou id en double | `a(x=1 x=2)`, `#a#b` | Pug les rejette ; le parser les accepte. |
| `else` vide après `each` | `each x in y` … `else` sans rien d'imbriqué | Pug le rejette ; le parser l'accepte. |
