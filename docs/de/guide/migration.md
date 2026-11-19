---
title: Umstieg von eslint-plugin-vue-pug
description: "Von eslint-plugin-vue-pug zu eslint-plugin-pug-vue wechseln: deinstallieren, Flat Config und die Regeln, die sich geändert haben."
---

# Umstieg von eslint-plugin-vue-pug

`eslint-plugin-vue-pug` registriert sich unter demselben Key `vue-pug`, die beiden Plugins lassen
sich also nicht zusammen verwenden.

1. Deinstallieren Sie `eslint-plugin-vue-pug` und `vue-eslint-parser-template-tokenizer-pug` und
   entfernen Sie die Einträge `plugin:vue-pug/...` aus Ihrer Config. Dieses Plugin braucht eine
   Flat Config.
2. Installieren und konfigurieren Sie dieses Plugin wie unter [Erste Schritte](./getting-started).
3. Ersetzen Sie die alten Regeln:
   - `vue-pug/no-parsing-error` → `vue/no-parsing-error`, das Pug-Syntaxfehler meldet und von jeder
     eslint-plugin-vue-Config außer `flat/base` aktiviert wird.
   - `vue-pug/component-name-in-template-casing` → keine: `vue/component-name-in-template-casing`
     stürzt auf Pug-Templates ab und ist abgeschaltet.
   - `vue-pug/no-pug-control-flow` behält seine ID, aber die Optionen unterscheiden sich: Die alte
     Regel hat keine Optionen und wurde von den alten `strongly-recommended`-Configs aktiviert;
     diese hier nimmt `{ allow: [...] }` und steckt in keiner Config. Siehe
     [ihre Dokumentation](/de/rules/no-pug-control-flow#migrating-from-eslint-plugin-vue-pug).

Die alten Configs schalteten einige Layout-Regeln überall ab (`vue/html-indent`,
`vue/html-self-closing`, …). Hier bleiben sie für HTML-Templates an und werden nur innerhalb von
Pug-Templates unterdrückt (außer den [abstürzenden](./vue-rules)), wobei `vue-pug/*`-Regeln ihren
Platz einnehmen.
