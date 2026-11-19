---
title: vue-pug/attribute-quotes
description: "vue-pug/attribute-quotes (eslint-plugin-pug-vue): impõe um estilo de aspas consistente nos valores de atributos do Pug. Opções, exemplos e correções."
---

# vue-pug/attribute-quotes

Impõe um estilo de aspas consistente nos valores de atributos do Pug.

✅ Ativada em `configs.recommended` (em `warn`). 🔧 Corrigível com `--fix`.

Substitui `vue/html-quotes` dentro de templates Pug. O fixer dessa regra escapa aspas internas como
`&quot;`, o que está errado no Pug (um valor de atributo é uma expressão JavaScript), e ela não sabe
que crases são aspas válidas no Pug.

## Detalhes da regra {#rule-details}

Um valor que é uma única string `'…'` ou `"…"` no outro estilo de aspas é reportado. A correção só
troca os dois caracteres de aspas e nunca reescapa nada: quando o valor contém as aspas de destino
ou uma barra invertida, ele é reportado sem correção.

Valores com crases são mantidos por padrão. Com `backticks: 'convert'`, um valor com crases é
reportado e corrigido apenas quando está em uma linha e não contém `${}`, aspas nem barra
invertida; os outros valores com crases são mantidos como estão. Valores que não são um único
literal (`x`, `a + 'b'`, `{ a: 1 }`) nunca são tocados.

### Incorreto {#incorrect}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

```vue
<template lang="pug">
p(title='Say "hi"') Hello
</template>
```

O segundo exemplo é reportado sem correção: trocar as aspas exigiria escape.

### Correto {#correct}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

```vue
<template lang="pug">
p(:class=`card` :title="'Hi ' + name" :data-id=id) Hello
</template>
```

## Opções {#options}

```js
'vue-pug/attribute-quotes': ['warn', 'double', { backticks: 'keep' }]
```

- Primeira opção: `'double'` (padrão) ou `'single'`.
- `backticks`: `'keep'` (padrão) ou `'convert'`.

### Incorreto com `["single"]` {#incorrect-with-single}

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

### Correto com `["single"]` {#correct-with-single}

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

### Incorreto com `["double", { "backticks": "convert" }]` {#incorrect-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello`) Hi
</template>
```

### Correto com `["double", { "backticks": "convert" }]` {#correct-with-double-backticks-convert}

```vue
<template lang="pug">
p(title=`Hello ${name}`) Hi
</template>
```
