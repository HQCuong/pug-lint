---
description: "pug-lint-parser के error codes उदाहरणों के साथ, error के बाद parser कैसे recover करता है, और offset को line और column में कैसे बदलें।"
---

# Errors

`parsePug` कभी throw नहीं करता। जो वह parse नहीं कर सकता वह `doc.errors` में एक entry बन जाता है, और template का
बाकी हिस्सा फिर भी parse होता है:

```ts
interface PugParseError {
  code: string     // one of the codes below
  message: string  // for people; may change between versions
  offset: number   // where the problem is, as an offset into text
}
```

`message` पर नहीं, `code` पर match करें। Line और column दिखाने के लिए offset से गिनें:

```js
const before = text.slice(0, error.offset)
const line = before.split('\n').length                    // 1-based
const column = error.offset - before.lastIndexOf('\n')    // 1-based
```

## Recovery {#recovery}

Error parse को नहीं रोकती। Parser खराब construct के अंत तक, या line के अंत तक छोड़ देता है, और अगली line से जारी रखता है।
Error के बाद जिन lines को कहीं रखा नहीं जा सकता, जैसे ऐसे construct के नीचे nested lines जिसके children नहीं हो सकते, वे
`doc.lines` में `continuation` kind के साथ रखी जाती हैं, और उनके लिए कोई node नहीं बनाया जाता।

```js
parsePug('div\n  p(class="a)\n  span ok\n  li(a=1 a=2)\n').errors
// [
//   { code: 'unterminated-string', message: 'Unterminated string', offset: 14 },
//   { code: 'duplicate-attribute', message: 'Duplicate attribute "a"', offset: 37 },
// ]
```

जिस template में errors हों, ESLint plugin उसके अंदर कोई fix लागू नहीं करता, क्योंकि वह उन्हें जाँच नहीं सकता।

## Codes {#codes}

| `code` | उदाहरण | Message |
|---|---|---|
| `unterminated-string` | `p(title="hi) x` | Unterminated string |
| `unclosed-attributes` | `p(title="hi"` | Attribute block is not closed with ")" |
| `unclosed-arguments` | `+card(1, 2` | Mixin arguments are not closed with ")" |
| `missing-attribute-value` | `p(title=) x` | Expected a value after the operator |
| `duplicate-attribute` | `p(a="1" a="2")` | Duplicate attribute "a" |
| `unexpected-character` | `p(a!b) x` | Expected "=" after "!" |
| `unbalanced-key` | `p([a="1") x` | Unclosed "[" in an attribute key |
| `bad-escape` | `p(a="\x")` | Invalid escape sequence in a JavaScript string |
| `inconsistent-indentation` | space-indented lines के बीच tab-indented line | Invalid indentation, you can use tabs or spaces but not both |
| `unterminated-interpolation` | `p Hi #{name` | Interpolation is not closed with "}" |
| `unsupported-syntax` | `#{tag} x` | Unsupported syntax: "#{tag} x" |

हर code समस्याओं के एक परिवार को कवर करता है; `unexpected-character`, `unbalanced-key`,
`inconsistent-indentation` और `unsupported-syntax` के कई messages हैं।

ये वही हैं जिन्हें Pug compiler अस्वीकार करता है, एक जानबूझकर अंतर के साथ: `'…'` या `"…"` attribute value के अंदर
line break `unterminated-string` है, जैसे JavaScript में। Multi-line values के लिए backticks उपयोग करें।

## `unsupported-syntax` {#unsupported-syntax}
यह code उस वैध Pug को चिह्नित करता है जिसे parser नहीं संभालता, जैसे interpolated tag names
(`#{tag}`) या बिना tag के text blocks। कुछ रूप बिना error के भी parse होते हैं
लेकिन Pug से अलग तरह से। दोनों सूचियाँ [असमर्थित Pug syntax](/hi/guide/unsupported-syntax) में हैं।
