// vue-pug/implicit-div: the tag name `div` when shorthands follow. `always` (default) reports an
// explicit `div` that has a class or id shorthand and removes the name; `never` reports an implicit
// div (a tag head that starts with a shorthand) and inserts `div` before its first shorthand.
// Pug accepts an implicit div inside `#[…]` (`#[.a x]`, confirmed with pug-lexer/pug-parser), but
// under `always` a `div` inside an interpolation is reported without a fix. A `div` whose first
// shorthand does not follow the name directly (`div(a).b`) is reported without a fix too: removing
// the name would leave a head that starts with `(`.
import type { PugNode, Tag } from '@pug-lint/parser'
import { walk } from '@pug-lint/parser'
import { createPugRule } from '../utils/create-rule.ts'

type Options = ['always' | 'never']

export default createPugRule<Options>({
  name: 'implicit-div',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: { description: 'enforce or forbid the tag name `div` before class and id shorthands', recommended: true },
    schema: [{ enum: ['always', 'never'] }],
    messages: {
      unexpectedDiv: 'Omit `div` before a class or id shorthand.',
      missingDiv: 'Expected `div` before the class or id shorthand.',
    },
  },
  defaultOptions: ['always'],
  check(ctx) {
    const [mode] = ctx.options
    // Tags inside a `#[…]`, including the children of a block expansion there.
    const interpolated = new Set<PugNode>()

    const checkAlways = (tag: Tag): void => {
      const { name, shorthands } = tag
      if (name?.value !== 'div' || shorthands.length === 0 || ctx.inErrorRegion(name.range)) return
      const canFix = !interpolated.has(tag) && shorthands[0]!.range[0] === name.range[1]
      ctx.report({
        range: name.range,
        messageId: 'unexpectedDiv',
        ...(canFix && { fix: (fixer) => fixer.removeRange(name.range) }),
      })
    }

    const checkNever = (tag: Tag): void => {
      const first = tag.shorthands[0]
      if (tag.name !== null || !first || ctx.inErrorRegion(first.range)) return
      ctx.report({
        range: first.range,
        messageId: 'missingDiv',
        fix: (fixer) => fixer.insertTextBeforeRange(first.range, 'div'),
      })
    }

    walk(ctx.doc, (node, parent) => {
      if (node.type !== 'Tag') return
      if (parent.type === 'Text' || interpolated.has(parent as PugNode)) interpolated.add(node)
      if (mode === 'always') checkAlways(node)
      else checkNever(node)
    })
  },
})
