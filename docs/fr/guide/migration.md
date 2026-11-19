---
title: "Migrer depuis eslint-plugin-vue-pug"
description: "Passer d'eslint-plugin-vue-pug à eslint-plugin-pug-vue : désinstallation, flat config et règles modifiées."
---

# Migrer depuis eslint-plugin-vue-pug

`eslint-plugin-vue-pug` s'enregistre sous la même clé `vue-pug`, les deux plugins ne peuvent donc pas
être utilisés ensemble.

1. Désinstallez `eslint-plugin-vue-pug` et `vue-eslint-parser-template-tokenizer-pug`, et retirez les
   entrées `plugin:vue-pug/...` de votre config. Ce plugin nécessite une flat config.
2. Installez et configurez ce plugin comme dans [Prise en main](./getting-started).
3. Remplacez les anciennes règles :
   - `vue-pug/no-parsing-error` → `vue/no-parsing-error`, qui signale les erreurs de syntaxe Pug et
     est activée par toutes les configs d'eslint-plugin-vue sauf `flat/base`.
   - `vue-pug/component-name-in-template-casing` → aucune : `vue/component-name-in-template-casing`
     plante sur les templates Pug et est désactivée.
   - `vue-pug/no-pug-control-flow` garde son identifiant, mais ses options diffèrent : l'ancienne
     règle ne prenait aucune option et était activée par les anciennes configs
     `strongly-recommended` ; celle-ci prend `{ allow: [...] }` et ne fait partie d'aucune config.
     Voir [sa documentation](/fr/rules/no-pug-control-flow#migrating-from-eslint-plugin-vue-pug).

Les anciennes configs désactivaient partout certaines règles de mise en forme (`vue/html-indent`,
`vue/html-self-closing`, …). Ici elles restent actives pour les templates HTML et ne sont supprimées
que dans les templates Pug (sauf [celles qui plantent](./vue-rules)), les règles `vue-pug/*` prenant
leur place.
