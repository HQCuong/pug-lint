# vue-pug/max-attributes-per-line

Enforce a maximum number of attributes per line in Pug attribute blocks.

✅ Enabled in `configs.recommended` (at `warn`). 🔧 Fixable with `--fix`.

Replaces `vue/max-attributes-per-line` inside Pug templates.

## Rule details

Attributes are counted per attribute block: `a(w x)(y z)` has two blocks of two attributes each.

- A block on one line may hold up to `singleline` attributes (default `3`). Above that, every
  attribute after the first is reported.
- A block that contains any line break, including one inside a value, is multiline. Each of its
  lines may hold up to `multiline` attributes (default `1`); the extra ones are reported.

The fix replaces the whitespace before a reported attribute with a line break, indented one level
deeper than the tag (a comma stays with the attribute before it). Line breaks after `(` and before
`)` are left to [`vue-pug/attribute-parens-newline`](./attribute-parens-newline.md). Tags inside
a tag interpolation (`#[a(x y z w)]`) are not checked: they are part of a text line.

### Incorrect

```vue
<template lang="pug">
input(type="text" name="q" placeholder="Search" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text" name="q"
  required
)
</template>
```

### Correct

```vue
<template lang="pug">
input(type="text" name="q" required)
</template>
```

```vue
<template lang="pug">
input(
  type="text"
  name="q"
  placeholder="Search"
  required
)
</template>
```

## Options

```js
'vue-pug/max-attributes-per-line': ['warn', { singleline: 3, multiline: 1 }]
```

- `singleline` (integer ≥ 1, default `3`): the maximum for a block on one line.
- `multiline` (integer ≥ 1, default `1`): the maximum per line in a multiline block.

### Incorrect with `[{ "singleline": 1 }]`

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Correct with `[{ "singleline": 1 }]`

```vue
<template lang="pug">
a(href="/") Home
</template>
```
