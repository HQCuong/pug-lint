# Manual test guide

This guide walks through trying `@pug-lint/eslint-plugin` by hand before anything is published.
The example project [`examples/vue-pug`](../examples/vue-pug) holds three deliberately messy Vue
single-file components with Pug templates:

| File | What is messy |
|---|---|
| `src/App.vue` | commas, single quotes, spaces inside `( … )`, spaces around `=`, double spaces, `div` before shorthands, static `class` attributes, a self-closing `img(…)/`, a tag with four attributes on one line, a multi-line attribute block without line breaks after `(` / before `)`, camelCase props (`vue/attribute-hyphenation`) |
| `src/components/UserCard.vue` | tab indentation (converted to 2 spaces), over-indented children, spaces inside `( … )`, double spaces, single quotes |
| `src/components/TodoList.vue` | a multi-line backtick attribute value (`` :class=`{ … }` ``), a misaligned continuation line, commas, `class = "…"`, a self-closing `input(…)/` |

The example is a workspace member that depends on the plugin with `workspace:*`. Its only script is
`lint:demo`, so the repo's own `pnpm lint` / `pnpm test` never touch these files.

## 1. Prepare

From the repo root:

```sh
corepack pnpm install
corepack pnpm build
```

The build is needed: the example loads the plugin from `packages/eslint-plugin/dist`.

## 2. Command line

Report the problems (exit code 0: every problem is a warning):

```sh
corepack pnpm -C examples/vue-pug lint:demo
# or: corepack pnpm -C examples/vue-pug exec eslint .
```

Expect about 50 warnings, almost all from `vue-pug/*` rules plus `vue/attribute-hyphenation` and
`vue/require-default-prop`.

Fix them:

```sh
corepack pnpm -C examples/vue-pug exec eslint . --fix
```

Expect:

- every `vue-pug/*` warning and `vue/attribute-hyphenation` is fixed; the two
  `vue/require-default-prop` warnings in `UserCard.vue` remain (that rule has no fix);
- for example, `div#app(class="layout")` becomes `#app.layout`, `h1(class='title' ,  :title = "pageTitle")`
  becomes `h1.title(:title="pageTitle")`, and the four-attribute `UserCard(…)` is split into one
  attribute per line with `(` and `)` on their own lines;
- running `eslint . --fix` a second time changes nothing.

`--fix` rewrites the committed example files. Restore them afterwards with:

```sh
git checkout -- examples/vue-pug
```

## 3. VS Code

1. Install the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
   (`dbaeumer.vscode-eslint`, version 3 or later, which picks up `eslint.config.mjs` on its own).
2. Open the folder `examples/vue-pug` itself (File → Open Folder), not the repo root, so that its
   `.vscode/settings.json` applies and the extension uses the example's ESLint:

   ```json
   {
     "eslint.validate": ["vue"],
     "eslint.workingDirectories": [{ "mode": "auto" }],
     "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
   }
   ```

3. Open `src/App.vue`. Expect yellow squiggles in the Pug template, and the same warnings in the
   Problems panel as on the command line.
4. Save the file (Cmd/Ctrl+S). Expect the template to be reformatted as with `--fix`; saving again
   changes nothing.
5. Try breaking things: make a quick edit that leaves the template invalid (for example delete a
   `)`), then save. Expect a `vue/no-parsing-error` error and **no** change to the template while
   it does not parse. Fix the syntax and save again: formatting resumes.
6. Try `src/components/UserCard.vue` (tabs) and `src/components/TodoList.vue` (multi-line backtick
   value) the same way.

If nothing is reported, check the ESLint output channel (View → Output → ESLint) and that
`corepack pnpm build` has run.

## 4. What not to expect

These are known limitations, described in full in
[packages/eslint-plugin/README.md, "Known limitations"](../packages/eslint-plugin/README.md#known-limitations):

- A line break inside a `'…'` or `"…"` attribute value is a Pug syntax error; multi-line values
  need backticks. While a template has a parse error, no fix is applied inside it.
- `.class` / `#id` shorthands are not attributes for `vue/*` rules (for example
  `vue/no-restricted-class` does not see shorthand classes).
- The Vue AST of a Pug template differs from an HTML template's in a few places (piped text lines,
  text at the template root, raw string attribute values).
- Unquoted and `${}` attribute values are Pug compile-time expressions, passed to `vue/*` rules as
  plain values.
- Some Pug syntax is reported as unsupported by the parser (see
  [unsupported-syntax.md](../packages/pug-parser/docs/unsupported-syntax.md)).
- The fix guard re-parses the template for each distinct fix: a fully misformatted, very large
  template can take seconds to fix.
- Partial fix sets (`--fix-type`, a custom `fix` predicate) are not verified as a set.
- Trailing spaces, blank lines and the final newline are not handled by `vue-pug/*` rules; use the
  `@stylistic` rules for them.
- Some `vue/*` rules are turned off for every `.vue` file because they crash on Pug
  (`vue/html-indent`, `vue/html-closing-bracket-newline`, `vue/html-closing-bracket-spacing`,
  `vue/component-name-in-template-casing`), and others are silenced inside Pug templates; see the
  README's "`vue/*` rules inside Pug templates".

## 5. Open questions

From the plan's decisions (§8, "Still open"). Defaults apply until you decide otherwise; neither
blocks a release.

1. **Shorthands as attributes.** Should `.class` / `#id` shorthands later be exposed as attributes
   (opt-in), so class-based `vue/*` rules see them? Default: not exposed.
2. **Docs site.** A documentation site (VitePress), or Markdown in the repo only? Default: Markdown
   only.

## 6. Release status

- Nothing was pushed and nothing was published. All work is local commits on the `feat/v1` branch.
- Both packages are still `"private": true` at version `0.0.0`, under the decided names
  `@pug-lint/eslint-plugin` (`packages/eslint-plugin`) and `@pug-lint/parser`
  (`packages/pug-parser`).
- Publishing needs your go-ahead: create the `pug-lint` npm org, remove `"private": true`, set the
  versions (changesets are configured), then publish.
