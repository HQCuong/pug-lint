# vue-pug/indent

Enforce consistent indentation in Pug templates.

✅ Enabled in `configs.recommended` (at `warn`). 🔧 Fixable with `--fix`.

Replaces `vue/html-indent`, which crashes on Pug templates and is turned off by `configs.base`.

## Rule details

The rule checks the leading whitespace of every line in a `<template lang="pug">` block:

- A tag, text, code or control line is indented by one unit per nesting level.
- In a multi-line attribute block, attribute lines are one level deeper than the tag, and a line
  that starts with the closing `)` is at the tag's level.
- Lines of a text block (`p.`, `pre.`, `script.`), comment, code block or filter after the first
  keep their offset relative to the first line, so the block's own indentation is preserved when it
  moves. When the indent character changes (spaces to tabs or back), a line indented less than the
  first cannot keep its offset: it gets the first line's indentation, since mixing tabs and spaces
  is a Pug syntax error.
- Lines that start inside a string or template literal are never re-indented: their leading
  whitespace is part of the value.
- Lines in a region the parser reports as an error are skipped.

Pug indentation is structure: moving one line without its siblings and children changes the tree.
So every report of a template carries the same fix, which re-indents the whole span at once. One
surviving report is enough to fix all of them in a single pass.

### Incorrect

```vue
<template lang="pug">
div
   p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
      v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

### Correct

```vue
<template lang="pug">
div
  p Hello
</template>
```

```vue
<template lang="pug">
ul
  li(
    v-for="item in items"
    :key="item.id"
  ) {{ item.name }}
</template>
```

```vue
<template lang="pug">
div
  pre.
    first line
      keeps its extra indentation
  p(title=`a
      b`)
</template>
```

## Options

```js
'vue-pug/indent': ['warn', 2, { baseIndent: 0 }]
```

- First option: the indent unit, a number of spaces (default `2`) or `'tab'`.
- `baseIndent` (default `0`): the number of units added to every line, so top-level nodes can be
  indented relative to `<template>`.

### Incorrect with `["tab"]`

```vue
<template lang="pug">
div
  p Hello
</template>
```

### Correct with `["tab"]`

```vue
<template lang="pug">
div
	p Hello
</template>
```

### Correct with `[2, { "baseIndent": 1 }]`

```vue
<template lang="pug">
  div
    p Hello
</template>
```
