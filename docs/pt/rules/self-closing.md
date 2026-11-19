---
title: vue-pug/self-closing
description: "vue-pug/self-closing (eslint-plugin-pug-vue): exige ou proíbe a `/` de autofechamento de uma tag. Opções, exemplos e correções."
---

# vue-pug/self-closing

Exige ou proíbe a `/` de autofechamento de uma tag.

✅ Ativada em `configs.recommended` (em `warn`). 🔧 Corrigível com `--fix`.

Substitui `vue/html-self-closing` e `vue/html-end-tags` dentro de templates Pug.

## Detalhes da regra {#rule-details}

- `never` (padrão): toda `/` depois de uma tag (`img/`, `MyIcon/`) é reportada.
- `always-components`: um componente (um nome de tag com letra maiúscula ou hífen) sem conteúdo
  deve terminar com `/`, e a correção a adiciona. Toda outra tag não deve ter uma. Um componente que
  já tem `/` é mantido como está.

O Pug renderiza `p/ text` como `<p/>` seguido do texto, e rejeita `/` em uma tag com linhas
aninhadas. Por isso a correção só remove uma `/` quando nada vem depois dela na linha (nem um
espaço) e a tag não tem linhas aninhadas além de comentários sem buffer (`//-`). Caso contrário, a
`/` é reportada sem correção. Uma tag com qualquer conteúdo (texto, código, `.`, linhas aninhadas,
até um espaço no fim) nunca recebe uma `/`.

### Incorreto {#incorrect}

```vue
<template lang="pug">
img(src="logo.png")/
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")/
</template>
```

### Correto {#correct}

```vue
<template lang="pug">
img(src="logo.png")
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")
  br
</template>
```

## Opções {#options}

```js
'vue-pug/self-closing': ['warn', 'never']
```

`'never'` (padrão) ou `'always-components'`.

### Incorreto com `["always-components"]` {#incorrect-with-always-components}

```vue
<template lang="pug">
MyIcon(name="star")
</template>
```

### Correto com `["always-components"]` {#correct-with-always-components}

```vue
<template lang="pug">
div
  MyIcon(name="star")/
  my-icon/
  MyButton Save
  img(src="logo.png")
</template>
```
