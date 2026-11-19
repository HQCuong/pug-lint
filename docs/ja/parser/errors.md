---

description: "pug-lint-parser のエラーコードと例、エラー後にパーサーが回復する方法、オフセットを行と列に変換する方法。"
---

# エラー {#errors}

`parsePug` は例外を投げません。パースできないものは `doc.errors` のエントリになり、テンプレートの残りは引き続きパースされます。

```ts
interface PugParseError {
  code: string     // one of the codes below
  message: string  // for people; may change between versions
  offset: number   // where the problem is, as an offset into text
}
```

`message` ではなく `code` で判定してください。行と列を表示するには、オフセットから数えます。

```js
const before = text.slice(0, error.offset)
const line = before.split('\n').length                    // 1-based
const column = error.offset - before.lastIndexOf('\n')    // 1-based
```

## 回復 {#recovery}

エラーが起きてもパースは止まりません。パーサーは不正な構文の終わりか行末まで読み飛ばし、次の行から続けます。エラーの後で配置できない行（子を持てない構文の下にネストされた行など）は、種類 `continuation` として `doc.lines` に残り、ノードは作られません。

```js
parsePug('div\n  p(class="a)\n  span ok\n  li(a=1 a=2)\n').errors
// [
//   { code: 'unterminated-string', message: 'Unterminated string', offset: 14 },
//   { code: 'duplicate-attribute', message: 'Duplicate attribute "a"', offset: 37 },
// ]
```

ESLint プラグインは、エラーのあるテンプレートでは、それを検証できないため、その中で fix を一切適用しません。

## コード {#codes}

| `code` | 例 | メッセージ |
|---|---|---|
| `unterminated-string` | `p(title="hi) x` | Unterminated string |
| `unclosed-attributes` | `p(title="hi"` | Attribute block is not closed with ")" |
| `unclosed-arguments` | `+card(1, 2` | Mixin arguments are not closed with ")" |
| `missing-attribute-value` | `p(title=) x` | Expected a value after the operator |
| `duplicate-attribute` | `p(a="1" a="2")` | Duplicate attribute "a" |
| `unexpected-character` | `p(a!b) x` | Expected "=" after "!" |
| `unbalanced-key` | `p([a="1") x` | Unclosed "[" in an attribute key |
| `bad-escape` | `p(a="\x")` | Invalid escape sequence in a JavaScript string |
| `inconsistent-indentation` | スペースでインデントされた行の中にタブでインデントされた行がある | Invalid indentation, you can use tabs or spaces but not both |
| `unterminated-interpolation` | `p Hi #{name` | Interpolation is not closed with "}" |
| `unsupported-syntax` | `#{tag} x` | Unsupported syntax: "#{tag} x" |

各コードは問題のグループをカバーします。`unexpected-character`、`unbalanced-key`、`inconsistent-indentation`、`unsupported-syntax` には複数のメッセージがあります。

これらは Pug コンパイラが拒否するものと一致しますが、意図的な違いが 1 つあります。`'…'` や `"…"` の属性値の中の改行は、JavaScript と同じく `unterminated-string` になります。複数行の値にはバッククォートを使ってください。

## `unsupported-syntax` {#unsupported-syntax}

このコードは、パーサーが扱わない有効な Pug を示します。たとえば補間されたタグ名（`#{tag}`）や、タグのないテキストブロックです。また、いくつかの書き方はエラーなしでパースされますが、Pug とは異なる解釈になります。どちらの一覧も[未対応の Pug 構文](/ja/guide/unsupported-syntax)にあります。
