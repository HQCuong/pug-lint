---
layout: home
title: ESLint para plantillas Pug en Vue
description: "Lint y formato de plantillas Pug en componentes de un solo archivo de Vue con ESLint. Tus reglas vue/* se ejecutan sobre Pug, eslint --fix da formato al Pug y cada corrección se comprueba para que nunca rompa una plantilla."
# The hero and sections are written here, not with `hero`/`features` frontmatter, so the home
# page can hold the live --fix example. `markdownStyles: false` drops the .vp-doc wrapper; the
# sections opt back in with the vp-doc class where they render Markdown.
markdownStyles: false
---

<section class="pl-hero">
<div class="pl-hero-text">
<h1 class="home-heading">ESLint para plantillas Pug en Vue</h1>
<p class="pl-lead">Ejecuta tus reglas <code>vue/*</code> sobre <code>&lt;template lang="pug"&gt;</code>, da formato al Pug con <code>eslint --fix</code> y mantén cada plantilla intacta: cada corrección se comprueba antes de aplicarse.</p>
<div class="pl-install vp-doc">

```sh
npm i -D eslint-plugin-pug-vue
```

</div>
<div class="pl-actions">
<a class="pl-button primary" href="/es/guide/getting-started">Empezar</a>
<a class="pl-button" href="/es/rules/">Ver las 12 reglas</a>
</div>
</div>
<div class="pl-hero-demo">
<FixDemo />
</div>
</section>

<section class="pl-section vp-doc">
<div class="pl-row">
<div class="pl-row-text">

## Tus reglas `vue/*`, sobre Pug {#your-vue-rules-on-pug}

Las reglas de eslint-plugin-vue se ejecutan sobre las plantillas Pug con sus nombres y opciones
habituales: claves que faltan, variables sin usar, orden de atributos, sintaxis obsoleta. Las pocas
reglas que no pueden funcionar sobre Pug se desactivan, o se silencian solo dentro de las plantillas
Pug, así que siguen comprobando tus plantillas HTML.

[Qué reglas se ejecutan sobre Pug](/es/guide/vue-rules)

</div>
<div class="pl-row-code">

```vue
<template lang="pug">
ul
  li(v-for="todo in todos") {{ todo.title }}
</template>
```

```txt
3:3  error  Elements in iteration expect to have 'v-bind:key' directives  vue/require-v-for-key
```

</div>
</div>

<div class="pl-row">
<div class="pl-row-text">

## Formato con `eslint --fix` {#formatting-with-eslint-fix}

Doce pequeñas reglas `vue-pug/*` dan formato al propio Pug: la indentación, los espacios, las comas,
las comillas y los saltos de línea de los bloques de atributos, y los atajos `.class` / `#id`. Cada
una tiene opciones y puedes desactivar cualquiera. Sin Prettier, y sin un segundo formateador que
pelee con ESLint al guardar.

[Ver todas las reglas](/es/rules/)

</div>
<div class="pl-row-code">

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

</div>
</div>

<div class="pl-row">
<div class="pl-row-text">

## Correcciones que no pueden romper una plantilla {#fixes-that-cannot-break-a-template}

En Pug la indentación es estructura: mueve una línea y el árbol cambia. Por eso, antes de que ESLint
escriba una corrección en una plantilla Pug, el plugin la comprueba, sea cual sea la regla de la que
venga:

1. analiza la plantilla con la corrección aplicada;
2. compara con el original las etiquetas, su anidamiento, las clases, los atributos y cada expresión de JavaScript;
3. aplica la corrección solo si nada cambió. En caso contrario, descarta la corrección y mantiene la advertencia, para que corrijas esa línea a mano.

[Cómo funciona la guarda de correcciones](/es/guide/fix-guard)

</div>
<div class="pl-row-code">

```pug
//- the same template to the guard
p(class="intro lead") Hello
p.intro.lead Hello

//- a different one: a class is gone
p.intro Hello
```

<p class="pl-caption">Así, <code>vue-pug/prefer-shorthand</code> puede reescribir la primera línea como la segunda, pero una corrección que pierde una clase, o que mueve una línea a otro padre, nunca se aplica.</p>

</div>
</div>
</section>

<section class="pl-section pl-start vp-doc">

## Empieza en dos minutos {#start-in-two-minutes}

Necesita ESLint 9.15 o 10 con configuración flat, eslint-plugin-vue 10 y vue-eslint-parser 10.
[Primeros pasos](/es/guide/getting-started) recorre la instalación, la configuración y la corrección
al guardar en VS Code. ¿Vienes de eslint-plugin-vue-pug? Lee [la guía de migración](/es/guide/migration).

</section>
