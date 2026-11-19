---
title: Migrar desde eslint-plugin-vue-pug
description: "Pasa de eslint-plugin-vue-pug a eslint-plugin-pug-vue: desinstalación, configuración flat y las reglas que cambiaron."
---

# Migrar desde eslint-plugin-vue-pug

`eslint-plugin-vue-pug` se registra bajo la misma clave `vue-pug`, así que los dos plugins no
pueden usarse a la vez.

1. Desinstala `eslint-plugin-vue-pug` y `vue-eslint-parser-template-tokenizer-pug`, y elimina las
   entradas `plugin:vue-pug/...` de tu configuración. Este plugin necesita una configuración flat.
2. Instala y configura este plugin como en [Primeros pasos](./getting-started).
3. Sustituye las reglas antiguas:
   - `vue-pug/no-parsing-error` → `vue/no-parsing-error`, que informa de los errores de sintaxis de
     Pug y está activada en todas las configuraciones de eslint-plugin-vue salvo `flat/base`.
   - `vue-pug/component-name-in-template-casing` → ninguna: `vue/component-name-in-template-casing`
     falla con las plantillas Pug y está desactivada.
   - `vue-pug/no-pug-control-flow` conserva su id, pero sus opciones difieren: la regla antigua no
     admite opciones y estaba activada en las configuraciones `strongly-recommended` antiguas; esta
     admite `{ allow: [...] }` y no está en ninguna configuración. Consulta
     [su documentación](/es/rules/no-pug-control-flow#migrating-from-eslint-plugin-vue-pug).

Las configuraciones antiguas desactivaban algunas reglas de formato en todas partes
(`vue/html-indent`, `vue/html-self-closing`, …). Aquí siguen activas para las plantillas HTML y solo
se suprimen dentro de las plantillas Pug (salvo [las que fallan](./vue-rules)), y las reglas
`vue-pug/*` ocupan su lugar.
