# vue-pug/attribute-equals-spacing

Disallow spaces around the `=` and `!=` of Pug attributes.

✅ Enabled in `configs.recommended` (at `warn`). 🔧 Fixable with `--fix`.

Replaces `vue/no-spaces-around-equal-signs-in-attribute` inside Pug templates.

## Rule details

The whitespace between an attribute name and its `=` / `!=`, and between the operator and the
value, must be empty. The fix removes it. A gap that contains a line break is left alone.

### Incorrect

```vue
<template lang="pug">
a(href = "/") Home
</template>
```

```vue
<template lang="pug">
input(:value= "query" @input ="update")
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
div(v-html!="html" :title="title")
</template>
```

## Options

None.
