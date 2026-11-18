# vue-pug/no-pug-control-flow

Disallow Pug compile-time constructs (control flow, code, mixins, `#{}` interpolation, includes).

Not enabled in `configs.recommended`. Not fixable.

## Rule details

Pug conditionals, loops, code, mixins and `#{}` interpolation run once, when the template is
compiled. Vue never sees them, so they are not reactive, and the `vue/*` rules do not see the
Pug logic itself. This rule reports them so that templates use Vue directives and bindings
instead. Each construct belongs to one category:

| Category | Reports |
|---|---|
| `control` | `if`, `else if`, `else`, `unless`, `each`, `for`, `while`, `case`, `when`, `default` |
| `code` | `- code`, `= expression`, `!= expression`, `p= expression` |
| `mixin` | mixin definitions (`mixin name`) and calls (`+name`) |
| `interpolation` | `#{…}` and `!{…}` in text |
| `include` | `include`, `extends`, `block`, `append`, `prepend`, `yield`, `doctype` |

### Incorrect

```vue
<template lang="pug">
ul
  each item in items
    li= item
</template>
```

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Correct

```vue
<template lang="pug">
ul
  li(v-for="item in items" :key="item") {{ item }}
</template>
```

```vue
<template lang="pug">
p(v-if="name") Hello {{ name }}
</template>
```

## Options

```js
'vue-pug/no-pug-control-flow': ['warn', { allow: [] }]
```

`allow`: categories that are not reported, any of `'control'`, `'code'`, `'mixin'`,
`'interpolation'`, `'include'` (default `[]`).

### Correct with `[{ "allow": ["interpolation"] }]`

```vue
<template lang="pug">
p Hello #{name}
</template>
```

### Incorrect with `[{ "allow": ["interpolation"] }]`

```vue
<template lang="pug">
p= name
</template>
```

## Migrating from `eslint-plugin-vue-pug`

`eslint-plugin-vue-pug` has a rule with the same id, `vue-pug/no-pug-control-flow`. Differences:

- Its schema is empty: it takes no options and always reports every construct it knows. This rule
  takes `{ allow: [...] }` (see above). Any options you passed to the old rule were rejected by
  ESLint, so an existing setting without options keeps working.
- The old rule was enabled (at `warn`) by its `strongly-recommended` configs. This rule is in no
  config: enable it yourself.
