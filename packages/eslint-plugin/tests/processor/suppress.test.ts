import type { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import { suppressMessages } from '../../src/processor/suppress.ts'
import { toCRLF, vue } from '../helpers/vue.ts'

const suppress = new Set(['vue/html-indent'])

/** A message at 1-based `line`, column 1. */
const msg = (ruleId: string, line: number, column = 1): Linter.LintMessage => ({ ruleId, message: 'm', severity: 1, line, column })

// Line 1: <template lang="pug">   lines 2–3: Pug   line 4: </template>   lines 5–7: <script>
const text = vue('div\n  p x', '<script>\nfoo\n</script>\n')

describe('suppressMessages', () => {
  for (const [label, source] of [['LF', text], ['CRLF', toCRLF(text)]] as const) {
    it(`removes a suppressed rule's message inside the Pug template (${label})`, () => {
      const inside = msg('vue/html-indent', 3, 3)
      const other = msg('vue/other', 3, 3)
      const result = suppressMessages(source, [inside, other], suppress)
      expect(result).toEqual([other])
    })

    it(`keeps the same rule's message in <script> (${label})`, () => {
      const inScript = msg('vue/html-indent', 6)
      expect(suppressMessages(source, [inScript], suppress)).toEqual([inScript])
    })
  }

  it('keeps a message on the <template lang="pug"> tag line', () => {
    const onTag = msg('vue/html-indent', 1, 2)
    expect(suppressMessages(text, [onTag], suppress)).toEqual([onTag])
  })

  it('keeps a message on the </template> line', () => {
    const onEnd = msg('vue/html-indent', 4, 1)
    expect(suppressMessages(text, [onEnd], suppress)).toEqual([onEnd])
  })

  it('keeps messages without a position', () => {
    const fileLevel: Linter.LintMessage = { ruleId: 'vue/html-indent', message: 'm', severity: 1, line: 0, column: 0 }
    expect(suppressMessages(text, [fileLevel], suppress)).toEqual([fileLevel])
  })

  it('returns the input array when there is no Pug template', () => {
    const html = '<template>\n  <div/>\n</template>\n'
    const messages = [msg('vue/html-indent', 2, 3)]
    expect(suppressMessages(html, messages, suppress)).toBe(messages)
  })
})
