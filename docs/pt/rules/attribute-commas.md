---
title: vue-pug/attribute-commas
description: "vue-pug/attribute-commas (eslint-plugin-pug-vue): exige ou proíbe vírgulas entre atributos em blocos de atributos do Pug. Opções, exemplos e correções."
---

# vue-pug/attribute-commas

Exige ou proíbe vírgulas entre atributos em blocos de atributos do Pug.

✅ Ativada em `configs.recommended` (em `warn`). 🔧 Corrigível com `--fix`.

## Detalhes da regra {#rule-details}

O Pug aceita atributos separados por espaço em branco, por vírgulas, ou por ambos. Esta regra torna
a escolha consistente:

- `never` (padrão): toda vírgula em um bloco de atributos é reportada e removida.
- `always`: exatamente uma vírgula entre cada par de atributos. Uma vírgula ausente é inserida logo
  depois do atributo anterior; vírgulas extras no mesmo intervalo são removidas.

Com qualquer uma das opções, uma vírgula antes do primeiro atributo ou depois do último é
reportada. Quando remover uma vírgula colaria dois atributos (`a(x="1",y="2")`), a correção coloca
um espaço no lugar dela. A regra só mexe em caracteres de vírgula: com `always`, o espaço em branco
antes de uma vírgula (`x="1" , y="2"`) é mantido como está, e nenhuma outra regra o normaliza na v1.

### Incorreto {#incorrect}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text",
  name="q"
)
</template>
```

### Correto {#correct}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

## Opções {#options}

```js
'vue-pug/attribute-commas': ['warn', 'never']
```

`'never'` (padrão) ou `'always'`.

### Incorreto com `["always"]` {#incorrect-with-always}

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Correto com `["always"]` {#correct-with-always}

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```
