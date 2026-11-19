---
title: Uso con oxlint
description: "Usa eslint-plugin-pug-vue en un proyecto con oxlint: oxlint para los scripts, ESLint para las plantillas de Vue, con eslint-plugin-oxlint para evitar informes duplicados."
---

# Uso con oxlint

[Oxlint](https://oxc.rs/docs/guide/usage/linter) es un linter mucho más rápido escrito en Rust. En
un archivo `.vue` solo analiza los bloques `<script>`: no analiza `<template>`, ni HTML ni Pug, y no
puede cargar este plugin, que necesita vue-eslint-parser para leer la plantilla.

Así que en un proyecto que usa oxlint, ejecuta ambos:

- **oxlint** para JavaScript y TypeScript, incluido el `<script>` de los archivos `.vue`;
- **ESLint** para lo que oxlint aún no puede hacer: las plantillas, con eslint-plugin-vue y
  `eslint-plugin-pug-vue`.

[`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) desactiva en ESLint
todas las reglas que tu configuración de oxlint ya ejecuta, así que ningún problema se informa dos
veces y ESLint trabaja menos.

## Instalación {#install}

```sh
npm install --save-dev oxlint eslint-plugin-oxlint \
  eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue
```

## Configurar oxlint {#configure-oxlint}

Crea `.oxlintrc.json` con `npx oxlint --init` y añade `vue` a sus plugins para que oxlint también
ejecute sus reglas de Vue sobre los bloques `<script>`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "vue"],
  "categories": {
    "correctness": "error"
  }
}
```

## Configurar ESLint {#configure-eslint}

Pon la configuración de oxlint **al final**, después de `vuePug.configs.recommended`:

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-vue'
import oxlint from 'eslint-plugin-oxlint'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  // Last: turn off the rules that .oxlintrc.json already runs.
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
]
```

Las reglas que desactiva son reglas de script (`no-debugger`, `vue/no-dupe-keys`,
`vue/valid-define-props`, …). No desactiva ninguna regla de plantilla ni ninguna regla `vue-pug/*`,
así que las plantillas Pug se analizan y formatean exactamente igual que sin oxlint.

## Ejecútalos {#run-them}

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint:fix": "oxlint --fix && eslint . --fix"
  }
}
```

Oxlint se ejecuta primero: tarda milisegundos y sus errores aparecen antes de que arranque ESLint.
Oxlint omite los archivos que lista tu `.gitignore`, así que añade `node_modules` ahí si aún no
está.

`&&` se detiene en el primer linter que siga informando de un error. Si oxlint encuentra uno que no
puede corregir (una sentencia `debugger`, por ejemplo), `lint:fix` se detiene ahí y ESLint no da
formato a las plantillas. Corrige ese error, o ejecuta `npx eslint . --fix` por separado.

## VS Code {#vs-code}

Instala la [extensión de Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)
junto a la [extensión de ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
y deja que ambas corrijan al guardar:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.fixAll.eslint": "explicit"
  }
}
```

Las dos nunca corrigen lo mismo: oxlint corrige los scripts, ESLint corrige las plantillas, y toda
corrección que ESLint hace en una plantilla Pug sigue pasando por [la guarda de correcciones](./fix-guard).

## ¿Sin ESLint? {#without-eslint}

Todavía no. Oxlint puede ejecutar plugins de ESLint escritos en JavaScript, pero solo les entrega
los bloques `<script>` de un archivo `.vue`, y los parsers personalizados y los lenguajes de archivo
como las plantillas de Vue siguen en desarrollo en oxc. Cuando oxlint pueda analizar plantillas de
Vue, este plugin podrá seguirle: su parser, `pug-lint-parser`, no depende de ESLint. Hasta entonces,
mantén ESLint para las plantillas `.vue`.
