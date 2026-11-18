// Fixtures of tests/fixtures/pug-cases/ where the parser intentionally differs
// from official Pug, with the reason. Every construct named here is listed in
// docs/unsupported-syntax.md. Vue-style fixtures may never be listed.
export const knownDifferences: Record<string, string> = {
  'filters.inline.pug': 'A filter inside tag interpolation (`#[:cdata x]`) is not modelled.',
  'html.pug': 'Literal HTML as a block expansion child (`p: <strong>x</strong>`) is not modelled.',
  'inline-block-comment.pug': 'Pug splits `block name // c` into a block and a sibling comment; the parser keeps the comment in the head.',
  'inline-tag.pug': 'Code inside tag interpolation (`#[- var x = 1]`) is not modelled.',
  'interpolated-mixin.pug': 'A mixin call inside tag interpolation (`#[+m()]`) is not modelled.',
  'lexer.text.pug': 'A text block without a tag (a line that is only `.`) is not modelled.',
  'mixin.block-tag-behaviour.pug': 'Block expansion (`+m: p`) and a text block (`+m.`) after a mixin call are not modelled.',
  'mixins.pug': 'An interpolated mixin name (`+#{name}`) is not modelled.',
  'mixins.rest-args.pug': 'An interpolated tag name (`#{tag}`) is not modelled.',
  'pipeless-tag.pug': 'Piped text inside tag interpolation (`#[| x]`) is not modelled.',
  'tag.interpolation.pug': 'An interpolated tag name (`#{tag}`) is not modelled.',
  'tags.self-closing.pug': 'An interpolated tag name (`#{tag}/`) is not modelled.',
  'text.pug': 'A text block without a tag (a line that is only `.`) is not modelled.',
}
