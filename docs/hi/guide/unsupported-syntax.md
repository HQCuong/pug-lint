---
title: असमर्थित Pug syntax
description: "वे Pug रूप जिन्हें pug-lint-parser असमर्थित बताकर रिपोर्ट करता है या Pug compiler से अलग तरह से parse करता है, और उन्हें कैसे दोबारा लिखें।"
---

# `unsupported-syntax` के रूप में रिपोर्ट होने वाला syntax

Parser कभी throw नहीं करता। जो input वह model नहीं करता, वह पहले ऐसे offset पर `unsupported-syntax`
error बन जाता है जिसे वह पढ़ नहीं सकता, और उस line का बाकी हिस्सा छोड़ दिया जाता है।
यह फ़ाइल इस error के हर ज्ञात स्रोत की सूची देती है। `unsupported-syntax` देने वाली
कोई भी दूसरी चीज़ bug है।

"Invalid Pug" उन रूपों को चिह्नित करता है जिन्हें Pug खुद अस्वीकार करता है; वे सूची में इसलिए हैं क्योंकि
parser उन्हें भी इसी code से रिपोर्ट करता है।

## Lines {#lines}
| रूप | उदाहरण | टिप्पणियाँ |
| --- | --- | --- |
| Interpolated tag name | `#{tag} text`, `#{tag}/` | |
| Interpolated mixin name | `+#{name}()` | `+ name` (`+` के बाद spaces) एक mixin call है। |
| बिना tag का text block | केवल `.` वाली line, जिसके नीचे text lines nested हों | Pug text को parent में रखता है। `\|` lines उपयोग करें। |
| Line की शुरुआत में tag interpolation या mustache | `#[b x] y`, `{{ x }}` | `\| #[b x] y` / `\| {{ x }}` उपयोग करें। |
| कुछ भी और जो Pug construct शुरू नहीं करता | `)`, `@x`, `.5` | |
| Piped text के नीचे nested lines | `\| a` जिसके नीचे indent किया हुआ `p` हो | Invalid Pug। एक बार रिपोर्ट होता है, पहली nested line पर; nested lines छोड़ दी जाती हैं और error-recovery region बनाती हैं (`doc.lines` kind `continuation`)। Literal HTML (`<ul>`) के नीचे nested lines वैध हैं: Pug उन्हें siblings बनाता है, और parser भी। |
| Buffered code के नीचे nested lines | `= x` या `!= x` जिसके नीचे indent किया हुआ `p` हो | Invalid Pug। Piped text की तरह रिपोर्ट और recover होता है। `p= x` के नीचे lines, Pug की तरह, `p` के children हैं। |

## Tag या mixin call head के बाद {#after-a-tag-or-mixin-call-head}
| रूप | उदाहरण | टिप्पणियाँ |
| --- | --- | --- |
| Tag के बाद unbuffered code | `p- x` | |
| `.` के बाद line में और कुछ | `p. text`, `p.: a` | Invalid Pug। |
| Mixin call के बाद text block | `+m.` | |
| Mixin call के बाद block expansion | `+m: p` | `MixinCall` में `expansion` field नहीं है। Child के रूप में ठीक है: `li: +m`। |
| Mixin call के बाद `/` | `+m/` | |
| `/` के बाद block expansion | `img/: x` | Invalid Pug। |
| `:` के बाद space और child न होना | `li:`, `li(x):b`, `when 1:` | Invalid Pug। |
| Expansion child जो tag या mixin call नहीं है | `li: \| x`, `li: <b>x</b>`, `li: = x`, `li: // c`, `li: if x`, `when 1: each x in y` | Control keyword यहाँ कभी tag name के रूप में नहीं पढ़ा जाता। |
| Tag के बाद inline filter | `p: :markdown text` | |

## Control heads {#control-heads}
| रूप | उदाहरण | टिप्पणियाँ |
| --- | --- | --- |
| Conditional या loop के बाद block expansion | `else: p`, `else : p`, `if x: p`, `unless x: p`, `else if x: p`, `while x: p`, `case x: p`, `each a in b: p`, `for a in b: p` | Invalid Pug। Head के पहले `:` पर रिपोर्ट होता है जो strings और brackets के बाहर हो और किसी top-level `?` को बंद न करे (इसलिए `if a ? b : c` और `each v in {a: 1}` ठीक हैं)। Expansion `when` और `default` के बाद काम करता है: `when 1: p a`। |

## Filters {#filters}
| रूप | उदाहरण | टिप्पणियाँ |
| --- | --- | --- |
| Filter head के बाद text के अलावा कुछ भी | `:a(x):b`, `:md.x` | Nested filters केवल `:a:b(attrs)` के रूप में पढ़े जाते हैं, attributes आखिरी नाम के बाद। |

## Tag interpolation `#[…]` {#tag-interpolation}
| रूप | उदाहरण | टिप्पणियाँ |
| --- | --- | --- |
| Tag से शुरू न होना | `#[+m]`, `#[\| x]`, `#[- x]`, `#[:cdata x]` | `#[…]` के अंदर mixin calls, text, code और filters नहीं पढ़े जाते। |
| Head के बाद text, `=`/`!=` code या `: child` के अलावा कुछ भी | `#[p.]`, `#[p- x]`, `#[img/: x]` | |

## बिना error के parse होता है, लेकिन Pug की तरह नहीं {#parsed-without-an-error-but-not-as-pug-does}
Differential oracle (`tests/oracle`, Task 17) से मिला।

| रूप | उदाहरण | टिप्पणियाँ |
| --- | --- | --- |
| Block name के बाद comment | `block content // c` | Pug name को `//` पर खत्म करता है और बाकी को एक sibling comment बनाता है जो nested lines भी लेता है। Parser उसे `block` head में रखता है। |
| Duplicate attribute या id | `a(x=1 x=2)`, `#a#b` | Pug इन्हें अस्वीकार करता है; parser स्वीकार करता है। |
| `each` के बाद खाली `else` | `each x in y` … `else` जिसके नीचे कुछ nested नहीं | Pug इसे अस्वीकार करता है; parser स्वीकार करता है। |
