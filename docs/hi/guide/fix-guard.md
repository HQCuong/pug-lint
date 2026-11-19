---
description: "Fix guard कैसे eslint --fix को Pug templates तोड़ने से रोकता है: ESLint के लागू करने से पहले हर fix दोबारा parse होता है और उसके structure की तुलना की जाती है।"
---

# Fix guard

जो autofix template को तोड़ दे, वह autofix न होने से भी बुरा है। Pug में यह आसानी से हो जाता है: indentation ही
structure है, और किसी line को उसके children के बिना हिलाने से tree बदल जाता है। इसलिए Pug template को छूने वाला
हर fix ESLint के लागू करने से पहले जाँचा जाता है।

## क्या जाँचा जाता है {#what-is-checked}

हर Pug template के लिए, fix तभी लागू होता है जब template बाद में भी parse हो और उसका
structure वही रहे:

- tags और उनकी nesting;
- हर tag के class और id का सेट और attribute की संख्या (इसलिए `p(class="a b")` और `p.a.b` बराबर हैं, लेकिन
  कोई class खो देना नहीं);
- text और interpolations का आकार;
- JavaScript का हर वह हिस्सा जिसे Pug compile करता है (बिना quotes वाले और `${}` attribute values, `&attributes`,
  mixin arguments, code, control heads, `#{}`), indentation को छोड़कर।

Parser वह सब रिपोर्ट करता है जिसे Pug खुद अस्वीकार करता है (जैसे tab/space का मेल या दोहराया गया attribute),
इसलिए जो fix उसे ले आए वह भी हटा दिया जाता है।

## Fixes कैसे लागू होते हैं {#how-fixes-are-applied}

1. हर fix को अलग से verify किया जाता है।
2. बचे हुए fixes को फिर से उस संयुक्त सेट के रूप में verify किया जाता है जिसे ESLint लागू करेगा।
3. जो fix विफल हो वह हटा दिया जाता है, और उसकी समस्या फिर भी रिपोर्ट होती है, ताकि आप उसे हाथ से ठीक कर सकें।

यह `.vue` फ़ाइलों को fix करने वाले हर rule को कवर करता है, `vue/*` rules और third-party rules समेत।
जब तक template में Pug syntax error है, उसके अंदर कोई fix लागू नहीं होता।

## लागत {#cost}

Guard हर अलग fix के लिए template को फिर से parse करता है, इसलिए उसकी लागत fixes की संख्या गुणा template के
आकार के साथ बढ़ती है। सामान्य template में कुछ milliseconds लगते हैं; पूरी तरह गलत format वाले
3000 lines के template में कई seconds लग सकते हैं। यह लागत तभी आती है जब template में ठीक करने लायक
समस्याएँ हों।

## आंशिक fix सेट {#partial-fix-sets}

Guard बचे हुए fixes के पूरे सेट को verify करता है। यदि ESLint उनमें से केवल कुछ लागू करता है
(`--fix-type`, या Node.js API में कस्टम `fix` predicate), तो उस उपसमूह को एक सेट के रूप में verify नहीं किया गया था।
