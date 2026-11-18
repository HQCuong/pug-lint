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

  it('removes a message at the end of a one-line template (a zero-width Pug end tag sits there)', () => {
    const oneLine = '<template lang="pug">div(a="b")</template>\n'
    const atEnd = msg('vue/html-indent', 1, oneLine.indexOf('</template>') + 1)
    expect(suppressMessages(oneLine, [atEnd], suppress)).toEqual([])
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

describe('suppressMessages by fix range', () => {
  // Located in <script> (line 6), but its fix reaches into the template.
  const template = [text.indexOf('div'), text.indexOf('</template>')] as const
  const script = text.indexOf('foo')
  const withFix = (ruleId: string, range: [number, number]): Linter.LintMessage =>
    ({ ...msg(ruleId, 6), fix: { range, text: '\n' } })

  it('removes a suppressed rule whose fix range intersects the template, even inverted', () => {
    expect(suppressMessages(text, [withFix('vue/html-indent', [script, template[0] + 1])], suppress)).toEqual([])
    expect(suppressMessages(text, [withFix('vue/html-indent', [template[0] + 1, script])], suppress)).toEqual([])
  })

  it('removes a suppressed rule whose zero-width fix lies inside the template', () => {
    expect(suppressMessages(text, [withFix('vue/html-indent', [template[1], template[1]])], suppress)).toEqual([])
  })

  it('keeps a suppressed rule whose fix stays outside the template', () => {
    const outside = withFix('vue/html-indent', [script, script + 3])
    expect(suppressMessages(text, [outside], suppress)).toEqual([outside])
  })

  it('keeps other rules whose fix reaches into the template', () => {
    const other = withFix('vue/other', [script, template[0] + 1])
    expect(suppressMessages(text, [other], suppress)).toEqual([other])
  })
})

describe('suppressMessages with a BOM', () => {
  it('locates messages on the BOM-stripped text', () => {
    // Line 1, column 22 is the first content offset (just after `>`) of the BOM-stripped text.
    const firstContent = msg('vue/html-indent', 1, 22)
    const onTag = msg('vue/html-indent', 1, 21)
    expect(suppressMessages(`\uFEFF${text}`, [firstContent, onTag], suppress)).toEqual([onTag])
  })
})
