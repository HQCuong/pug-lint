# vue-pug/attribute-quotes

Enforce a consistent quote style for Pug attribute values.

✅ Enabled in `configs.recommended` (at `warn`). 🔧 Fixable with `--fix`.

Replaces `vue/html-quotes` inside Pug templates. That rule's fixer escapes inner quotes as
`&quot;`, which is wrong in Pug (an attribute value is a JavaScript expression), and it does not
know that backticks are valid Pug quotes.

## Rule details

A value that is a single `'…'` or `"…"` string in the other quote style is reported. The fix only
swaps the two quote characters, and never re-escapes anything: when the value contains the target
quote or a backslash, it is reported without a fix.

Backtick values are kept by default. With `backticks: 'convert'`, a backtick value is reported and
fixed only when it is on one line and contains no `${}`, no quote and no backslash; other backtick
values are left alone. Values that are not a single literal (`x`, `a + 'b'`, `{ a: 1 }`) are
never touched.

### Incorrect

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

```vue
<template lang="pug">
p(title='Say "hi"') Hello
</template>
```

The second example is reported without a fix: swapping the quotes would need escaping.

### Correct

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

```vue
<template lang="pug">
p(:class=`card` :title="'Hi ' + name" :data-id=id) Hello
</template>
```

## Options

```js
'vue-pug/attribute-quotes': ['warn', 'double', { backticks: 'keep' }]
```

- First option: `'double'` (default) or `'single'`.
- `backticks`: `'keep'` (default) or `'convert'`.

### Incorrect with `["single"]`

```vue
<template lang="pug">
a(href="/home") Home
</template>
```

### Correct with `["single"]`

```vue
<template lang="pug">
a(href='/home') Home
</template>
```

### Incorrect with `["double", { "backticks": "convert" }]`

```vue
<template lang="pug">
p(title=`Hello`) Hi
</template>
```

### Correct with `["double", { "backticks": "convert" }]`

```vue
<template lang="pug">
p(title=`Hello ${name}`) Hi
</template>
```
