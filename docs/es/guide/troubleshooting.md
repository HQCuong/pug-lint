---
title: Solución de problemas
description: "Soluciona problemas habituales de eslint-plugin-pug-vue: reglas vue/* que fallan, correcciones que no se aplican, nada informado en las plantillas Pug."
---

# Solución de problemas

## `TypeError: Cannot read properties of null (reading 'type')` (o `'range'`) {#typeerror-cannot-read-properties-of-null-reading-type-or-range}

Una de las reglas `vue/*` que fallan con las plantillas Pug se volvió a activar por una
configuración situada después de `...vuePug.configs.recommended` (o `base`), por ejemplo una
configuración compartida o una entrada de `rules` que la activa. `configs.base` las desactiva para
todos los archivos `.vue`:

<!-- begin auto-generated crashing rules -->

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

<!-- end auto-generated crashing rules -->

Pon `...vuePug.configs.recommended` después de toda configuración que las active, o quítalas de tus
propias `rules`. Usa en su lugar el reemplazo `vue-pug/*` para las plantillas Pug.

## Se informa de un problema pero `--fix` no lo corrige {#a-problem-is-reported-but-fix-does-not-fix-it}

La [guarda de correcciones](./fix-guard) descartó la corrección porque aplicarla habría cambiado la
estructura de la plantilla o la habría vuelto imposible de analizar. Corrige esa línea a mano. Si
crees que la corrección era segura, [abre un issue](https://github.com/HQCuong/pug-lint/issues/new/choose)
con la plantilla.

Comprueba también que la plantilla no tenga ningún problema de `vue/no-parsing-error`: mientras una
plantilla tenga un error de sintaxis de Pug, no se aplica ninguna corrección dentro de ella.

## No se informa de nada en las plantillas Pug {#nothing-is-reported-in-pug-templates}

- El bloque debe ser `<template lang="pug">` o `<template lang="jade">`.
- `...vuePug.configs.recommended` (o `base`) debe ir después de las configuraciones de
  eslint-plugin-vue, y ninguna configuración posterior puede establecer su propio `processor` para
  `**/*.vue`.
- En VS Code, `vue` debe estar en `eslint.validate` (consulta [Configuración del editor](./editor-setup)).

## El editor y la CLI no coinciden {#the-editor-and-the-cli-disagree}

La extensión de ESLint puede usar otro ESLint u otra configuración distinta de la de tu terminal.
Ejecuta `npx eslint --print-config src/App.vue` y compáralo con el panel de salida de la extensión
(canal *ESLint*).
