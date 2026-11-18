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
| Interpolated tag name | `#{tag} text`, `#{tag}/` | |
| Interpolated mixin name | `+#{name}()` | `+ name` (spaces after `+`) is a mixin call. |
| Text block without a tag | a line that is only `.`, with text lines nested under it | Pug puts the text in the parent. Use `\|` lines. |
| Tag interpolation or mustache at line start | `#[b x] y`, `{{ x }}` | Use `\| #[b x] y` / `\| {{ x }}`. |
| Anything else that does not start a Pug construct | `)`, `@x`, `.5` | |
| Lines nested under piped text | `\| a` with an indented `p` below it | Invalid Pug. Reported once, at the first nested line; the nested lines are skipped and form an error-recovery region (`doc.lines` kind `continuation`). Lines nested under literal HTML (`<ul>`) are valid: Pug makes them siblings, and so does the parser. |
| Lines nested under buffered code | `= x` or `!= x` with an indented `p` below it | Invalid Pug. Reported and recovered as under piped text. Under `p= x` the lines are children of `p`, as in Pug. |

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
| Expansion child that is not a tag or mixin call | `li: \| x`, `li: <b>x</b>`, `li: = x`, `li: // c`, `li: if x`, `when 1: each x in y` | A control keyword is never read as a tag name here. |
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
| Not starting with a tag | `#[+m]`, `#[\| x]`, `#[- x]`, `#[:cdata x]` | Mixin calls, text, code and filters are not read inside `#[…]`. |
| Head followed by anything but text, `=`/`!=` code or `: child` | `#[p.]`, `#[p- x]`, `#[img/: x]` | |

## Parsed without an error, but not as Pug does

Found by the differential oracle (`tests/oracle`, Task 17).

| Form | Example | Notes |
| --- | --- | --- |
| Comment after a block name | `block content // c` | Pug ends the name at `//` and makes the rest a sibling comment that also takes the nested lines. The parser keeps it in the `block` head. |
| Duplicate attribute or id | `a(x=1 x=2)`, `#a#b` | Pug rejects them; the parser accepts them. |
| Empty `else` after `each` | `each x in y` … `else` with nothing nested | Pug rejects it; the parser accepts it. |
