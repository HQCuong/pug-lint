import pluginVue from 'eslint-plugin-vue'
import vuePug from '@pug-lint/eslint-plugin'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
