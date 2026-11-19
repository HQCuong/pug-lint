---
description: "eslint-plugin-pug-vue की ज्ञात सीमाएँ: multi-line attribute values, shorthands, HTML templates से AST के अंतर, और fix guard की लागत।"
---

# ज्ञात सीमाएँ

- **Multi-line attribute values के लिए backticks चाहिए।** `'…'` या `"…"` value के अंदर line break एक
  Pug syntax error है (Pug खुद उसे compile नहीं करता), जो `vue/no-parsing-error` से रिपोर्ट होती है।
  जब तक template में parse error है, उसके अंदर कोई fix लागू नहीं होता।
- **`vue/*` rules के लिए shorthands attributes नहीं हैं।** `.class` और `#id` shorthands attributes के रूप में
  सामने नहीं आते, इसलिए `vue/no-restricted-class` जैसे rules shorthand classes नहीं देखते।
- **Vue AST HTML template के AST से अलग है**, कुछ जगहों पर जिन्हें `vue/*` rules नोटिस कर सकते हैं:
  हर piped text line (`| text`) अपना text node है; template root पर सीधा text कोई
  text node नहीं बनाता; string attribute values कच्चे ही पास किए जाते हैं, इसलिए directive
  string के अंदर escaped quotes (`:x="f(\"a\")"`) एक फ़र्ज़ी Vue parse error दे सकते हैं।
- **बिना quotes वाले और `${}` attribute values** (`a(href=url)`, ``a(title=`${x}`)``) Pug के
  compile-time expressions हैं, Vue bindings नहीं। वे `vue/*` rules को सादे attribute
  values की तरह दिए जाते हैं, और fix guard उन्हें बदलने वाला हर fix हटा देता है।
- **Quote से शुरू होने वाला value एक ही string होना चाहिए।** `a(title="x" + y)` वैध Pug है लेकिन
  parse error (`vue/no-parsing-error`) के रूप में रिपोर्ट होता है, जानबूझकर: `a(title=("x" + y))` या
  `a(:title="'x' + y")` लिखें।
- **अकेले CR line breaks।** जिस template की lines अकेले `\r` (पुराने Mac style) पर खत्म होती हैं, उसमें
  `vue-pug/*` rules समस्याएँ रिपोर्ट करते हैं लेकिन उन्हें fix नहीं करते, और tokenizer एक parse error रिपोर्ट करता है।
  फ़ाइल को LF या CRLF में बदलें।
- **कुछ Pug syntax को parser असमर्थित बताकर रिपोर्ट करता है**, या Pug से अलग तरह से parse करता है:
  [असमर्थित Pug syntax](./unsupported-syntax) देखें।
- **Fix guard की लागत और आंशिक fix सेट:** [Fix guard](./fix-guard#cost) देखें।
