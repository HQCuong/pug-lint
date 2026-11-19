---
title: "Règles `vue/*` sur Pug"
description: "Quelles règles d'eslint-plugin-vue s'exécutent sur les templates Pug, lesquelles sont désactivées parce qu'elles plantent, et lesquelles sont supprimées dans les templates Pug uniquement."
---

# Règles `vue/*` sur Pug

La plupart des règles d'eslint-plugin-vue fonctionnent sur les templates Pug comme sur le HTML. Les
autres sont mesurées par un harnais de compatibilité qui exécute chaque règle sur des templates Pug
et sur leurs équivalents HTML ; les résultats complets sont dans le
[tableau de compatibilité](./vue-compatibility).

## Règles qui plantent : désactivées partout {#crashing-rules-off-everywhere}

Les règles qui **plantent** sur les templates Pug sont désactivées par `configs.base`. Un élément
Pug n'a pas de balise fermante écrite : sa balise fermante est donc de largeur nulle, ce qui met en
défaut l'usage que ces règles font du token store de vue-eslint-parser.

Un plantage ne peut pas être filtré après coup, et une config ne peut sélectionner que des fichiers,
pas des templates : elles sont donc désactivées pour **tous** les fichiers `.vue`, templates HTML
compris. Dans un projet qui mélange templates HTML et Pug, ces règles ne vérifient donc plus non
plus les templates HTML. Les remplacements `vue-pug/*` couvrent les templates Pug.

## Règles supprimées : réduites au silence dans Pug uniquement {#suppressed-rules-silenced-inside-pug-only}

Les règles qui **signalent à tort** sur Pug, ou dont les **corrections casseraient ou
reformateraient** le Pug, ne sont pas désactivées. Le processor écarte leurs messages uniquement
lorsqu'ils se trouvent dans un template Pug : elles continuent donc de fonctionner sur les templates
HTML et dans `<script>`. Pour en conserver une malgré tout, voir
[Conserver une règle supprimée](./configuration#keeping-a-suppressed-rule).

## Les listes {#the-lists}

<!-- begin auto-generated vue rule lists -->

Turned off for every `.vue` file by `configs.base`, because they crash on Pug templates:

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

Suppressed inside Pug templates only (they keep working on HTML templates and in `<script>`):

- `vue/array-bracket-newline`
- `vue/array-element-newline`
- `vue/brace-style`
- `vue/first-attribute-linebreak` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-comment-content-newline`
- `vue/html-comment-content-spacing`
- `vue/html-end-tags` (Pug replacement: `vue-pug/self-closing`)
- `vue/html-quotes` (Pug replacement: `vue-pug/attribute-quotes`)
- `vue/html-self-closing` (Pug replacement: `vue-pug/self-closing`)
- `vue/max-attributes-per-line` (Pug replacement: `vue-pug/max-attributes-per-line`)
- `vue/multiline-html-element-content-newline`
- `vue/multiline-ternary`
- `vue/no-multi-spaces` (Pug replacement: `vue-pug/no-multi-spaces`)
- `vue/no-spaces-around-equal-signs-in-attribute` (Pug replacement: `vue-pug/attribute-equals-spacing`)
- `vue/no-unsupported-features`
- `vue/object-curly-newline`
- `vue/object-property-newline`
- `vue/padding-line-between-tags`
- `vue/singleline-html-element-content-newline`
- `vue/static-class-names-order`
- `vue/v-if-else-key`

<!-- end auto-generated vue rule lists -->
