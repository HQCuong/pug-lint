import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-lint'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vuePug.configs.recommended,
]
