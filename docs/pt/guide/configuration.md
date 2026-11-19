---
title: Configuração
description: "Configure o eslint-plugin-pug-vue: as configs base e recommended, templates indentados sob <template>, como manter uma regra vue/* suprimida e a chave do plugin."
---

# Configuração

## As duas configs {#the-two-configs}

As duas configs se aplicam a `**/*.vue`.

| Config | O que define |
|---|---|
| `configs.base` | O tokenizer de templates Pug para o vue-eslint-parser, o processor (supressão de mensagens e [fix guard](./fix-guard)) e as [regras `vue/*` que travam](./vue-rules) desativadas. Nenhuma regra `vue-pug/*` é ativada. |
| `configs.recommended` | `base` mais todas as regras `vue-pug/*` recomendadas em `warn`. |

Use `base` quando quiser escolher você mesmo as regras `vue-pug/*`:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.base,
  {
    files: ['**/*.vue'],
    rules: {
      'vue-pug/indent': 'error',
      'vue-pug/attribute-quotes': ['error', 'single'],
    },
  },
]
```

Seus próprios `languageOptions.parserOptions` (por exemplo `parser`, para TypeScript em `<script>`)
são mesclados com os do plugin, então continuam funcionando.

## Templates indentados sob `<template>` {#templates-indented-under-template}

`vue-pug/indent` coloca os nós de nível superior na coluna 0 (`baseIndent: 0`, como em arquivos
`.pug`). Se seus templates são escritos um nível abaixo de `<template>`, defina `baseIndent: 1`, ou
a regra os move para a coluna 0:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  { files: ['**/*.vue'], rules: { 'vue-pug/indent': ['warn', 2, { baseIndent: 1 }] } },
]
```

Veja [`vue-pug/indent`](/pt/rules/indent) para todas as opções.

## Manter uma regra suprimida {#keeping-a-suppressed-rule}

Algumas regras `vue/*` [são suprimidas dentro de templates Pug](./vue-rules). Para que uma delas
continue reportando ali, monte as configs com `configure()` e use-as no lugar de `vuePug.configs`:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configure({ keepVueRules: ['vue/html-self-closing'] }).recommended,
]
```

Isso é por sua conta e risco. Uma regra da lista de suprimidas pode reportar falsos problemas, e
suas correções podem não ser estáveis no Pug: por exemplo, `vue/singleline-html-element-content-newline`
adiciona mais uma linha em branco a cada passada. `keepVueRules` não vale para as regras que travam,
que continuam desativadas.

## Chave do plugin {#plugin-key}

O plugin é registrado sob a chave `vue-pug`. Todos os ids de regra (`vue-pug/indent`, …) e as configs
a usam. Registrar o plugin sob outra chave não é suportado.

## Espaços no fim da linha, linhas em branco, quebra de linha final {#trailing-spaces-blank-lines-final-newline}

As regras `vue-pug/*` não tratam disso. Use as regras do [`@stylistic`](https://eslint.style/)
`@stylistic/no-trailing-spaces`, `@stylistic/no-multiple-empty-lines` e `@stylistic/eol-last`:
elas trabalham sobre o arquivo `.vue` inteiro, templates Pug incluídos, e o fix guard verifica as
correções delas como as de qualquer outra regra.
