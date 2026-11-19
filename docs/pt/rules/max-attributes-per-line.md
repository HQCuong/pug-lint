---
title: vue-pug/max-attributes-per-line
description: "vue-pug/max-attributes-per-line (eslint-plugin-pug-vue): impõe um número máximo de atributos por linha em blocos de atributos do Pug. Opções, exemplos e correções."
---

# vue-pug/max-attributes-per-line

Impõe um número máximo de atributos por linha em blocos de atributos do Pug.

✅ Ativada em `configs.recommended` (em `warn`). 🔧 Corrigível com `--fix`.

Substitui `vue/max-attributes-per-line` dentro de templates Pug.

## Detalhes da regra {#rule-details}

Os atributos são contados por bloco de atributos: `a(w x)(y z)` tem dois blocos de dois atributos
cada.

- Um bloco em uma linha pode ter até `singleline` atributos (padrão `3`). Acima disso, todo
  atributo depois do primeiro é reportado.
- Um bloco que contém qualquer quebra de linha, inclusive dentro de um valor, tem várias linhas.
  Cada uma de suas linhas pode ter até `multiline` atributos (padrão `1`); os extras são reportados.

A correção troca o espaço em branco antes de um atributo reportado por uma quebra de linha,
indentada um nível abaixo da tag (uma vírgula fica com o atributo anterior). As quebras de linha
depois de `(` e antes de `)` ficam a cargo de
[`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md). Tags dentro de uma interpolação
de tag (`#[a(x y z w)]`) não são verificadas: elas fazem parte de uma linha de texto.

### Incorreto {#incorrect}

```vue
<template lang="pug">
input(type="text" name="q" placeholder="Search" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text" name="q"
  required
)
</template>
```

### Correto {#correct}

```vue
<template lang="pug">
input(type="text" name="q" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
  placeholder="Search"
  required
)
</template>
```

## Opções {#options}

```js
'vue-pug/max-attributes-per-line': ['warn', { singleline: 3, multiline: 1 }]
```

- `singleline` (inteiro ≥ 1, padrão `3`): o máximo para um bloco em uma linha.
- `multiline` (inteiro ≥ 1, padrão `1`): o máximo por linha em um bloco de várias linhas.

### Incorreto com `[{ "singleline": 1 }]` {#incorrect-with-singleline-1}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Correto com `[{ "singleline": 1 }]` {#correct-with-singleline-1}

```vue
<template lang="pug">
a(href="/") Home
</template>
```
