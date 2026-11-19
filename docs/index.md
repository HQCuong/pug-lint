---
layout: home

hero:
  name: pug-lint
  text: ESLint for Pug templates in Vue
  tagline: Run your vue/* rules on &lt;template lang="pug"&gt;, format the Pug with --fix, and never get a broken template back.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Rules
      link: /rules/
    - theme: alt
      text: GitHub
      link: https://github.com/HQCuong/pug-lint

features:
  - title: Your vue/* rules, on Pug
    details: eslint-plugin-vue rules run on Pug templates under their usual names and options. The few that cannot work on Pug are turned off or silenced only inside Pug templates.
  - title: Formatting with eslint --fix
    details: Twelve small vue-pug/* rules handle indentation, attribute layout, quotes, commas and shorthands. No Prettier, no second formatter.
  - title: Fixes that cannot break a template
    details: Every fix that touches a Pug template is re-parsed and compared before ESLint applies it. A fix that would change the structure is dropped, so fix-on-save is safe.
---

## Before and after

```vue
<!-- before: eslint --fix -->
<template lang="pug">
div.card( class="shadow" , :title = "title" )
    h2( v-if='title' ) {{ title }}
    input(v-model="name" , type='text' disabled)/
</template>
```

```vue
<!-- after -->
<template lang="pug">
.card.shadow(:title="title")
  h2(v-if="title") {{ title }}
  input(v-model="name" type="text" disabled)
</template>
```
