# Syntax reported as `unsupported-syntax`

The parser never throws. Input it does not model becomes an `unsupported-syntax`
error at the first offset it cannot read, and the rest of that line is skipped.
This file lists every known source of that error. Anything else that produces
`unsupported-syntax` is a bug.

"Invalid Pug" marks forms that Pug itself rejects; they are listed because the
parser reports them with this code too.

## Lines

| Form | Example | Notes |
| --- | --- | --- |
| Interpolated tag name | `#{tag} text` | |
| Tag interpolation or mustache at line start | `#[b x] y`, `{{ x }}` | Use `\| #[b x] y` / `\| {{ x }}`. |
| Anything else that does not start a Pug construct | `)`, `@x`, `.5` | |

## After a tag or mixin call head

| Form | Example | Notes |
| --- | --- | --- |
| Unbuffered code after a tag | `p- x` | |
| `.` followed by more on the line | `p. text`, `p.: a` | Invalid Pug. |
| Text block after a mixin call | `+m.` | |
| Block expansion after a mixin call | `+m: p` | `MixinCall` has no `expansion` field. As the child it is fine: `li: +m`. |
| `/` after a mixin call | `+m/` | |
| Block expansion after `/` | `img/: x` | Invalid Pug. |
| `:` not followed by a space and a child | `li:`, `li(x):b`, `when 1:` | Invalid Pug. |
| Expansion child that is not a tag or mixin call | `li: \| x`, `li: = x`, `li: // c`, `li: if x`, `when 1: each x in y` | A control keyword is never read as a tag name here. |
| Tag followed by an inline filter | `p: :markdown text` | |

## Control heads

| Form | Example | Notes |
| --- | --- | --- |
| Block expansion after a conditional or loop | `else: p`, `else : p`, `if x: p`, `unless x: p`, `else if x: p`, `while x: p`, `case x: p`, `each a in b: p`, `for a in b: p` | Invalid Pug. Reported at the first `:` of the head outside strings and brackets that does not close a top-level `?` (so `if a ? b : c` and `each v in {a: 1}` are fine). Expansion works after `when` and `default`: `when 1: p a`. |

## Filters

| Form | Example | Notes |
| --- | --- | --- |
| Anything but text after the filter head | `:a(x):b`, `:md.x` | Nested filters are read only as `:a:b(attrs)`, with attributes after the last name. |

## Tag interpolation `#[…]`

| Form | Example | Notes |
| --- | --- | --- |
| Not starting with a tag | `#[+m]`, `#[\| x]` | Mixin calls are not read inside `#[…]`. |
| Head followed by anything but text, `=`/`!=` code or `: child` | `#[p.]`, `#[p- x]`, `#[img/: x]` | |
