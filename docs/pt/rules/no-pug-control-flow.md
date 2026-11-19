---
title: vue-pug/no-pug-control-flow
description: "vue-pug/no-pug-control-flow (eslint-plugin-pug-vue): proíbe construções do Pug resolvidas em tempo de compilação (controle de fluxo, código, mixins, interpolação `#{}`, includes). Opções, exemplos e correções."
---

# vue-pug/no-pug-control-flow

Proíbe construções do Pug resolvidas em tempo de compilação (controle de fluxo, código, mixins,
interpolação `#{}`, includes).

Não é ativada em `configs.recommended`. Não é corrigível.

## Detalhes da regra {#rule-details}

Condicionais, laços, código, mixins e interpolação `#{}` do Pug rodam uma vez, quando o template é
compilado. O Vue nunca os vê, então eles não são reativos, e as regras `vue/*` não enxergam a
própria lógica do Pug. Esta regra os reporta para que os templates usem diretivas e bindings do Vue.
Cada construção pertence a uma categoria:

| Categoria | Reporta |
|---|---|
| `control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default` |
| `code` | `- code`, `= expression`, `!= expression`, `p= expression` |
| `mixin` | definições de mixin (`mixin name`) e chamadas (`+name`) |
| `interpolation` | `#{…}` e `!{…}` em texto |
| `include` | `include`, `extends`, `block`, `append`, `prepend`, `yield`, `doctype` |

### Incorreto {#incorrect}

```vue
<template lang="pug">
ul
  each item in items
    li= item
</template>
```

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Correto {#correct}

```vue
<template lang="pug">
ul
  li(v-for="item in items" :key="item") {{ item }}
</template>
```

```vue
<template lang="pug">
p(v-if="name") Hello {{ name }}
</template>
```

## Opções {#options}

```js
'vue-pug/no-pug-control-flow': ['warn', { allow: [] }]
```

`allow`: categorias que não são reportadas, qualquer uma entre `'control'`, `'code'`, `'mixin'`,
`'interpolation'`, `'include'` (padrão `[]`).

### Correto com `[{ "allow": ["interpolation"] }]` {#correct-with-allow-interpolation}

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Incorreto com `[{ "allow": ["interpolation"] }]` {#incorrect-with-allow-interpolation}

```vue
<template lang="pug">
p= name
</template>
```

## Migrando do `eslint-plugin-vue-pug` {#migrating-from-eslint-plugin-vue-pug}

O `eslint-plugin-vue-pug` tem uma regra com o mesmo id, `vue-pug/no-pug-control-flow`. Diferenças:

- O schema dela é vazio: não aceita opções e sempre reporta todas as construções que conhece. Esta
  regra aceita `{ allow: [...] }` (veja acima). Qualquer opção que você passava para a regra antiga
  era rejeitada pelo ESLint, então uma configuração existente sem opções continua funcionando.
- A regra antiga era ativada (em `warn`) pelas configs `strongly-recommended` do plugin antigo. Esta
  regra não está em nenhuma config: ative-a você mesmo.
