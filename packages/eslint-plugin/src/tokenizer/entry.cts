// CommonJS entry: vue-eslint-parser `require`s the tokenizer path and uses `module.exports` as the constructor.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- the only import form a .cts file allows under verbatimModuleSyntax
import tokenizer = require('./tokenizer.ts')

export = tokenizer.PugTokenizer
