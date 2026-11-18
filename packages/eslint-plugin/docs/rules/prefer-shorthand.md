# vue-pug/prefer-shorthand

Enforce or forbid `.class` / `#id` shorthands for static class and id attributes.

✅ Enabled in `configs.recommended` (at `warn`). 🔧 Fixable with `--fix`.

## Rule details

Class and id are configured separately, each with `always`, `never` or `ignore`.

- `always` (default for both): a static `class` or `id` attribute becomes shorthands:
  `p(class="a b")` → `p.a.b`, `p(id="x")` → `p#x`. New shorthands go after the existing ones, and an
  attribute block left empty is removed.
- `never`: shorthands become one attribute. Classes join an existing static `class` attribute;
  otherwise the new attribute is inserted first in the first attribute block (or in a new block),
  with the quote style of that block's first string value (`"` when there is none). A tag left
  with no name and no shorthand gets `div`.
- `ignore`: that kind is not checked.

Only static attributes are converted: the name is exactly `class` or `id`, the value is one plain
`'…'` or `"…"` string, and every whitespace-separated token in it is a valid Pug shorthand name.
If any token is not (`md:flex`, `w-1/2`, `-1`, `1a`), the whole value is left alone. An `id`
value must be a single token. Bound attributes (`:class`, `v-bind:id`) are never touched. A tag
that has both an id shorthand and an `id` attribute (an error in Pug) keeps its id as written.

All conversions of one tag are applied by a single fix, attached to the tag's first report.

### Incorrect

```vue
<template lang="pug">
p(class="lead") Text
</template>
```

```vue
<template lang="pug">
section(id="intro" class="hero dark")
</template>
```

### Correct

```vue
<template lang="pug">
p.lead Text
</template>
```

```vue
<template lang="pug">
section#intro.hero.dark(class="md:flex w-1/2" :class="{ active }")
</template>
```

## Options

```js
'vue-pug/prefer-shorthand': ['warn', { class: 'always', id: 'always' }]
```

`class` and `id`: `'always'` (default), `'never'` or `'ignore'`.

### Incorrect with `[{ "class": "never", "id": "always" }]`

```vue
<template lang="pug">
p.lead Text
</template>
```

### Correct with `[{ "class": "never", "id": "always" }]`

```vue
<template lang="pug">
p#intro(class="lead") Text
</template>
```
