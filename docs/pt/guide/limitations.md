---
title: Limitações conhecidas
description: "Limitações conhecidas do eslint-plugin-pug-vue: valores de atributo em várias linhas, atalhos, diferenças da AST em relação a templates HTML e o custo do fix guard."
---

# Limitações conhecidas

- **Valores de atributo em várias linhas precisam de crases.** Uma quebra de linha dentro de um
  valor `'…'` ou `"…"` é um erro de sintaxe do Pug (o próprio Pug não o compila), reportado por
  `vue/no-parsing-error`. Enquanto um template tem um erro de análise, nenhuma correção é aplicada
  dentro dele.
- **Atalhos não são atributos para as regras `vue/*`.** Os atalhos `.class` e `#id` não são
  expostos como atributos, então regras como `vue/no-restricted-class` não enxergam classes escritas
  como atalho.
- **A AST do Vue difere da de um template HTML** em alguns pontos que as regras `vue/*` podem notar:
  cada linha de texto com pipe (`| text`) é seu próprio nó de texto; texto diretamente na raiz do
  template não tem nó de texto; valores de atributo string são repassados sem tratamento, então
  aspas escapadas dentro de uma string de diretiva (`:x="f(\"a\")"`) podem gerar um falso erro de
  análise do Vue.
- **Valores de atributo sem aspas e com `${}`** (`a(href=url)`, ``a(title=`${x}`)``) são expressões
  do Pug resolvidas em tempo de compilação, não bindings do Vue. Eles chegam às regras `vue/*` como
  valores de atributo simples, e o fix guard descarta toda correção que os reescreva.
- **Um valor que começa com aspas deve ser uma única string.** `a(title="x" + y)` é Pug válido, mas
  é reportado como erro de análise (`vue/no-parsing-error`), de propósito: escreva
  `a(title=("x" + y))` ou `a(:title="'x' + y")`.
- **Quebras de linha com CR isolado.** Em um template cujas linhas terminam com um `\r` isolado
  (estilo Mac antigo), as regras `vue-pug/*` reportam problemas mas não os corrigem, e o tokenizer
  reporta um erro de análise. Converta o arquivo para LF ou CRLF.
- **Alguma sintaxe do Pug é reportada como não suportada**, ou analisada de forma diferente do Pug,
  pelo parser: veja [Sintaxe do Pug não suportada](./unsupported-syntax).
- **Custo do fix guard e conjuntos parciais de correções:** veja [O fix guard](./fix-guard#cost).
