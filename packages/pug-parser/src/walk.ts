import type { PugDocument, PugNode } from './ast.ts'

/**
 * Visit every node pre-order. Descends into `children` and into the tag of
 * each `TagInterpolation` (whose parent is the enclosing `Text`).
 */
export function walk(doc: PugDocument, visit: (node: PugNode, parent: PugNode | PugDocument) => void): void {
  const visitAll = (nodes: readonly PugNode[], parent: PugNode | PugDocument): void => {
    for (const node of nodes) {
      visit(node, parent)
      if (node.type === 'Text') {
        for (const part of node.parts) {
          if (part.type === 'TagInterpolation') visitAll([part.tag], node)
        }
      } else if ('children' in node) {
        visitAll(node.children, node)
      }
    }
  }
  visitAll(doc.children, doc)
}
