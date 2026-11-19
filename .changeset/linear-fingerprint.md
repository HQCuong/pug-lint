---
'pug-lint-parser': patch
'eslint-plugin-pug-vue': patch
---

Keep parsing and the fix guard linear on long runs of spaces, tabs or dashes. A code line with a very long run of blanks made `fingerprint` (and so every fix check) quadratic: 80,000 tabs took about 4 seconds.
