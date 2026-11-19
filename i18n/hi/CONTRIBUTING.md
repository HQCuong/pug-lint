<sub>[English](../../CONTRIBUTING.md) | [Tiếng Việt](../vi/CONTRIBUTING.md) | [한국어](../ko/CONTRIBUTING.md) | [简体中文](../zh/CONTRIBUTING.md) | [日本語](../ja/CONTRIBUTING.md) | [Deutsch](../de/CONTRIBUTING.md) | [Français](../fr/CONTRIBUTING.md) | [Español](../es/CONTRIBUTING.md) | **हिन्दी** | [Português (Brasil)](../pt/CONTRIBUTING.md) | [Русский](../ru/CONTRIBUTING.md)</sub>

# योगदान

> यह अनुवाद अंग्रेज़ी संस्करण से पीछे हो सकता है। किसी भी अंतर की स्थिति में [अंग्रेज़ी संस्करण](../../CONTRIBUTING.md) ही मान्य है।

मदद करने के लिए धन्यवाद। Bug reports, docs सुधार और pull requests, सभी का स्वागत है।

भाग लेने वाले हर व्यक्ति से [आचार संहिता](./CODE_OF_CONDUCT.md) का पालन करने की अपेक्षा की जाती है।

## शुरू करने से पहले

- **Bug या छोटा fix?** सीधे pull request खोलें, या यदि आपको पक्का नहीं कि यह bug है तो issue खोलें।
  Bug report सबसे उपयोगी तब होती है जब उसके साथ उसे दिखाने वाली सबसे छोटी `.vue` फ़ाइल और आपका
  `eslint.config.js` हो।
- **नया rule, नया option या default में बदलाव?** पहले issue खोलें ताकि code लिखने से पहले हम
  उसके स्वरूप पर सहमत हो सकें।

## Setup

[`.nvmrc`](../../.nvmrc) वाला Node version उपयोग करें (`nvm use`)। Repository एक
[pnpm](https://pnpm.io) workspace है; `corepack enable` आपको `package.json` में तय pnpm version देता है।

```sh
pnpm install     # also installs a pre-push hook that runs `pnpm check` (lint + typecheck)
pnpm build       # build both packages (the plugin tests use the parser's dist)
pnpm test        # run the test suites, on ESLint 9 and 10
pnpm docs:dev    # documentation site at http://localhost:5173
```

| Path | यह क्या है |
|---|---|
| `packages/pug-parser` | `pug-lint-parser`: Pug CST parser। |
| `packages/eslint-plugin` | `eslint-plugin-pug-vue`: vue-eslint-parser के लिए tokenizer, processor (suppression + fix guard), configs और `vue-pug/*` rules। |
| `docs` | VitePress documentation site। |
| `examples/vue-pug` | Plugin को हाथ से आज़माने के लिए एक छोटा Vue project (`docs/manual-test.md`)। |

## बुनियादी नियम

1. **Generated फ़ाइलों को कभी हाथ से edit न करें।**
   - `packages/eslint-plugin/src/configs/generated/vue-compat.ts` और
     `packages/eslint-plugin/docs/vue-compatibility.md` compatibility harness से आते हैं: चलाएँ
     `pnpm -C packages/eslint-plugin compat`। हाथ से लिए गए निर्णय
     `packages/eslint-plugin/tools/compat/overrides.ts` में जाते हैं।
   - `<!-- begin auto-generated … -->` markers के बीच के sections (rules tables, `vue/*` rule
     lists) `pnpm -C packages/eslint-plugin docs:gen` से आते हैं।
2. **कोई fix कभी यह नहीं बदलना चाहिए कि template क्या render करता है।** Fix guard ज़्यादातर गलतियाँ पकड़ लेता है, लेकिन
   rule के tests को साबित करना चाहिए कि उसके fixes साफ़ हैं: `packages/eslint-plugin/tests/all-rules` का all-rules harness
   हर fixture को fix करने से पहले और बाद असली `pug` से compile करता है।
3. **नया rule?** `src/rules/<name>.ts` जोड़ें (`createPugRule` उपयोग करें), उसे
   `src/rules/index.ts` में register करें, `tests/rules/<name>.test.ts` और `docs/rules/<name>.md` जोड़ें। Doc में
   कम से कम दो `Incorrect` और दो `Correct` उदाहरण चाहिए: docs tests उन्हें lint करते हैं। फिर
   `docs:gen` चलाएँ और site का page `docs/rules/<name>.md` जोड़ें (एक `<!--@include: -->` line, बाकी की तरह)।
4. **Fixtures को byte-exact रखें।** कुछ fixtures CRLF, BOM और tab input की जाँच करते हैं; `.gitattributes`
   उन्हें जैसा है वैसा रखता है। अपने editor को उन्हें सामान्य (normalize) न करने दें।
5. किसी भी व्यवहार-परिवर्तन के लिए, parser में या plugin में, **test जोड़ें**।

## Pull request खोलने से पहले

वही checks चलाएँ जो CI चलाता है:

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm -C packages/eslint-plugin compat:check   # if you touched rules, the tokenizer or the processor
pnpm -C packages/eslint-plugin docs:check     # if you touched rules or their docs
pnpm docs:build                               # if you touched the docs site
```

फिर:

- ऐसी हर चीज़ के लिए **changeset जोड़ें** जो किसी package का उपयोगकर्ता नोटिस करेगा: `pnpm changeset` चलाएँ, packages
  और bump चुनें, और changelog के लिए एक-दो line लिखें। केवल docs और आंतरिक
  बदलावों को इसकी ज़रूरत नहीं।
- **PR का शीर्षक [Conventional Commits](https://www.conventionalcommits.org/) style में रखें**:
  `fix(indent): ...`, `feat: ...`, `docs: ...`, `chore: ...`, `test: ...`। Breaking changes को
  `!` से चिह्नित करें (`feat!: ...`)।
- हर pull request में एक ही बदलाव रखें।

## Pull request खोलने के बाद क्या होता है

- यदि यह आपका पहला योगदान है, तो GitHub Actions CI run के लिए maintainer की मंज़ूरी का इंतज़ार करता है।
  यह forks से आने वाले pull requests के लिए GitHub की सुरक्षा व्यवस्था है, आपके बदलाव पर कोई राय नहीं।
- Maintainer review करके merge करता है। आपका changeset फिर अगले "Version Packages"
  pull request में दिखता है, और उसके merge होने पर release होता है ([रिलीज़ करना](#रिलीज़-करना) देखें)।

## रिलीज़ करना

Releases [changesets](https://github.com/changesets/changesets) और
[`release.yml`](../../.github/workflows/release.yml) से स्वचालित हैं:

1. pending changesets के साथ `main` पर हर push एक **Version Packages** pull
   request खोलता या अपडेट करता है, जो versions बढ़ाता है और हर package का `CHANGELOG.md` लिखता है।
2. उस pull request को merge करने पर नए versions npm पर provenance के साथ, npm
   Trusted Publishing के ज़रिए (कोई token संग्रहीत नहीं), publish हो जाते हैं, और हर package के लिए एक GitHub release बन जाता है।

Version Packages pull request workflow के अपने token से खोला जाता है, और GitHub उस token से बने events के लिए
दूसरे workflows शुरू नहीं करता, इसलिए CI उस पर अपने-आप नहीं चलता। उस पर CI checks पाने के लिए, pull request को
बंद करके फिर खोलें (या खुद उसकी branch पर एक commit push करें)।

<details>
<summary><strong>एक बार का setup (maintainers के लिए)</strong></summary>

Packages maintainer के निजी npm account से publish होते हैं। Trusted Publishing केवल उस package पर
कॉन्फ़िगर हो सकती है जो npm पर पहले से मौजूद हो, इसलिए पहला version हाथ से publish होता है:

1. GitHub पर: Settings → Actions → General → GitHub Actions को pull
   requests बनाने और approve करने की अनुमति दें (changesets को Version Packages pull request खोलने के लिए यह चाहिए)।
2. पहला Version Packages pull request merge करें। उसका publish job विफल होता है, क्योंकि अभी कोई trusted publisher
   सेट नहीं है; यह अपेक्षित है।
3. अपडेट हुए `main` पर: `npm login`, `pnpm install && pnpm build`, फिर `packages/pug-parser` और
   `packages/eslint-plugin` में `pnpm pack` (`pnpm pack` `workspace:*` को असली version से बदल देता है)। असली terminal में,
   `npm publish ./<file>.tgz --access public`, पहले parser; npm browser में 2FA माँगता है। निजी मशीन से किया गया publish npm stage करता है: जब तक आप
   npmjs.com पर staged version को approve नहीं करते, package `0.0.0-stage` placeholder दिखाता है।
4. npmjs.com पर, हर package के लिए: Settings → Trusted Publisher → GitHub Actions, repository
   `HQCuong/pug-lint`, workflow `release.yml`। फिर विफल release run खोलें और
   **Re-run failed jobs** उपयोग करें (या `main` पर कोई भी commit push करें): वह npm पर पहले से मौजूद versions छोड़ देता है और
   गायब GitHub releases बना देता है।

</details>

## सुरक्षा

कोई vulnerability मिली? issue न खोलें; [SECURITY.md](./SECURITY.md) देखें।

## License

योगदान देकर, आप सहमत होते हैं कि आपके योगदान [MIT License](../../LICENSE) के अंतर्गत licensed हैं।
