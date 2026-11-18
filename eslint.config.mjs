import tseslint from 'typescript-eslint'

const restrictedMessage = 'public API only — see Global Constraints'

export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/dist/**', 'docs/**', 'examples/.tmp-vue-pug/**'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['packages/eslint-plugin/src/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['eslint-plugin-vue/*', 'vue-eslint-parser/*'], message: restrictedMessage },
        ],
      }],
    },
  },
  {
    files: ['packages/pug-parser/src/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['eslint*', 'vue*'], message: restrictedMessage },
        ],
      }],
    },
  },
)
