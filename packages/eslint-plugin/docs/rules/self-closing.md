# vue-pug/self-closing

Enforce or forbid the self-closing `/` of a tag.

✅ Enabled in `configs.recommended` (at `warn`). 🔧 Fixable with `--fix`.

Replaces `vue/html-self-closing` and `vue/html-end-tags` inside Pug templates.

## Rule details

- `never` (default): every `/` after a tag (`img/`, `MyIcon/`) is reported.
- `always-components`: a component (a tag name with an uppercase letter or a hyphen) that has no
  content must end with `/`, and the fix adds it. Every other tag must not have one. A component
  that already has `/` is left alone.

Pug renders `p/ text` as `<p/>` followed by the text, and rejects `/` on a tag with nested lines.
So the fix removes a `/` only when nothing follows it on its line (not even a space) and the tag
has no nested lines other than unbuffered comments (`//-`). Otherwise the `/` is reported without
a fix. A tag with any content (text, code, `.`, nested lines, even a trailing space) never gets a
`/` added.

### Incorrect

```vue
<template lang="pug">
img(src="logo.png")/
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")/
</template>
```

### Correct

```vue
<template lang="pug">
img(src="logo.png")
</template>
```

```vue
<template lang="pug">
div
  MyIcon(name="star")
  br
</template>
```

## Options

```js
'vue-pug/self-closing': ['warn', 'never']
```

`'never'` (default) or `'always-components'`.

### Incorrect with `["always-components"]`

```vue
<template lang="pug">
MyIcon(name="star")
</template>
```

### Correct with `["always-components"]`

```vue
<template lang="pug">
div
  MyIcon(name="star")/
  my-icon/
  MyButton Save
  img(src="logo.png")
</template>
```
