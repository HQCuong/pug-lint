// vue-pug/self-closing: the trailing `/` of a tag head. `never` (default) reports every `/`;
// `always-components` requires it on a component (a name with an uppercase letter or a hyphen)
// that has no content at all, and forbids it on every other tag.
// Pug renders `p/ x` as `<p/>x` (the inline text becomes a sibling) and rejects `/` with nested
// content, so the `/` is removed only when nothing follows it on its line and the tag has no nested
// lines other than unbuffered comments; otherwise it is reported without a fix. A component that
// already self-closes is left alone under `always-components`, whatever follows it.
import type { Tag } from '@pug-lint/parser'
import { walk } from '@pug-lint/parser'
import { createPugRule } from '../utils/create-rule.ts'

type Options = ['never' | 'always-components']

const isComponent = (tag: Tag): boolean => tag.name !== null && /[A-Z-]/.test(tag.name.value)

/** The end of the tag head: after its name, shorthands, attribute blocks and `&attributes(…)`. */
function headEnd(tag: Tag): number {
  let end = tag.name?.range[1] ?? 0
  for (const part of [...tag.shorthands, ...tag.attributeBlocks, ...tag.andAttributes]) end = Math.max(end, part.range[1])
  return end
}

/**
 * True when removing the `/` cannot change what Pug renders: nothing follows it on its line (not even
 * whitespace, which Pug renders as a text sibling) and no nested line other than an unbuffered comment.
 */
const canRemove = (tag: Tag): boolean =>
  tag.selfClose![1] === tag.range[1] && tag.children.every((child) => child.type === 'Comment' && !child.buffered)

export default createPugRule<Options>({
  name: 'self-closing',
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: { description: 'enforce or forbid the self-closing `/` of a tag', recommended: true },
    schema: [{ enum: ['never', 'always-components'] }],
    messages: {
      unexpected: 'Unexpected self-closing `/`.',
      missing: 'Expected a self-closing `/` on a component without content.',
    },
  },
  defaultOptions: ['never'],
  check(ctx) {
    const [mode] = ctx.options

    walk(ctx.doc, (node) => {
      if (node.type !== 'Tag') return
      const { selfClose } = node
      const component = mode === 'always-components' && isComponent(node)
      if (selfClose) {
        if (component || ctx.inErrorRegion(selfClose)) return
        ctx.report({
          range: selfClose,
          messageId: 'unexpected',
          ...(canRemove(node) && { fix: (fixer) => fixer.removeRange(selfClose) }),
        })
      } else if (component && node.children.length === 0) {
        // Anything after the head on its line (text, code, a dot, even whitespace) is content.
        const end = headEnd(node)
        if (end !== node.range[1] || ctx.inErrorRegion(node.range)) return
        ctx.report({
          range: node.name!.range,
          messageId: 'missing',
          fix: (fixer) => fixer.insertTextAfterRange([end, end], '/'),
        })
      }
    })
  },
})
