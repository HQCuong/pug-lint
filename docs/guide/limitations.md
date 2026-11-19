# Known limitations

- **Multi-line attribute values need backticks.** A line break inside a `'…'` or `"…"` value is a
  Pug syntax error (Pug itself does not compile it), reported through `vue/no-parsing-error`.
  While a template has a parse error, no fix is applied inside it.
- **Shorthands are not attributes for `vue/*` rules.** `.class` and `#id` shorthands are not
  exposed as attributes, so rules such as `vue/no-restricted-class` do not see shorthand classes.
- **The Vue AST differs from an HTML template's** in a few places that `vue/*` rules can notice:
  each piped text line (`| text`) is its own text node; text directly at the template root has no
  text node; string attribute values are passed through raw, so escaped quotes inside a directive
  string (`:x="f(\"a\")"`) may give a spurious Vue parse error.
- **Unquoted and `${}` attribute values** (`a(href=url)`, ``a(title=`${x}`)``) are Pug
  compile-time expressions, not Vue bindings. They are passed to `vue/*` rules as plain attribute
  values, and the fix guard drops every fix that rewrites them.
- **A value that starts with a quote must be one string.** `a(title="x" + y)` is valid Pug but is
  reported as a parse error (`vue/no-parsing-error`), by design: write `a(title=("x" + y))` or
  `a(:title="'x' + y")`.
- **Lone CR line breaks.** In a template whose lines end with a lone `\r` (old Mac style), the
  `vue-pug/*` rules report problems but do not fix them, and the tokenizer reports a parse error.
  Convert the file to LF or CRLF.
- **Some Pug syntax is reported as unsupported**, or parsed differently from Pug, by the parser:
  see [Unsupported Pug syntax](./unsupported-syntax).
- **Fix guard cost and partial fix sets:** see [The fix guard](./fix-guard#cost).
