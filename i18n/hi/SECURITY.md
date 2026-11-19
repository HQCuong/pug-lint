<sub>[English](../../SECURITY.md) | [Tiếng Việt](../vi/SECURITY.md) | [한국어](../ko/SECURITY.md) | [简体中文](../zh/SECURITY.md) | [日本語](../ja/SECURITY.md) | [Deutsch](../de/SECURITY.md) | [Français](../fr/SECURITY.md) | [Español](../es/SECURITY.md) | **हिन्दी** | [Português (Brasil)](../pt/SECURITY.md) | [Русский](../ru/SECURITY.md)</sub>

# सुरक्षा नीति

> यह अनुवाद अंग्रेज़ी संस्करण से पीछे हो सकता है। किसी भी अंतर की स्थिति में [अंग्रेज़ी संस्करण](../../SECURITY.md) ही मान्य है।

## समर्थित versions

केवल `eslint-plugin-pug-vue` और `pug-lint-parser` की नवीनतम release को ही fixes मिलते हैं।

## Vulnerability की रिपोर्ट करना

कृपया public issue न खोलें। विवरण, प्रभावित version और reproduce करने के चरणों के साथ इसे
[GitHub की private vulnerability reporting](https://github.com/HQCuong/pug-lint/security/advisories/new)
के ज़रिए निजी तौर पर रिपोर्ट करें।

आपको एक सप्ताह के भीतर उत्तर मिलना चाहिए। Fix release होने के बाद, advisory आपके श्रेय के साथ प्रकाशित की जाती है, जब तक
आप गुमनाम रहना न चाहें।

दोनों packages आपकी अपनी source फ़ाइलों पर ESLint के अंदर चलते हैं और कोई network requests नहीं करते। जो bug केवल
गलत lint परिणाम या गलत fix देता है वह vulnerability नहीं है; उसे सामान्य
[issue](https://github.com/HQCuong/pug-lint/issues/new/choose) के रूप में रिपोर्ट करें।
