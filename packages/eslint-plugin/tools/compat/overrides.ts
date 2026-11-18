// Verdicts the compat harness does not decide. `forced-suppress`: a `vue-pug/*` rule replaces the vue rule
// inside Pug templates (Design §5) or the rule is wrong for Pug in a way the fixtures cannot show.
// `forced-keep`: the rule must keep running inside Pug templates whatever the harness measures.
// A measured `crash` always wins over an override (the rule must stay off), keeping `replacement`.

export interface Override {
  status: 'forced-suppress' | 'forced-keep'
  reason: string
  replacement?: string
}

const replacedBy = (replacement: string): Override => ({
  status: 'forced-suppress',
  reason: `replaced by ${replacement} inside Pug templates`,
  replacement,
})

export const overrides: Record<string, Override> = {
  'vue/comment-directive': {
    status: 'forced-keep',
    reason: 'implements eslint-disable directives written as Pug comments; its messages are directive bookkeeping',
  },
  'vue/no-parsing-error': {
    status: 'forced-keep',
    reason: 'reports Pug syntax errors from the tokenizer; no vue-pug rule does',
  },
  // Twin artifacts: the harness disagrees only because the HTML twin differs from the Pug source in
  // a way the rule rightly sees; on Pug the rule reports what it should.
  'vue/block-lang': {
    status: 'forced-keep',
    reason: 'reports the lang attribute of the <template> block itself, outside the Pug template; the twin has no lang',
  },
  'vue/max-len': {
    status: 'forced-keep',
    reason: 'measures source lines, which in Pug are real lines; pug.render puts the whole twin template on one line',
  },
  'vue/max-lines-per-block': {
    status: 'forced-keep',
    reason: 'counts source lines of the block; pug.render puts the whole twin template on one line',
  },
  'vue/no-bare-strings-in-template': {
    status: 'forced-keep',
    reason: 'each piped Pug text line is its own text node, while the twin joins them into one; every bare string is still reported once per line',
  },
  'vue/no-useless-v-bind': {
    status: 'forced-keep',
    reason: 'its only dropped fix turns :class="\'x\'" into a static class, which the structural fingerprint counts as a new class; the guard keeps that report and drops only that fix',
  },
  'vue/html-quotes': {
    status: 'forced-suppress',
    reason: 'its fixer escapes inner quotes as &quot;, which is wrong inside a Pug attribute (a JS string that Pug then HTML-escapes), and it does not know that a backtick is a legitimate Pug quote',
    replacement: 'vue-pug/attribute-quotes',
  },
  'vue/html-indent': replacedBy('vue-pug/indent'),
  'vue/max-attributes-per-line': replacedBy('vue-pug/max-attributes-per-line'),
  'vue/first-attribute-linebreak': replacedBy('vue-pug/attribute-parens-newline'),
  'vue/html-closing-bracket-newline': replacedBy('vue-pug/attribute-parens-newline'),
  'vue/html-closing-bracket-spacing': replacedBy('vue-pug/attribute-parens-spacing'),
  'vue/no-multi-spaces': replacedBy('vue-pug/no-multi-spaces'),
  'vue/no-spaces-around-equal-signs-in-attribute': replacedBy('vue-pug/attribute-equals-spacing'),
  'vue/html-self-closing': replacedBy('vue-pug/self-closing'),
  'vue/html-end-tags': replacedBy('vue-pug/self-closing'),
}
