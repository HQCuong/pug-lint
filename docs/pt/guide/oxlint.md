---
title: Uso com o oxlint
description: "Use o eslint-plugin-pug-vue em um projeto com oxlint: oxlint para os scripts, ESLint para os templates Vue, com o eslint-plugin-oxlint para evitar relatórios duplicados."
---

# Uso com o oxlint

O [Oxlint](https://oxc.rs/docs/guide/usage/linter) é um linter muito mais rápido, escrito em Rust.
Em um arquivo `.vue`, ele faz lint só dos blocos `<script>`: não faz lint de `<template>`, HTML ou
Pug, e não consegue carregar este plugin, que precisa do vue-eslint-parser para ler o template.

Então, em um projeto que usa oxlint, rode os dois:

- **oxlint** para JavaScript e TypeScript, incluindo o `<script>` dos arquivos `.vue`;
- **ESLint** para o que o oxlint ainda não faz: os templates, com o eslint-plugin-vue e o
  `eslint-plugin-pug-vue`.

O [`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) desativa, no ESLint,
toda regra que sua config do oxlint já executa, então nenhum problema é reportado duas vezes e o
ESLint trabalha menos.

## Instalação {#install}

```sh
npm install --save-dev oxlint eslint-plugin-oxlint \
  eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

## Configurar o oxlint {#configure-oxlint}

Crie o `.oxlintrc.json` com `npx oxlint --init` e adicione `vue` aos plugins para que o oxlint
também rode suas regras de Vue nos blocos `<script>`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "vue"],
  "categories": {
    "correctness": "error"
  }
}
```

## Configurar o ESLint {#configure-eslint}

Coloque a config do oxlint **por último**, depois de `vuePug.configs.recommended`:

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'
import oxlint from 'eslint-plugin-oxlint'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  // Last: turn off the rules that .oxlintrc.json already runs.
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
]
```

As regras que ela desativa são regras de script (`no-debugger`, `vue/no-dupe-keys`,
`vue/valid-define-props`, …). Ela não desativa nenhuma regra de template nem nenhuma regra
`vue-pug/*`, então os templates Pug são verificados e formatados exatamente como sem o oxlint.

## Executar os dois {#run-them}

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint:fix": "oxlint --fix && eslint . --fix"
  }
}
```

O oxlint roda primeiro: leva milissegundos, e seus erros aparecem antes de o ESLint começar. O
oxlint ignora os arquivos listados no seu `.gitignore`, então adicione `node_modules` ali se ainda
não estiver.

O `&&` para no primeiro linter que ainda reporta um erro. Se o oxlint encontrar um que não consegue
corrigir (uma instrução `debugger`, por exemplo), o `lint:fix` para ali e o ESLint não formata os
templates. Corrija esse erro, ou rode `npx eslint . --fix` sozinho.

## VS Code {#vs-code}

Instale a [extensão do Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)
junto com a [extensão do ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
e deixe as duas corrigirem ao salvar:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```

Os dois nunca corrigem a mesma coisa: o oxlint corrige os scripts, o ESLint corrige os templates, e
toda correção que o ESLint faz em um template Pug ainda passa pelo [fix guard](./fix-guard).

## Sem o ESLint? {#without-eslint}

Ainda não. O oxlint consegue rodar plugins do ESLint escritos em JavaScript, mas entrega a eles só
os blocos `<script>` de um arquivo `.vue`, e parsers personalizados e linguagens de arquivo como
templates Vue ainda estão em andamento no oxc. Quando o oxlint conseguir fazer lint de templates
Vue, este plugin poderá acompanhar: seu parser, o `pug-lint-parser`, não depende do ESLint. Até
lá, mantenha o ESLint para os templates `.vue`.
