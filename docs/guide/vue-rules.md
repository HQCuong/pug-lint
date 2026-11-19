# `vue/*` rules on Pug

Most eslint-plugin-vue rules work on Pug templates as they do on HTML. The rest are measured by a
compatibility harness that runs every rule on Pug templates and on their HTML equivalents; the full
results are in the [compatibility table](./vue-compatibility).

## Crashing rules: off everywhere

Rules that **crash** on Pug templates are turned off by `configs.base`. A Pug element has no written
end tag, so its end tag is zero-width, which breaks these rules' use of vue-eslint-parser's token
store.

A crash cannot be filtered afterwards, and a config can only select files, not templates, so they
are off for **every** `.vue` file, HTML templates included. In a project that mixes HTML and Pug
templates, these rules no longer check the HTML templates either. The `vue-pug/*` replacements
cover the Pug templates.

## Suppressed rules: silenced inside Pug only

Rules that **misreport** on Pug, or whose **fixes would break or reformat** Pug, are not turned off.
The processor drops their messages only when they are located inside a Pug template, so they keep
working on HTML templates and in `<script>`. To keep one anyway, see
[Keeping a suppressed rule](./configuration#keeping-a-suppressed-rule).

## The lists

<!-- begin auto-generated vue rule lists -->

Turned off for every `.vue` file by `configs.base`, because they crash on Pug templates:

- `vue/component-name-in-template-casing`
- `vue/html-closing-bracket-newline` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-closing-bracket-spacing` (Pug replacement: `vue-pug/attribute-parens-spacing`)
- `vue/html-indent` (Pug replacement: `vue-pug/indent`)

Suppressed inside Pug templates only (they keep working on HTML templates and in `<script>`):

- `vue/array-bracket-newline`
- `vue/array-element-newline`
- `vue/brace-style`
- `vue/first-attribute-linebreak` (Pug replacement: `vue-pug/attribute-parens-newline`)
- `vue/html-comment-content-newline`
- `vue/html-comment-content-spacing`
- `vue/html-end-tags` (Pug replacement: `vue-pug/self-closing`)
- `vue/html-quotes` (Pug replacement: `vue-pug/attribute-quotes`)
- `vue/html-self-closing` (Pug replacement: `vue-pug/self-closing`)
- `vue/max-attributes-per-line` (Pug replacement: `vue-pug/max-attributes-per-line`)
- `vue/multiline-html-element-content-newline`
- `vue/multiline-ternary`
- `vue/no-multi-spaces` (Pug replacement: `vue-pug/no-multi-spaces`)
- `vue/no-spaces-around-equal-signs-in-attribute` (Pug replacement: `vue-pug/attribute-equals-spacing`)
- `vue/no-unsupported-features`
- `vue/object-curly-newline`
- `vue/object-property-newline`
- `vue/padding-line-between-tags`
- `vue/singleline-html-element-content-newline`
- `vue/static-class-names-order`
- `vue/v-if-else-key`

<!-- end auto-generated vue rule lists -->
