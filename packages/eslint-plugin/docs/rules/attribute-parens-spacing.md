# vue-pug/attribute-parens-spacing

Enforce consistent spacing inside the parentheses of Pug attribute blocks.

✅ Enabled in `configs.recommended` (at `warn`). 🔧 Fixable with `--fix`.

Replaces `vue/html-closing-bracket-spacing`, which crashes on Pug templates and is turned off by
`configs.base`.

## Rule details

The rule checks the whitespace directly after `(` and directly before `)` on the same line:

- `never` (default): no whitespace there. The fix removes it.
- `always`: at least one space there. The fix inserts one.

A side whose whitespace contains a line break belongs to
[`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md) and is left alone, and so is an
empty or whitespace-only block.

### Incorrect

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```

```vue
<template lang="pug">
input( type="text" name="q")
</template>
```

### Correct

```vue
<template lang="pug">
a(href="/") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
)
</template>
```

## Options

```js
'vue-pug/attribute-parens-spacing': ['warn', 'never']
```

`'never'` (default) or `'always'`.

### Incorrect with `["always"]`

```vue
<template lang="pug">
a(href="/") Home
</template>
```

### Correct with `["always"]`

```vue
<template lang="pug">
a( href="/" ) Home
</template>
```
