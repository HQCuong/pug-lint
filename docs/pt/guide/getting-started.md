---
title: Primeiros passos
description: "Instale o eslint-plugin-pug-vue e faça lint de templates Pug em componentes Vue de arquivo único com ESLint: requisitos, instalação, flat config e o primeiro eslint --fix."
---

# Primeiros passos

O `eslint-plugin-pug-vue` faz lint e formata `<template lang="pug">` (e `lang="jade"`) em
componentes Vue de arquivo único:

- Suas regras `vue/*` do eslint-plugin-vue rodam em templates Pug, com os nomes de sempre e as
  opções que você já usa.
- As [regras `vue-pug/*`](/pt/rules/) formatam o próprio Pug: indentação, layout dos atributos,
  aspas, vírgulas, atalhos. Uma regra opcional reporta construções do Pug resolvidas em tempo de compilação.
- Toda correção que toca um template Pug é verificada antes de o ESLint aplicá-la
  ([o fix guard](./fix-guard)), então `--fix` e a correção ao salvar não quebram templates.
- Sem Prettier e sem formatador separado: as correções vêm do ESLint.

## Requisitos {#requirements}

- Node.js `^20.19.0 || ^22.13.0 || >=24`
- ESLint `^9.15.0 || ^10.0.0`, somente flat config (`eslint.config.js`)
- `eslint-plugin-vue` `^10.0.0` e `vue-eslint-parser` `^10.0.0`

## Instalação {#install}

::: code-group

```sh [npm]
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [pnpm]
pnpm add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [yarn]
yarn add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

:::

## Configuração {#configure}

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

Coloque `...vuePug.configs.recommended` **depois** das configs do eslint-plugin-vue. Ela define as
opções do parser, o processor e as regras que precisam estar desativadas para o Pug. Uma config
posterior que defina seu próprio processor, ou reative uma das [regras que travam](./vue-rules),
quebra o lint de arquivos Pug.

## Execução {#run-it}

```sh
npx eslint .          # report problems
npx eslint . --fix    # fix what can be fixed
```

Para corrigir ao salvar no VS Code, veja [Configuração do editor](./editor-setup).

## Próximos passos {#next-steps}

- [Configuração](./configuration): as duas configs, `baseIndent`, como manter uma regra suprimida.
- [Regras](/pt/rules/): o que cada regra `vue-pug/*` faz e suas opções.
- [Limitações conhecidas](./limitations), antes de adotar o plugin em uma base de código grande.
- Vindo do `eslint-plugin-vue-pug`? Leia [o guia de migração](./migration).
- Usa oxlint? Rode-o junto com o ESLint: veja [Uso com o oxlint](./oxlint).
