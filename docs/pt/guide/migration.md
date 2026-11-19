---
title: Migrando do eslint-plugin-vue-pug
description: "Migre do eslint-plugin-vue-pug para o eslint-plugin-pug-vue: desinstalação, flat config e as regras que mudaram."
---

# Migrando do eslint-plugin-vue-pug

O `eslint-plugin-vue-pug` se registra sob a mesma chave `vue-pug`, então os dois plugins não podem
ser usados juntos.

1. Desinstale o `eslint-plugin-vue-pug` e o `vue-eslint-parser-template-tokenizer-pug`, e remova as
   entradas `plugin:vue-pug/...` da sua config. Este plugin exige flat config.
2. Instale e configure este plugin como em [Primeiros passos](./getting-started).
3. Troque as regras antigas:
   - `vue-pug/no-parsing-error` → `vue/no-parsing-error`, que reporta erros de sintaxe do Pug e é
     ativada por toda config do eslint-plugin-vue, exceto `flat/base`.
   - `vue-pug/component-name-in-template-casing` → nenhuma: `vue/component-name-in-template-casing`
     trava em templates Pug e fica desativada.
   - `vue-pug/no-pug-control-flow` mantém o id, mas suas opções são diferentes: a regra antiga não
     aceita opções e era ativada pelas configs `strongly-recommended` antigas; esta aceita
     `{ allow: [...] }` e não está em nenhuma config. Veja
     [a documentação dela](/pt/rules/no-pug-control-flow#migrating-from-eslint-plugin-vue-pug).

As configs antigas desativavam algumas regras de layout em todo lugar (`vue/html-indent`,
`vue/html-self-closing`, …). Aqui elas continuam ativas para templates HTML e só são suprimidas
dentro de templates Pug (exceto as [que travam](./vue-rules)), com regras `vue-pug/*` no lugar delas.
