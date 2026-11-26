---
title: Primeros pasos
description: "Instala eslint-plugin-pug-vue y analiza plantillas Pug en componentes de un solo archivo de Vue con ESLint: requisitos, instalación, configuración flat y el primer eslint --fix."
---

# Primeros pasos

`eslint-plugin-pug-vue` analiza y da formato a `<template lang="pug">` (y `lang="jade"`) en
componentes de un solo archivo de Vue:

- Tus reglas `vue/*` de eslint-plugin-vue se ejecutan sobre las plantillas Pug, con sus nombres
  habituales y tus opciones de siempre.
- Las [reglas `vue-pug/*`](/es/rules/) dan formato al propio Pug: indentación, disposición de
  atributos, comillas, comas, atajos. Una regla opcional informa de las construcciones Pug que se
  resuelven en tiempo de compilación.
- Cada corrección que toca una plantilla Pug se comprueba antes de que ESLint la aplique
  ([la guarda de correcciones](./fix-guard)), así que `--fix` y la corrección al guardar no rompen
  las plantillas.
- Sin Prettier ni un formateador aparte: las correcciones vienen de ESLint.

## Requisitos {#requirements}

- Node.js `^22.13.0 || >=24`
- ESLint `^9.15.0 || ^10.0.0`, solo configuración flat (`eslint.config.js`)
- `eslint-plugin-vue` `^10.0.0` y `vue-eslint-parser` `^10.0.0`

## Instalación {#install}

::: code-group

```sh [npm]
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [pnpm]
pnpm add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

```sh [yarn]
yarn add -D eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

:::

## Configuración {#configure}

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
```

Pon `...vuePug.configs.recommended` **después** de las configuraciones de eslint-plugin-vue.
Establece las opciones del parser, el procesador y las reglas que deben estar desactivadas para
Pug. Una configuración posterior que establezca su propio procesador, o que vuelva a activar una de
las [reglas que fallan](./vue-rules), rompe el análisis de los archivos Pug.

## Ejecútalo {#run-it}

```sh
npx eslint .          # report problems
npx eslint . --fix    # fix what can be fixed
```

Para corregir al guardar en VS Code, consulta [Configuración del editor](./editor-setup).

## Siguientes pasos {#next-steps}

- [Configuración](./configuration): las dos configuraciones, `baseIndent`, mantener una regla suprimida.
- [Reglas](/es/rules/): qué hace cada regla `vue-pug/*` y sus opciones.
- [Limitaciones conocidas](./limitations) antes de desplegarlo en una base de código grande.
- ¿Vienes de `eslint-plugin-vue-pug`? Lee [la guía de migración](./migration).
- ¿Usas oxlint? Ejecútalo junto a ESLint: consulta [Uso con oxlint](./oxlint).
