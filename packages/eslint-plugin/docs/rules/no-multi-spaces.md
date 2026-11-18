# vue-pug/no-multi-spaces

Disallow multiple spaces between attributes in Pug attribute blocks.

✅ Enabled in `configs.recommended` (at `warn`). 🔧 Fixable with `--fix`.

Replaces `vue/no-multi-spaces` inside Pug templates.

## Rule details

A run of two or more spaces or tabs on one line between two attributes of the same block is
reported, and the fix replaces it with one space. A comma stays with the attribute before it, so
only the whitespace after the last comma of the gap is measured.

Attribute values, the whitespace next to the parentheses (see
[`vue-pug/attribute-parens-spacing`](./attribute-parens-spacing.md)) and text after the tag are
never touched.

### Incorrect

```vue
<template lang="pug">
a(href="/"   target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(type="text",   name="q")
</template>
```

### Correct

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

```vue
<template lang="pug">
p(title="a   b")   spaced   text
</template>
```

## Options

None.
