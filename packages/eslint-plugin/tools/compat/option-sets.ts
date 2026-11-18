// Non-default option sets for rules that report nothing (or too little) on the compat fixtures with their
// default options. Each entry is a list of option arrays; the harness always runs `[]` (defaults) first.

export const optionSets: Record<string, unknown[][]> = {
  'vue/array-bracket-newline': [['always']],
  'vue/brace-style': [['1tbs', { allowSingleLine: false }]],
  'vue/component-name-in-template-casing': [['kebab-case'], ['PascalCase', { registeredComponentsOnly: false }]],
  'vue/html-comment-content-newline': [['always']],
  'vue/html-self-closing': [[{ html: { void: 'always', normal: 'always', component: 'always' } }]],
  'vue/match-component-file-name': [[{ extensions: ['vue'], shouldMatchCase: true }]],
  'vue/max-attributes-per-line': [[{ singleline: 1 }]],
  'vue/max-lines-per-block': [[{ template: 2, script: 2, style: 1 }]],
  'vue/max-props': [[{ maxProps: 1 }]],
  'vue/max-template-depth': [[{ maxDepth: 1 }]],
  'vue/no-restricted-block': [['style']],
  'vue/no-restricted-class': [['forbidden']],
  'vue/no-restricted-component-names': [['MyComp']],
  'vue/no-restricted-component-options': [['watch']],
  'vue/no-restricted-custom-event': [['fooBar']],
  'vue/no-restricted-html-elements': [['button']],
  'vue/no-restricted-props': [['msg']],
  'vue/no-restricted-static-attribute': [['title']],
  'vue/no-restricted-syntax': [['Identifier[name="go"]']],
  'vue/no-restricted-v-bind': [['/^model/']],
  'vue/no-restricted-v-on': [['click']],
  'vue/no-unsupported-features': [[{ version: '^2.5.0' }]],
  'vue/object-curly-newline': [['always']],
  'vue/script-indent': [[2, { baseIndent: 1 }]],
}
