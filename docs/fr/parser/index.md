---
title: pug-lint-parser
description: "pug-lint-parser : un parser Pug pour les outils de lint et de formatage, avec des plages de source exactes et une récupération d'erreurs. Il ne lève jamais d'exception et n'a aucune dépendance."
---

# pug-lint-parser

Un parser d'arbre syntaxique concret (CST) pour les templates Pug, conçu pour les outils de lint et de formatage.
C'est le parser derrière [`eslint-plugin-pug-vue`](https://github.com/HQCuong/pug-lint/tree/main/packages/eslint-plugin).

- **Ne lève jamais d'exception.** Une entrée qu'il ne peut pas analyser devient une entrée de `errors`,
  et l'analyse continue à la ligne suivante.
- **Plages de source exactes.** Chaque nœud, attribut, valeur, raccourci, virgule et ligne a une
  plage `[start, end)` : des offsets UTF-16 dans le texte que vous passez, de sorte que vous pouvez
  découper la source ou construire une modification minimale sans ajuster les positions.
- **Analyse une portion sur place.** `parsePug(text, { start, end })` n'analyse que `text[start, end)`
  (par exemple le contenu d'un bloc `<template lang="pug">`) ; les plages continuent de se rapporter
  à tout le `text`.
- **Conserve les fins de ligne.** LF et CRLF sont tous deux gérés ; `doc.eol` est la première fin de
  ligne rencontrée.
- Aucune dépendance à l'exécution. ESM uniquement. Node.js `^22.13.0 || >=24`.

## Utilisation {#usage}

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

La référence complète, avec tous les types de nœuds, est sur le site : [API](https://pug-lint.dev/fr/parser/api),
[arbre syntaxique](https://pug-lint.dev/fr/parser/syntax-tree), [erreurs](https://pug-lint.dev/fr/parser/errors) et
[recettes](https://pug-lint.dev/fr/parser/recipes).

- `parsePug(text, options?)` → `PugDocument`. `options.start` / `options.end` limitent l'analyse à
  cette plage de `text`.
- `walk(doc, visit)` : appelle `visit(node, parent)` pour chaque nœud dans l'ordre du document, y
  compris les balises à l'intérieur des interpolations de balise (`#[…]`).
- `fingerprint(doc)` → `string` : un résumé structurel de l'arbre (balises et leur imbrication,
  ensembles de classes et d'ids, nombre d'attributs, forme du texte et des interpolations). Il
  ignore les espaces, les guillemets, l'ordre des attributs, les noms et valeurs d'attributs autres
  que les `class` et `id` statiques, la casse des noms de balises, le contenu du texte et le contenu
  du code et des en-têtes de contrôle : `p(class="a b")` et `p.a.b` ont donc la même empreinte. Le
  plugin ESLint compare les empreintes pour rejeter les corrections qui changent la structure d'un
  template.
- `literalSpans(text, range)` → les plages des littéraux chaîne et des template literals dans une
  expression JavaScript.
- Les types de chaque nœud : `PugDocument`, `PugNode`, `Tag`, `AttributeBlock`, `Attribute`,
  `AttributeValue`, `Text`, `Comment`, `Code`, `Control`, `MixinCall`, `Filter`, `PugLine`,
  `PugParseError` et d'autres (voir `src/ast.ts`).

Un `PugDocument` a `children` (l'arbre), `errors` (`{ code, message, offset }`), `lines` (une entrée
par ligne source avec sa plage d'indentation, son type et sa profondeur logique), `eol` et
`indentUnit`.

## Syntaxe non prise en charge {#unsupported-syntax}

Certaines formes Pug sont signalées avec le code d'erreur `unsupported-syntax`, et quelques-unes sont
analysées sans erreur mais différemment de Pug. Elles sont listées dans
[docs/unsupported-syntax.md](https://github.com/HQCuong/pug-lint/blob/main/packages/pug-parser/docs/unsupported-syntax.md).

## Licence {#license}

MIT
