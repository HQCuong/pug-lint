# eslint-plugin-pug-vue

## 0.1.1

### Patch Changes

- 0538d5d: Keep parsing and the fix guard linear on long runs of spaces, tabs or dashes. A code line with a very long run of blanks made `fingerprint` (and so every fix check) quadratic: 80,000 tabs took about 4 seconds.
- Updated dependencies [0538d5d]
  - pug-lint-parser@0.1.1

## 0.1.0

### Minor Changes

- 4987adc: First release.

### Patch Changes

- Updated dependencies [4987adc]
  - pug-lint-parser@0.1.0
