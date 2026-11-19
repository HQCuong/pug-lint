---
title: Sintaxis de Pug no admitida
description: "Las formas de Pug que pug-lint-parser informa como no admitidas o analiza de manera distinta al compilador de Pug, y cómo reescribirlas."
---

# Sintaxis informada como `unsupported-syntax`

El parser nunca lanza excepciones. La entrada que no modela se convierte en un error
`unsupported-syntax` en el primer desplazamiento que no puede leer, y se omite el resto de esa
línea. Este archivo lista todas las fuentes conocidas de ese error. Cualquier otra cosa que
produzca `unsupported-syntax` es un fallo.

«Invalid Pug» marca las formas que el propio Pug rechaza; se listan porque el parser también las
informa con este código.

## Líneas {#lines}

| Forma | Ejemplo | Notas |
| --- | --- | --- |
| Nombre de etiqueta interpolado | `#{tag} text`, `#{tag}/` | |
| Nombre de mixin interpolado | `+#{name}()` | `+ name` (espacios tras `+`) es una llamada a mixin. |
| Bloque de texto sin etiqueta | una línea que es solo `.`, con líneas de texto anidadas debajo | Pug coloca el texto en el elemento padre. Usa líneas con `\|`. |
| Interpolación de etiqueta o mustache al inicio de línea | `#[b x] y`, `{{ x }}` | Usa `\| #[b x] y` / `\| {{ x }}`. |
| Cualquier otra cosa que no inicie una construcción de Pug | `)`, `@x`, `.5` | |
| Líneas anidadas bajo texto con tubería | `\| a` con un `p` indentado debajo | Invalid Pug. Se informa una vez, en la primera línea anidada; las líneas anidadas se omiten y forman una región de recuperación de errores (`doc.lines` de tipo `continuation`). Las líneas anidadas bajo HTML literal (`<ul>`) son válidas: Pug las convierte en hermanas, y el parser también. |
| Líneas anidadas bajo código con salida | `= x` o `!= x` con un `p` indentado debajo | Invalid Pug. Se informa y se recupera como bajo texto con tubería. Bajo `p= x` las líneas son hijas de `p`, como en Pug. |

## Tras la cabecera de una etiqueta o llamada a mixin {#after-a-tag-or-mixin-call-head}

| Forma | Ejemplo | Notas |
| --- | --- | --- |
| Código sin salida tras una etiqueta | `p- x` | |
| `.` seguido de más contenido en la línea | `p. text`, `p.: a` | Invalid Pug. |
| Bloque de texto tras una llamada a mixin | `+m.` | |
| Expansión de bloque tras una llamada a mixin | `+m: p` | `MixinCall` no tiene campo `expansion`. Como hijo es válido: `li: +m`. |
| `/` tras una llamada a mixin | `+m/` | |
| Expansión de bloque tras `/` | `img/: x` | Invalid Pug. |
| `:` no seguido de un espacio y un hijo | `li:`, `li(x):b`, `when 1:` | Invalid Pug. |
| Hijo de expansión que no es una etiqueta ni una llamada a mixin | `li: \| x`, `li: <b>x</b>`, `li: = x`, `li: // c`, `li: if x`, `when 1: each x in y` | Aquí una palabra clave de control nunca se lee como nombre de etiqueta. |
| Etiqueta seguida de un filtro en línea | `p: :markdown text` | |

## Cabeceras de control {#control-heads}

| Forma | Ejemplo | Notas |
| --- | --- | --- |
| Expansión de bloque tras un condicional o un bucle | `else: p`, `else : p`, `if x: p`, `unless x: p`, `else if x: p`, `while x: p`, `case x: p`, `each a in b: p`, `for a in b: p` | Invalid Pug. Se informa en el primer `:` de la cabecera fuera de cadenas y corchetes que no cierre un `?` de nivel superior (así `if a ? b : c` y `each v in {a: 1}` son válidos). La expansión funciona tras `when` y `default`: `when 1: p a`. |

## Filtros {#filters}

| Forma | Ejemplo | Notas |
| --- | --- | --- |
| Cualquier cosa que no sea texto tras la cabecera del filtro | `:a(x):b`, `:md.x` | Los filtros anidados solo se leen como `:a:b(attrs)`, con los atributos tras el último nombre. |

## Interpolación de etiqueta `#[…]` {#tag-interpolation}

| Forma | Ejemplo | Notas |
| --- | --- | --- |
| Que no empiece con una etiqueta | `#[+m]`, `#[\| x]`, `#[- x]`, `#[:cdata x]` | Las llamadas a mixin, el texto, el código y los filtros no se leen dentro de `#[…]`. |
| Cabecera seguida de algo que no sea texto, código `=`/`!=` o `: hijo` | `#[p.]`, `#[p- x]`, `#[img/: x]` | |

## Se analiza sin error, pero no como lo hace Pug {#parsed-without-an-error-but-not-as-pug-does}

Encontrado por el oráculo diferencial (`tests/oracle`, Task 17).

| Forma | Ejemplo | Notas |
| --- | --- | --- |
| Comentario tras el nombre de un bloque | `block content // c` | Pug termina el nombre en `//` y convierte el resto en un comentario hermano que también toma las líneas anidadas. El parser lo mantiene en la cabecera del `block`. |
| Atributo o id duplicado | `a(x=1 x=2)`, `#a#b` | Pug los rechaza; el parser los acepta. |
| `else` vacío tras `each` | `each x in y` … `else` sin nada anidado | Pug lo rechaza; el parser lo acepta. |
