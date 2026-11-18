# vue-pug/attribute-parens-newline

Enforce line breaks after `(` and before `)` of multiline Pug attribute blocks.

✅ Enabled in `configs.recommended` (at `warn`). 🔧 Fixable with `--fix`.

Replaces `vue/first-attribute-linebreak` and `vue/html-closing-bracket-newline` inside Pug
templates.

## Rule details

An attribute block is multiline when two of its attributes start on different lines.

- `multiline: 'always'` (default): a multiline block needs a line break right after `(` and right
  before `)`. The fix inserts the line break with the template's own line ending and indentation
  unit (the first attribute one level deeper than the tag, `)` at the tag's level).
- `multiline: 'never'`: a multiline block must not have those line breaks.

A block that is not multiline (including a block with a single attribute) must not have them
either. Same-line spaces next to the parentheses belong to
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md); an empty block is left alone.

### Incorrect

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```

```vue
<template lang="pug">
input(
  type="text"
)
</template>
```

### Correct

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

```vue
<template lang="pug">
input(type="text" name="q")
</template>
```

## Options

```js
'vue-pug/attribute-parens-newline': ['warn', { multiline: 'always' }]
```

`multiline`: `'always'` (default) or `'never'`.

### Incorrect with `[{ "multiline": "never" }]`

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

### Correct with `[{ "multiline": "never" }]`

```vue
<template lang="pug">
input(type="text"
  name="q")
</template>
```
