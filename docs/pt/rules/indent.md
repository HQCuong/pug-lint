---
title: vue-pug/indent
description: "vue-pug/indent (eslint-plugin-pug-vue): impõe indentação consistente em templates Pug. Opções, exemplos e correções."
---

# vue-pug/indent

Impõe indentação consistente em templates Pug.

✅ Ativada em `configs.recommended` (em `warn`). 🔧 Corrigível com `--fix`.

Substitui `vue/html-indent`, que trava em templates Pug e é desativada por `configs.base`.

## Detalhes da regra {#rule-details}

A regra verifica o espaço em branco inicial de cada linha em um bloco `<template lang="pug">`:

- Uma linha de tag, texto, código ou controle é indentada em uma unidade por nível de aninhamento.
- Em um bloco de atributos de várias linhas, as linhas de atributos ficam um nível abaixo da tag, e
  uma linha que começa com o `)` de fechamento fica no nível da tag.
- As linhas de um bloco de texto (`p.`, `pre.`, `script.`), comentário, bloco de código ou filtro
  depois da primeira mantêm o deslocamento relativo à primeira linha, então a indentação própria do
  bloco é preservada quando ele se move. Quando o caractere de indentação muda (espaços para tabs
  ou o contrário), uma linha indentada menos que a primeira não consegue manter o deslocamento: ela
  recebe a indentação da primeira linha, já que misturar tabs e espaços é um erro de sintaxe do Pug.
- Linhas que começam dentro de uma string ou template literal nunca são reindentadas: o espaço em
  branco inicial delas faz parte do valor.
- Linhas em uma região que o parser reporta como erro são ignoradas.

A indentação do Pug é a estrutura: mover uma linha sem seus irmãos e filhos muda a árvore. Por isso
todo relatório de um template traz a mesma correção, que reindenta o trecho inteiro de uma vez. Um
único relatório restante basta para corrigir todos eles em uma só passada.

### Incorreto {#incorrect}

```vue
<template lang="pug">
div
   p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
      v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

### Correto {#correct}

```vue
<template lang="pug">
div
  p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
    v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

```vue
<template lang="pug">
div
  pre.
    first line
      keeps its extra indentation
  p(title=`a
      b`)
</template>
```

## Opções {#options}

```js
'vue-pug/indent': ['warn', 2, { baseIndent: 0 }]
```

- Primeira opção: a unidade de indentação, um número de espaços (padrão `2`) ou `'tab'`.
- `baseIndent` (padrão `0`): o número de unidades somadas a todas as linhas, para que os nós de
  nível superior possam ser indentados em relação a `<template>`.

### Incorreto com `["tab"]` {#incorrect-with-tab}

```vue
<template lang="pug">
div
  p Hello
</template>
```

### Correto com `["tab"]` {#correct-with-tab}

```vue
<template lang="pug">
div
	p Hello
</template>
```

### Correto com `[2, { "baseIndent": 1 }]` {#correct-with-2-baseindent-1}

```vue
<template lang="pug">
  div
    p Hello
</template>
```
