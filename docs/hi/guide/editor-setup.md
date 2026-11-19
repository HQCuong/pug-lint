---
description: "ESLint integration के साथ VS Code, WebStorm और Neovim में save करते समय Pug templates को lint और fix करें, दूसरे formatter के बिना।"
---

# Editor सेटअप

Plugin को अपने किसी editor extension की ज़रूरत नहीं है: ESLint चलाने वाला कोई भी editor integration उसे
आपके `eslint.config.js` से उठा लेता है।

## VS Code {#vs-code}

[ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) install करें,
फिर `.vscode/settings.json` में यह जोड़ें:

```json
{
  "eslint.validate": ["vue"],
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

Fix-on-save भी `eslint --fix` वाले ही [fix guard](./fix-guard) से गुज़रता है, इसलिए जो fix
template को तोड़ दे वह लागू नहीं होता।

यदि कोई दूसरा formatter भी save पर `.vue` फ़ाइलें format करता है (Prettier, Volar का formatter), तो Vue फ़ाइलों के लिए उसे
बंद कर दें, वरना वह Pug को लेकर ESLint से टकराएगा:

```json
{
  "[vue]": { "editor.formatOnSave": false }
}
```

## अन्य editors {#other-editors}

- **WebStorm / JetBrains IDEs:** Settings → Languages & Frameworks → JavaScript → Code Quality
  Tools → ESLint: *Automatic ESLint configuration* चुनें, *Run for files* में `vue` जोड़ें, और
  *Run eslint --fix on save* पर टिक करें।
- **Neovim:** ESLint language server उपयोग करें (nvim-lspconfig में `eslint`), उसके
  `filetypes` में `vue` रखें, और save पर `EslintFixAll` चलाएँ।
