---
title: Configuración
description: "Configura eslint-plugin-pug-vue: las configuraciones base y recommended, plantillas indentadas bajo <template>, mantener una regla vue/* suprimida y la clave del plugin."
---

# Configuración

## Las dos configuraciones {#the-two-configs}

Ambas configuraciones se aplican a `**/*.vue`.

| Configuración | Qué establece |
|---|---|
| `configs.base` | El tokenizador de plantillas Pug para vue-eslint-parser, el procesador (supresión de mensajes y [guarda de correcciones](./fix-guard)) y las [reglas `vue/*` que fallan](./vue-rules) desactivadas. No se activa ninguna regla `vue-pug/*`. |
| `configs.recommended` | `base` más todas las reglas `vue-pug/*` recomendadas en `warn`. |

Usa `base` cuando quieras elegir tú mismo las reglas `vue-pug/*`:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.base,
  {
    files: ['**/*.vue'],
    rules: {
      'vue-pug/indent': 'error',
      'vue-pug/attribute-quotes': ['error', 'single'],
    },
  },
]
```

Tus propios `languageOptions.parserOptions` (por ejemplo `parser` para TypeScript en `<script>`) se
fusionan con los del plugin, así que siguen funcionando.

## Plantillas indentadas bajo `<template>` {#templates-indented-under-template}

`vue-pug/indent` coloca los nodos de primer nivel en la columna 0 (`baseIndent: 0`, como en los
archivos `.pug`). Si tus plantillas están escritas un nivel por debajo de `<template>`, establece
`baseIndent: 1`, o la regla las moverá a la columna 0:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
  { files: ['**/*.vue'], rules: { 'vue-pug/indent': ['warn', 2, { baseIndent: 1 }] } },
]
```

Consulta [`vue-pug/indent`](/es/rules/indent) para ver todas las opciones.

## Mantener una regla suprimida {#keeping-a-suppressed-rule}

Algunas reglas `vue/*` [se suprimen dentro de las plantillas Pug](./vue-rules). Para que una siga
informando ahí, construye las configuraciones con `configure()` y úsalas en lugar de `vuePug.configs`:

```js
export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configure({ keepVueRules: ['vue/html-self-closing'] }).recommended,
]
```

Hazlo bajo tu propio riesgo. Una regla de la lista de suprimidas puede informar de problemas falsos
y sus correcciones pueden no ser estables en Pug: por ejemplo,
`vue/singleline-html-element-content-newline` añade otra línea en blanco en cada pasada.
`keepVueRules` no se aplica a las reglas que fallan, que siguen desactivadas.

## Clave del plugin {#plugin-key}

El plugin se registra bajo la clave `vue-pug`. Todos los ids de regla (`vue-pug/indent`, …) y las
configuraciones la usan. Registrar el plugin bajo otra clave no está admitido.

## Espacios finales, líneas en blanco, salto de línea final {#trailing-spaces-blank-lines-final-newline}

Las reglas `vue-pug/*` no se ocupan de esto. Usa las reglas de [`@stylistic`](https://eslint.style/)
`@stylistic/no-trailing-spaces`, `@stylistic/no-multiple-empty-lines` y `@stylistic/eol-last`:
funcionan sobre todo el archivo `.vue`, plantillas Pug incluidas, y la guarda de correcciones
comprueba sus correcciones como las de cualquier otra regla.
