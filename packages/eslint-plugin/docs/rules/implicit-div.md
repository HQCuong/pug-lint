# vue-pug/implicit-div

Enforce or forbid the tag name `div` before class and id shorthands.

✅ Enabled in `configs.recommended` (at `warn`). 🔧 Fixable with `--fix`.

## Rule details

In Pug, a line that starts with a `.class` or `#id` shorthand is a `div`.

- `always` (default): use the implicit form. An explicit `div` followed by a shorthand is reported
  and the fix removes the name.
- `never`: write `div`. A tag that starts with a shorthand is reported and the fix inserts `div`.

A `div` without shorthands (`div`, `div(v-if="ok")`) is never reported. Two cases under `always`
are reported without a fix: a `div` inside a tag interpolation (`#[div.a x]`), and a `div` whose
first shorthand does not directly follow the name (`div(a).b`), because removing the name would
leave a line that starts with `(`.

### Incorrect

```vue
<template lang="pug">
div.card Content
</template>
```

```vue
<template lang="pug">
div#app.container
  p Hello
</template>
```

### Correct

```vue
<template lang="pug">
.card Content
</template>
```

```vue
<template lang="pug">
#app.container
  div(v-if="ready") Hello
</template>
```

## Options

```js
'vue-pug/implicit-div': ['warn', 'always']
```

`'always'` (default) or `'never'`.

### Incorrect with `["never"]`

```vue
<template lang="pug">
.card Content
</template>
```

### Correct with `["never"]`

```vue
<template lang="pug">
div.card Content
</template>
```
