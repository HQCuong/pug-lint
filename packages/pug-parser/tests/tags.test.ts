import { describe, expect, it } from 'vitest'
import type { Comment, PugDocument, PugNode, Range, Tag } from '../src/ast.ts'
import { parsePug } from '../src/index.ts'
import { assertInvariants, at, toCRLF } from './helpers.ts'

const slice = (text: string, [s, e]: Range): string => text.slice(s, e)

function parse(src: string): PugDocument {
  const doc = parsePug(src)
  assertInvariants(doc)
  return doc
}

function asTag(node: PugNode | undefined): Tag {
  if (node?.type !== 'Tag') throw new Error(`expected a Tag, got ${node?.type}`)
  return node
}

function asComment(node: PugNode | undefined): Comment {
  if (node?.type !== 'Comment') throw new Error(`expected a Comment, got ${node?.type}`)
  return node
}

/**
 * Tree shape as a string, independent of offsets.
 * Stand-in for Task 6's `fingerprint` (not written yet) where the brief compares fingerprints.
 */
function shape(nodes: readonly PugNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === 'Tag') {
        const sh = n.shorthands.map((s) => (s.kind === 'class' ? '.' : '#') + s.value).join('')
        return `${n.name?.value ?? ''}${sh}[${shape(n.children)}]`
      }
      if (n.type === 'Comment') return n.buffered ? '//' : '//-'
      return n.type
    })
    .join(',')
}

const cases: Record<string, string> = {
  nesting: 'div\n  span\n  MyButton\np',
  shorthands: '.card#main.wide',
  names: 'el-input\nsvg:path',
  tabs: 'ul\n\tli\n\t\ta',
  comment: 'div\n  //- note\n    hidden(x)\n  p',
  buffered: '// shown',
}

describe('parsePug: tags and nesting', () => {
  it('nests tags by indentation', () => {
    const src = cases.nesting!
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    expect(doc.children).toHaveLength(2)
    const div = asTag(doc.children[0])
    const p = asTag(doc.children[1])
    expect(div.name).toEqual({ value: 'div', range: at(src, 'div') })
    expect(p.name).toEqual({ value: 'p', range: at(src, 'p', 1) })
    expect(div.children.map((c) => asTag(c).name?.value)).toEqual(['span', 'MyButton'])
    for (const tag of [div, p, ...div.children.map(asTag)]) {
      expect(slice(src, tag.name!.range)).toBe(tag.name!.value)
    }
    expect(div.range).toEqual(at(src, 'div'))
  })

  it('parses an implicit div with class and id shorthands', () => {
    const src = cases.shorthands!
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const tag = asTag(doc.children[0])
    expect(tag.name).toBeNull()
    expect(tag.shorthands).toEqual([
      { kind: 'class', value: 'card', range: at(src, '.card') },
      { kind: 'id', value: 'main', range: at(src, '#main') },
      { kind: 'class', value: 'wide', range: at(src, '.wide') },
    ])
    expect(slice(src, tag.shorthands[0]!.range)).toBe('.card')
  })

  it('accepts hyphenated and namespaced tag names', () => {
    const src = cases.names!
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    expect(doc.children.map((c) => asTag(c).name)).toEqual([
      { value: 'el-input', range: at(src, 'el-input') },
      { value: 'svg:path', range: at(src, 'svg:path') },
    ])
  })

  it('ends a tag name on a word character, leaving the expansion colon', () => {
    const src = 'li: a'
    const li = asTag(parse(src).children[0])
    expect(li.name).toEqual({ value: 'li', range: at(src, 'li') })
    expect(asTag(parse('my-comp:x').children[0]).name?.value).toBe('my-comp:x')
    expect(asTag(parse('a-').children[0]).name?.value).toBe('a')
    expect(asTag(parse('a:').children[0]).name?.value).toBe('a')
  })

  it('nests with tabs and records a tab indentUnit', () => {
    const src = cases.tabs!
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    expect(doc.indentUnit).toBe('\t')
    const ul = asTag(doc.children[0])
    const li = asTag(ul.children[0])
    const a = asTag(li.children[0])
    expect([ul, li, a].map((t) => t.name?.value)).toEqual(['ul', 'li', 'a'])
    expect(a.children).toEqual([])
    expect(doc.lines.map((l) => l.depth)).toEqual([0, 1, 2])
  })

  it('defaults indentUnit to two spaces and eol to \\n', () => {
    const doc = parse('div')
    expect(doc.indentUnit).toBe('  ')
    expect(doc.eol).toBe('\n')
    expect(parse('div\n    p').indentUnit).toBe('    ')
  })
})

describe('parsePug: comments', () => {
  it('absorbs the indented block of an unbuffered comment', () => {
    const src = cases.comment!
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const div = asTag(doc.children[0])
    expect(div.children).toHaveLength(2)
    const comment = asComment(div.children[0])
    expect(comment.buffered).toBe(false)
    expect(comment.range[0]).toBe(at(src, '//-')[0])
    expect(slice(src, comment.range).endsWith('hidden(x)')).toBe(true)
    expect(slice(src, comment.content).startsWith(' note')).toBe(true)
    expect(comment.content[0]).toBe(at(src, '//-')[1])
    expect(asTag(div.children[1]).name?.value).toBe('p')
    expect(shape(doc.children)).not.toContain('hidden')
    expect(doc.lines.map((l) => l.kind)).toEqual(['node', 'node', 'raw', 'node'])
    expect(doc.lines.map((l) => l.depth)).toEqual([0, 1, 2, 1])
  })

  it('parses a buffered comment', () => {
    const src = cases.buffered!
    const doc = parse(src)
    const comment = asComment(doc.children[0])
    expect(comment.buffered).toBe(true)
    expect(comment.range).toEqual([0, src.length])
    expect(slice(src, comment.content)).toBe(' shown')
  })

  it('ends the comment block at its last non-blank line', () => {
    const src = '// a\n  b\n\n  c\n\np'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    const comment = asComment(doc.children[0])
    expect(comment.range).toEqual([0, at(src, 'c')[1]])
    expect(asTag(doc.children[1]).name?.value).toBe('p')
    expect(doc.lines.map((l) => l.kind)).toEqual(['node', 'raw', 'blank', 'raw', 'blank', 'node'])
    expect(doc.lines.map((l) => l.anchor)).toEqual([null, null, null, 1, null, null])
  })
})

describe('parsePug: CRLF', () => {
  for (const [name, src] of Object.entries(cases)) {
    it(`parses ${name} with CRLF line endings the same way`, () => {
      const lf = parse(src)
      // A one-line case has no EOL to detect, so give it a trailing one.
      const crlfText = toCRLF(src.includes('\n') ? src : `${src}\n`)
      const crlf = parse(crlfText)
      expect(crlf.eol).toBe('\r\n')
      expect(shape(crlf.children)).toBe(shape(lf.children))
      expect(crlf.errors.map((e) => e.code)).toEqual(lf.errors.map((e) => e.code))
      const check = (nodes: readonly PugNode[]): void => {
        for (const n of nodes) {
          if (n.type !== 'Tag') continue
          const ranges = [...(n.name ? [n.name.range] : []), ...n.shorthands.map((s) => s.range)]
          for (const r of ranges) expect(slice(crlfText, r)).not.toMatch(/[\r\n]/)
          check(n.children)
        }
      }
      check(crlf.children)
    })
  }
})

describe('parsePug: options, lines, errors', () => {
  it('parses only [start, end) of a larger text', () => {
    const text = '<template lang="pug">\ndiv\n</template>'
    const doc = parsePug(text, { start: 21, end: 25 })
    assertInvariants(doc)
    expect(doc.range).toEqual([21, 25])
    expect(doc.errors).toEqual([])
    expect(doc.children).toHaveLength(1)
    const div = asTag(doc.children[0])
    expect(slice(text, div.name!.range)).toBe('div')
  })

  it('does not read a comment marker past end', () => {
    const text = 'x //- y'
    const [start, end] = at(text, '//')
    const doc = parsePug(text, { start, end })
    assertInvariants(doc)
    const comment = asComment(doc.children[0])
    expect(comment.buffered).toBe(true)
    expect(comment.content).toEqual([end, end])
  })

  it('classifies node and blank lines with their depths', () => {
    const doc = parse('div\n\n  p')
    expect(doc.lines.map((l) => l.kind)).toEqual(['node', 'blank', 'node'])
    expect(doc.lines[0]!.depth).toBe(0)
    expect(doc.lines[2]!.depth).toBe(1)
  })

  it('reports an inconsistent dedent and still attaches the node', () => {
    const src = 'div\n    a\n  b'
    const doc = parse(src)
    expect(doc.errors).toHaveLength(1)
    expect(doc.errors[0]).toMatchObject({ code: 'inconsistent-indentation', offset: at(src, 'b')[0] })
    const div = asTag(doc.children[0])
    expect(div.children.map((c) => asTag(c).name?.value)).toEqual(['a', 'b'])
  })

  it('uses the first node line as the root base indent', () => {
    const doc = parse('  div\n    p')
    expect(doc.errors).toEqual([])
    expect(doc.children).toHaveLength(1)
    expect(asTag(doc.children[0]).name?.value).toBe('div')
    expect(shape(doc.children)).toBe(shape(parse('div\n  p').children))
    expect(doc.indentUnit).toBe('  ')
  })

  it('reports a line dedented below the root base and attaches it at root', () => {
    const src = '  div\nspan'
    const doc = parse(src)
    expect(doc.errors).toHaveLength(1)
    expect(doc.errors[0]).toMatchObject({ code: 'inconsistent-indentation', offset: at(src, 'span')[0] })
    expect(doc.children.map((c) => asTag(c).name?.value)).toEqual(['div', 'span'])
  })

  it('stops a class name at "/"', () => {
    const src = '.w-1/2'
    const doc = parse(src)
    const tag = asTag(doc.children[0])
    expect(tag.shorthands).toEqual([{ kind: 'class', value: 'w-1', range: at(src, '.w-1') }])
  })

  it('accepts underscores, digits and hyphens in a class name', () => {
    const src = '.a_b-2'
    const doc = parse(src)
    expect(doc.errors).toEqual([])
    expect(asTag(doc.children[0]).shorthands).toEqual([{ kind: 'class', value: 'a_b-2', range: at(src, '.a_b-2') }])
  })

  it('records the rest of a line as unsupported-syntax without throwing', () => {
    const src = 'p(x)= hi\n  - x = 1\nspan'
    const doc = parse(src)
    expect(doc.errors.map((e) => [e.code, e.offset])).toEqual([
      ['unsupported-syntax', at(src, '= hi')[0]],
      ['unsupported-syntax', at(src, '-')[0]],
    ])
    expect(doc.children.map((c) => asTag(c).name?.value)).toEqual(['p', 'span'])
  })
})
