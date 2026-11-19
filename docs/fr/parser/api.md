---
title: "API"
description: "Référence de l'API de pug-lint-parser : parsePug et ses options, walk, fingerprint, literalSpans et les types exportés."
---

# API

```js
import { parsePug, walk, fingerprint, literalSpans } from 'pug-lint-parser'
```

Le package est uniquement ESM, n'a aucune dépendance et fournit ses types TypeScript : tous les types
de nœuds ci-dessous sont exportés (`import type { Tag, PugDocument } from 'pug-lint-parser'`).

**Chaque position est un offset dans le `text` que vous avez passé** : un indice UTF-16, la même
unité que `String.prototype.slice`. Un `Range` est `[start, end)` : `text.slice(...range)` renvoie
donc la source d'un nœud, et `text.slice(0, start) + replacement + text.slice(end)` la modifie.

## `parsePug(text, options?)` {#parsepug-text-options}

```ts
function parsePug(text: string, options?: ParseOptions): PugDocument

interface ParseOptions {
  start?: number // default 0
  end?: number   // default text.length
}
```

Analyse `text[start, end)` et renvoie le [document](./syntax-tree#pugdocument). Elle ne lève jamais
d'exception : ce qu'elle ne sait pas analyser devient une entrée de `doc.errors`, et l'analyse
reprend à la ligne suivante (voir [Erreurs](./errors)).

`start` et `end` permettent d'analyser une partie d'un fichier plus grand sans le copier, par
exemple le contenu d'un bloc `<template lang="pug">` dans un fichier `.vue`. Les plages continuent de
se rapporter à tout le `text` :

```js
const sfc = '<template lang="pug">\ndiv\n  p Hi\n</template>\n'
const start = sfc.indexOf('>') + 1
const end = sfc.indexOf('</template>')
const doc = parsePug(sfc, { start, end })

doc.range                 // [21, 33]
doc.children[0].name      // { value: 'div', range: [22, 25] }
```

Quand toutes les lignes de la portion sont indentées d'un même montant, comme dans un template
indenté sous `<template>`, cette indentation commune sert de base : le parser la traite comme la
colonne 0, comme le fait Vue avant de compiler le template. Pug lui-même rejette un fichier `.pug`
indenté : le parser est donc plus tolérant ici que le compilateur Pug.

Les fins de ligne peuvent être LF ou CRLF ; un CR seul est lui aussi lu comme un saut de ligne. Un
BOM en tête n'est pas retiré : passez `start: 1` pour l'ignorer.

## `walk(doc, visit)` {#walk-doc-visit}

```ts
function walk(
  doc: PugDocument,
  visit: (node: PugNode, parent: PugNode | PugDocument) => void,
): void
```

Appelle `visit` pour chaque nœud dans l'ordre du document (parcours préfixe : un nœud avant ses
enfants). Elle descend dans `children` et dans la balise de chaque [interpolation de balise](./syntax-tree#text)
`#[…]`, dont le parent est le nœud `Text` qui la contient.

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

Une chaîne qui résume la **structure** d'un template : deux templates qui ont la même empreinte
produisent le même arbre d'éléments. Le plugin ESLint compare les empreintes pour rejeter les
corrections qui changeraient un template.

Ce qu'elle inclut :

- les balises, appels de mixin, textes, commentaires, blocs de code et de contrôle, et leur
  imbrication ;
- l'ensemble des classes et ids statiques de chaque balise, **quelle que soit leur forme** :
  `p(class="a b")` et `p.a.b` ont la même empreinte, `p.a` non ;
- le nombre des autres attributs, et le genre de chaque valeur (aucune ou chaîne, expression,
  template avec `${}`) ;
- chaque morceau de JavaScript que Pug compile, par son texte à l'indentation près : valeurs
  d'attributs expression et `${}`, `&attributes(…)`, arguments de mixins, code, en-têtes de contrôle
  et `#{…}` ;
- la forme du texte : où il est découpé en lignes et en interpolations.

Ce qu'elle ignore : les espaces et la largeur d'indentation, les guillemets, les virgules, l'ordre
et les noms des attributs, les valeurs d'attributs chaîne autres que `class` et `id`, la casse des
noms de balises, le contenu du texte, le `/` d'une balise auto-fermante et le `:` d'une expansion de
bloc.

```js
fingerprint(parsePug('p(class="a b") Hi')) === fingerprint(parsePug('p.a.b Hi'))  // true
fingerprint(parsePug('p.a Hi')) === fingerprint(parsePug('p.a.b Hi'))             // false
```

Le format de la chaîne ne fait pas partie de l'API : comparez les empreintes, ne les analysez pas.

## `literalSpans(text, range)` {#literalspans-text-range}

```ts
function literalSpans(text: string, range: [number, number]): [number, number][]
```

Les plages des littéraux chaîne (`'…'`, `"…"`) et des template literals (`` `…` ``) dans une
expression JavaScript située à `text[range]`. Utilisez-la pour distinguer le code du contenu des
chaînes, par exemple pour éviter de ré-indenter l'intérieur d'un template literal multiligne. Un
littéral non terminé court jusqu'à la fin de `range`.

```js
const e = 'f("a", `b ${c}`, d)'
literalSpans(e, [0, e.length])              // [[2, 5], [7, 15]]
                                            // '"a"' and '`b ${c}`'
```

## Types {#types}

| Type | Ce que c'est |
|---|---|
| `Range` | `[start: number, end: number]`, offsets dans `text` |
| `PugDocument` | Le résultat de `parsePug` : [arbre, lignes et erreurs](./syntax-tree#pugdocument) |
| `PugNode` | `Tag \| MixinCall \| Text \| Comment \| Code \| Control \| Filter` |
| `Tag`, `MixinCall`, `Text`, `Comment`, `Code`, `Control`, `Filter` | [Les nœuds](./syntax-tree#nodes) |
| `AttributeBlock`, `Attribute`, `AttributeValue` | [Les attributs](./syntax-tree#attributes) |
| `TextPart` | `Raw`, `Interpolation` ou `TagInterpolation` dans un `Text` |
| `ControlKeyword` | Le mot-clé d'un nœud `Control` |
| `PugLine` | [Une ligne source](./syntax-tree#lines) |
| `PugParseError` | [`{ code, message, offset }`](./errors) |
| `ParseOptions` | `{ start?, end? }` |
