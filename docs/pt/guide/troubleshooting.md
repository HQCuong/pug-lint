---
title: Solução de problemas
description: "Resolva problemas comuns do eslint-plugin-pug-vue: regras vue/* que travam, correções que não são aplicadas, nada reportado em templates Pug."
---

# Solução de problemas

## `TypeError: Cannot read properties of null (reading 'type')` (ou `'range'`) {#typeerror-cannot-read-properties-of-null-reading-type-or-range}

Uma das regras `vue/*` que travam em templates Pug foi reativada por uma config colocada depois de
`...vuePug.configs.recommended` (ou `base`), por exemplo uma config compartilhada ou uma entrada em
`rules` que a ativa. `configs.base` desativa essas regras em todo arquivo `.vue`:

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

Coloque `...vuePug.configs.recommended` depois de toda config que as ative, ou remova-as das suas
próprias `rules`. Use no lugar delas a regra `vue-pug/*` equivalente para templates Pug.

## Um problema é reportado, mas o `--fix` não o corrige {#a-problem-is-reported-but-fix-does-not-fix-it}

O [fix guard](./fix-guard) descartou a correção porque aplicá-la mudaria a estrutura do template
ou o tornaria impossível de analisar. Corrija essa linha à mão. Se você acha que a correção era
segura, [abra uma issue](https://github.com/HQCuong/pug-lint/issues/new/choose) com o template.

Verifique também se o template não tem nenhum problema de `vue/no-parsing-error`: enquanto um
template tem um erro de sintaxe do Pug, nenhuma correção é aplicada dentro dele.

## Nada é reportado em templates Pug {#nothing-is-reported-in-pug-templates}

- O bloco deve ser `<template lang="pug">` ou `<template lang="jade">`.
- `...vuePug.configs.recommended` (ou `base`) deve vir depois das configs do eslint-plugin-vue, e
  nenhuma config posterior pode definir seu próprio `processor` para `**/*.vue`.
- No VS Code, `vue` deve estar em `eslint.validate` (veja [Configuração do editor](./editor-setup)).

## O editor e a CLI discordam {#the-editor-and-the-cli-disagree}

A extensão do ESLint pode usar outro ESLint ou outra config diferente da do seu terminal. Rode
`npx eslint --print-config src/App.vue` e compare com o painel de saída da extensão (canal
*ESLint*).
