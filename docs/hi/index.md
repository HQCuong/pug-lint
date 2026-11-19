---
layout: home
title: Vue में Pug templates के लिए ESLint
description: ESLint से Vue single-file components के Pug templates को lint और format करें। आपके vue/* rules Pug पर चलते हैं, eslint --fix Pug को format करता है, और हर fix जाँचा जाता है, ताकि वह कभी template को न तोड़े।
# The hero and sections are written here, not with `hero`/`features` frontmatter, so the home
# page can hold the live --fix example. `markdownStyles: false` drops the .vp-doc wrapper; the
# sections opt back in with the vp-doc class where they render Markdown.
markdownStyles: false
---

<section class="pl-hero">
<div class="pl-hero-text">
<h1 class="home-heading">Vue में Pug templates के लिए ESLint</h1>
<p class="pl-lead">अपने <code>vue/*</code> rules को <code>&lt;template lang="pug"&gt;</code> पर चलाएँ, <code>eslint --fix</code> से Pug को format करें, और हर template को सुरक्षित रखें: हर fix लागू होने से पहले जाँचा जाता है।</p>
<div class="pl-install vp-doc">

```sh
npm i -D eslint-plugin-pug-vue
```

</div>
<div class="pl-actions">
<a class="pl-button primary" href="/hi/guide/getting-started">शुरुआत करें</a>
<a class="pl-button" href="/hi/rules/">सभी 12 rules देखें</a>
</div>
</div>
<div class="pl-hero-demo">
<FixDemo />
</div>
</section>

<section class="pl-section vp-doc">
<div class="pl-row">
<div class="pl-row-text">

## आपके `vue/*` rules, Pug पर {#your-vue-rules-on-pug}

eslint-plugin-vue के rules Pug templates पर अपने सामान्य नामों और options के साथ चलते हैं: गायब keys,
अप्रयुक्त variables, attribute का क्रम, deprecated syntax। जो थोड़े-से rules Pug पर काम नहीं कर सकते,
उन्हें बंद कर दिया जाता है, या केवल Pug templates के अंदर चुप कराया जाता है, ताकि वे आपके HTML templates को जाँचते रहें।

[कौन-से rules Pug पर चलते हैं](/hi/guide/vue-rules)

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

## `eslint --fix` से formatting {#formatting-with-eslint-fix}

बारह छोटे `vue-pug/*` rules खुद Pug को format करते हैं: indentation, attribute blocks की spacing, commas, quotes
और line breaks, तथा `.class` / `#id` shorthands। हर rule के options हैं, और आप किसी को भी बंद कर सकते हैं।
न Prettier, और न कोई दूसरा formatter जो save करते समय ESLint से टकराए।

[हर rule देखें](/hi/rules/)

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

## ऐसे fixes जो template को नहीं तोड़ सकते {#fixes-that-cannot-break-a-template}

Pug में indentation ही structure है: एक line हिलाइए और tree बदल जाता है। इसलिए ESLint किसी Pug template में
fix लिखे, उससे पहले plugin उसे जाँचता है, चाहे fix किसी भी rule से आया हो:

1. वह fix लागू करके template को parse करता है;
2. tags, उनकी nesting, classes, attributes और हर JavaScript expression की तुलना मूल template से करता है;
3. fix तभी लागू करता है जब कुछ भी न बदला हो। वरना fix हटा देता है और चेतावनी रखता है, ताकि आप वह line हाथ से ठीक कर सकें।

[Fix guard कैसे काम करता है](/hi/guide/fix-guard)

</div>
<div class="pl-row-code">

```pug
//- the same template to the guard
p(class="intro lead") Hello
p.intro.lead Hello

//- a different one: a class is gone
p.intro Hello
```

<p class="pl-caption">इसलिए <code>vue-pug/prefer-shorthand</code> पहली line को दूसरी में बदल सकता है, लेकिन जो fix कोई class खो दे, या किसी line को दूसरे parent में ले जाए, वह कभी लागू नहीं होता।</p>

</div>
</div>
</section>

<section class="pl-section pl-start vp-doc">

## दो मिनट में शुरू करें {#start-in-two-minutes}

इसे flat config वाला ESLint 9.15 या 10, eslint-plugin-vue 10 और vue-eslint-parser 10 चाहिए।
[शुरुआत करें](/hi/guide/getting-started) में install, config और VS Code में fix-on-save के चरण हैं।
eslint-plugin-vue-pug से आ रहे हैं? [माइग्रेशन गाइड](/hi/guide/migration) पढ़ें।

</section>
