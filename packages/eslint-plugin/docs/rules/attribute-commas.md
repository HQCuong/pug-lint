# vue-pug/attribute-commas

Require or disallow commas between attributes in Pug attribute blocks.

✅ Enabled in `configs.recommended` (at `warn`). 🔧 Fixable with `--fix`.

## Rule details

Pug accepts attributes separated by whitespace, by commas, or both. This rule makes the choice
consistent:

- `never` (default): every comma in an attribute block is reported and removed.
- `always`: exactly one comma between each pair of attributes. A missing comma is inserted right
  after the attribute before it; extra commas in the same gap are removed.

With either option, a comma before the first attribute or after the last one is reported. When
removing a comma would glue two attributes together (`a(x="1",y="2")`), the fix puts one space in
its place. The rule only touches comma characters: with `always`, whitespace before a comma
(`x="1" , y="2"`) is left as it is, and no other rule normalizes it in v1.

### Incorrect

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```

```vue
<template lang="pug">
input(
  type="text",
  name="q"
)
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
input(
  type="text"
  name="q"
)
</template>
```

## Options

```js
'vue-pug/attribute-commas': ['warn', 'never']
```

`'never'` (default) or `'always'`.

### Incorrect with `["always"]`

```vue
<template lang="pug">
a(href="/" target="_blank") Home
</template>
```

### Correct with `["always"]`

```vue
<template lang="pug">
a(href="/", target="_blank") Home
</template>
```
