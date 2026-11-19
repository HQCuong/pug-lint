---
title: "Erreurs"
description: "Les codes d'erreur de pug-lint-parser avec des exemples, comment le parser se rétablit après une erreur, et comment transformer un offset en ligne et colonne."
---

# Erreurs

`parsePug` ne lève jamais d'exception. Ce qu'elle ne sait pas analyser devient une entrée de
`doc.errors`, et le reste du template est quand même analysé :

```ts
interface PugParseError {
  code: string     // one of the codes below
  message: string  // for people; may change between versions
  offset: number   // where the problem is, as an offset into text
}
```

Filtrez sur `code`, pas sur `message`. Pour afficher une ligne et une colonne, comptez à partir de
l'offset :

```js
const before = text.slice(0, error.offset)
const line = before.split('\n').length                    // 1-based
const column = error.offset - before.lastIndexOf('\n')    // 1-based
```

## Récupération {#recovery}

Une erreur n'arrête pas l'analyse. Le parser saute jusqu'à la fin de la construction fautive, ou
jusqu'à la fin de la ligne, et continue avec la ligne suivante. Les lignes qui ne peuvent pas être
placées après une erreur, comme les lignes imbriquées sous une construction qui ne peut pas avoir
d'enfants, sont conservées dans `doc.lines` avec le type `continuation`, et aucun nœud n'est
construit pour elles.

```js
parsePug('div\n  p(class="a)\n  span ok\n  li(a=1 a=2)\n').errors
// [
//   { code: 'unterminated-string', message: 'Unterminated string', offset: 14 },
//   { code: 'duplicate-attribute', message: 'Duplicate attribute "a"', offset: 37 },
// ]
```

Le plugin ESLint n'applique aucune correction dans un template qui contient des erreurs, puisqu'il
ne peut pas les vérifier.

## Codes {#codes}

| `code` | Exemple | Message |
|---|---|---|
| `unterminated-string` | `p(title="hi) x` | Unterminated string |
| `unclosed-attributes` | `p(title="hi"` | Attribute block is not closed with ")" |
| `unclosed-arguments` | `+card(1, 2` | Mixin arguments are not closed with ")" |
| `missing-attribute-value` | `p(title=) x` | Expected a value after the operator |
| `duplicate-attribute` | `p(a="1" a="2")` | Duplicate attribute "a" |
| `unexpected-character` | `p(a!b) x` | Expected "=" after "!" |
| `unbalanced-key` | `p([a="1") x` | Unclosed "[" in an attribute key |
| `bad-escape` | `p(a="\x")` | Invalid escape sequence in a JavaScript string |
| `inconsistent-indentation` | une ligne indentée par tabulation parmi des lignes indentées par espaces | Invalid indentation, you can use tabs or spaces but not both |
| `unterminated-interpolation` | `p Hi #{name` | Interpolation is not closed with "}" |
| `unsupported-syntax` | `#{tag} x` | Unsupported syntax: "#{tag} x" |

Chaque code couvre une famille de problèmes ; `unexpected-character`, `unbalanced-key`,
`inconsistent-indentation` et `unsupported-syntax` ont plusieurs messages.

Ils correspondent à ce que le compilateur Pug rejette, avec une différence voulue : un saut de ligne
dans une valeur d'attribut `'…'` ou `"…"` est `unterminated-string`, comme en JavaScript. Utilisez des
backticks pour les valeurs multilignes.

## `unsupported-syntax` {#unsupported-syntax}

Ce code marque du Pug valide que le parser ne gère pas, comme les noms de balises interpolés
(`#{tag}`) ou les blocs de texte sans balise. Quelques formes sont aussi analysées sans erreur mais
différemment de Pug. Les deux listes sont dans [Syntaxe Pug non prise en charge](/fr/guide/unsupported-syntax).
