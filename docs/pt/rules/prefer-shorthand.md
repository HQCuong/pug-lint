---
title: vue-pug/prefer-shorthand
description: "vue-pug/prefer-shorthand (eslint-plugin-pug-vue): exige ou proíbe os atalhos `.class` / `#id` para atributos class e id estáticos. Opções, exemplos e correções."
---

# vue-pug/prefer-shorthand

Exige ou proíbe os atalhos `.class` / `#id` para atributos class e id estáticos.

✅ Ativada em `configs.recommended` (em `warn`). 🔧 Corrigível com `--fix`.

## Detalhes da regra {#rule-details}

Class e id são configurados separadamente, cada um com `always`, `never` ou `ignore`.

- `always` (padrão para os dois): um atributo `class` ou `id` estático vira atalhos:
  `p(class="a b")` → `p.a.b`, `p(id="x")` → `p#x`. Os novos atalhos vão depois dos existentes, e um
  bloco de atributos que ficou vazio é removido.
- `never`: os atalhos viram um atributo. As classes se juntam a um atributo `class` estático
  existente; caso contrário, o novo atributo é inserido primeiro no primeiro bloco de atributos (ou
  em um novo bloco), com o estilo de aspas do primeiro valor string desse bloco (`"` quando não há
  nenhum). Uma tag que ficou sem nome e sem atalho recebe `div`.
- `ignore`: esse tipo não é verificado.

Só atributos estáticos são convertidos: o nome é exatamente `class` ou `id`, o valor é uma única
string simples `'…'` ou `"…"`, e cada token separado por espaço nela é um nome de atalho válido do
Pug. Se algum token não for (`md:flex`, `w-1/2`, `-1`, `1a`), o valor inteiro é mantido como está.
Um valor de `id` deve ser um único token. Atributos com bind (`:class`, `v-bind:id`) nunca são
tocados. Uma tag que tem tanto um atalho de id quanto um atributo `id` (um erro no Pug) mantém o id
como foi escrito.

Todas as conversões de uma tag são aplicadas por uma única correção, anexada ao primeiro relatório
da tag.

### Incorreto {#incorrect}

```vue
<template lang="pug">
p(class="lead") Text
</template>
```

```vue
<template lang="pug">
section(id="intro" class="hero dark")
</template>
```

### Correto {#correct}

```vue
<template lang="pug">
p.lead Text
</template>
```

```vue
<template lang="pug">
section#intro.hero.dark(class="md:flex w-1/2" :class="{ active }")
</template>
```

## Opções {#options}

```js
'vue-pug/prefer-shorthand': ['warn', { class: 'always', id: 'always' }]
```

`class` e `id`: `'always'` (padrão), `'never'` ou `'ignore'`.

### Incorreto com `[{ "class": "never", "id": "always" }]` {#incorrect-with-class-never-id-always}

```vue
<template lang="pug">
p.lead Text
</template>
```

### Correto com `[{ "class": "never", "id": "always" }]` {#correct-with-class-never-id-always}

```vue
<template lang="pug">
p#intro(class="lead") Text
</template>
```
