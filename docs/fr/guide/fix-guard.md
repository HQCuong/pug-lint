---
title: "Le fix guard"
description: "Comment le fix guard empêche eslint --fix de casser les templates Pug : chaque correction est ré-analysée et sa structure comparée avant qu'ESLint ne l'applique."
---

# Le fix guard

Une correction automatique qui casse un template est pire que pas de correction. Pug rend cela
facile : l'indentation est la structure, et déplacer une ligne sans ses enfants change l'arbre. Ainsi,
toute correction qui touche un template Pug est vérifiée avant qu'ESLint ne l'applique.

## Ce qui est vérifié {#what-is-checked}

Pour chaque template Pug, une correction n'est appliquée que si le template est encore analysable
ensuite et que sa structure est inchangée :

- les balises et leur imbrication ;
- l'ensemble des classes et des ids de chaque balise, et son nombre d'attributs (`p(class="a b")` et
  `p.a.b` sont donc égaux, mais perdre une classe ne l'est pas) ;
- la forme du texte et des interpolations ;
- chaque morceau de JavaScript que Pug compile (valeurs d'attributs sans guillemets et `${}`,
  `&attributes`, arguments de mixins, code, en-têtes de contrôle, `#{}`), à l'indentation près.

Le parser signale ce que Pug lui-même rejette (par exemple un mélange de tabulations et d'espaces ou
un attribut répété) ; une correction qui l'introduirait est donc elle aussi écartée.

## Comment les corrections sont appliquées {#how-fixes-are-applied}

1. Chaque correction est vérifiée isolément.
2. Les corrections restantes sont vérifiées à nouveau en tant qu'ensemble combiné, celui qu'ESLint
   appliquera.
3. Une correction qui échoue est écartée, et son problème reste signalé : à vous de la faire à la main.

Cela couvre toutes les règles qui corrigent des fichiers `.vue`, y compris les règles `vue/*` et
celles de tiers. Tant qu'un template contient une erreur de syntaxe Pug, aucune correction n'y est
appliquée.

## Coût {#cost}

Le guard ré-analyse le template pour chaque correction distincte : son coût croît donc avec le
nombre de corrections multiplié par la taille du template. Un template normal prend quelques
millisecondes ; un template de 3000 lignes entièrement mal formaté peut prendre plusieurs secondes.
Ce coût n'apparaît que tant qu'un template a des problèmes à corriger.

## Ensembles de corrections partiels {#partial-fix-sets}

Le guard vérifie l'ensemble complet des corrections restantes. Si ESLint n'en applique qu'une partie
(`--fix-type`, ou un prédicat `fix` personnalisé dans l'API Node.js), ce sous-ensemble n'a pas été
vérifié en tant qu'ensemble.
