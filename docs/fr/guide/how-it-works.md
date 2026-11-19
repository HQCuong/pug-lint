---
title: "Fonctionnement"
description: "Comment eslint-plugin-pug-vue lint le Pug dans Vue : un tokenizer Pug pour vue-eslint-parser, des règles vue/* et vue-pug/*, et un fix guard qui vérifie chaque correction."
---

# Fonctionnement

ESLint ne sait pas lire le Pug de lui-même, et eslint-plugin-vue ne connaît que les templates HTML.
Le plugin relie les deux, puis vérifie chaque correction avant qu'ESLint ne l'écrive.

<HowItWorks />

## 1. Analyser {#_1-parse}

[vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser) analyse les fichiers `.vue` pour
eslint-plugin-vue. Pour un template dans un autre langage, il demande à un *tokenizer* de transformer
ce langage en tokens, tels qu'il les obtiendrait à partir de HTML. Le plugin en enregistre un pour
`lang="pug"` et `lang="jade"`.

Le tokenizer analyse le template avec [`pug-lint-parser`](/fr/parser/), puis émet pour chaque élément
Pug un token de balise ouvrante, de balise fermante, de texte et de `{{ }}`, aux positions exactes de
la source Pug. vue-eslint-parser en construit son AST de template habituel : les règles `vue/*`
pointent donc la bonne ligne et la bonne colonne dans votre Pug.

Une erreur de syntaxe Pug devient une erreur d'analyse que `vue/no-parsing-error` signale.

## 2. Linter {#_2-lint}

Deux sortes de règles s'exécutent sur le même fichier :

- **Les règles `vue/*`** d'eslint-plugin-vue lisent l'AST du template Vue, comme sur un template
  HTML : clés manquantes, variables inutilisées, ordre des attributs, syntaxe obsolète.
- **Les règles `vue-pug/*`** lisent directement l'arbre syntaxique Pug de `pug-lint-parser`. Cet
  arbre conserve ce que l'AST Vue perd : l'indentation, les virgules, les guillemets, les
  parenthèses, les raccourcis `.class` et `#id`. C'est là que travaillent les règles de formatage.

## 3. Vérifier {#_3-check}

Le plugin enveloppe le processor d'eslint-plugin-vue, qui voit chaque message avant qu'ESLint ne
l'utilise :

- **Supprimer.** Quelques règles `vue/*` ne peuvent pas fonctionner sur Pug : elles signalent de
  faux problèmes, ou leurs corrections écriraient du HTML dans un template Pug. Leurs messages sont
  écartés lorsqu'ils se trouvent dans un template Pug, et seulement là, de sorte qu'elles continuent
  de vérifier vos templates HTML. Les quelques règles qui plantent sur Pug sont désactivées à la
  place. [Les listes](./vue-rules).
- **Fix guard.** Toute correction qui touche un template Pug est appliquée à une copie du fichier,
  que `pug-lint-parser` ré-analyse. Le plugin compare la structure avant et après : les balises et
  leur imbrication, les classes et les ids, le nombre d'attributs, la forme du texte et chaque
  expression JavaScript. Si quelque chose a changé, ou si la copie ne s'analyse plus, la correction
  est écartée et son avertissement reste. [Détails](./fix-guard).

ESLint applique ensuite les corrections restantes, avec `eslint --fix` ou la correction à
l'enregistrement de votre éditeur.

## Les deux packages {#the-two-packages}

| Package | Rôle |
|---|---|
| [`eslint-plugin-pug-vue`](https://www.npmjs.com/package/eslint-plugin-pug-vue) | Le plugin ESLint : le tokenizer, les règles `vue-pug/*`, le processor et les configs. Celui que vous installez. |
| [`pug-lint-parser`](/fr/parser/) | Le parser Pug sur lequel tout ce qui précède est construit. Il ne sait rien d'ESLint ni de Vue, et vous pouvez l'utiliser seul. |
