// Rule docs, README and docs site: every rule has a doc whose examples lint as they claim and a site
// page that includes it, and the generated sections (rules tables, vue rule lists) are current and
// use `vue-pug/*` rule ids.
import { existsSync, readFileSync } from 'node:fs'
import type { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import plugin from '../../src/index.ts'
import { getPugTemplates } from '../../src/shared/templates.ts'
import { repoRoot, targets, updateTarget } from '../../tools/docs/rules-table.ts'
import { eslintVersions } from '../helpers/eslint-versions.ts'
import { lintText } from '../helpers/lint.ts'

const packageRoot = new URL('../../', import.meta.url)
const read = (path: string): string => readFileSync(new URL(path, packageRoot), 'utf8')
const docPath = (name: string): string => `docs/rules/${name}.md`

interface Example {
  kind: 'Incorrect' | 'Correct'
  /** Rule options from a heading like "Correct with `["always"]`"; undefined = the defaults. */
  options: unknown[] | undefined
  code: string
  /** 1-based line of the opening fence, for failure messages. */
  line: number
}

const HEADING = /^#{2,6} (Incorrect|Correct)(?: with `(.+)`)?\s*$/

/** The `.vue` code blocks of a rule doc that sit under an "Incorrect" / "Correct" heading. */
function examples(markdown: string): Example[] {
  const lines = markdown.split('\n')
  const found: Example[] = []
  let current: Pick<Example, 'kind' | 'options'> | null = null
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.startsWith('#')) {
      const match = HEADING.exec(line)
      current = match ? { kind: match[1] as Example['kind'], options: match[2] ? JSON.parse(match[2]) as unknown[] : undefined } : null
      continue
    }
    if (!line.startsWith('```')) continue
    const start = i
    let end = i + 1
    while (end < lines.length && !lines[end]!.startsWith('```')) end++
    if (line === '```vue' && current) {
      found.push({ ...current, code: `${lines.slice(start + 1, end).join('\n')}\n`, line: start + 1 })
    }
    i = end
  }
  return found
}

const ruleNames = Object.keys(plugin.rules)

describe('rule docs', () => {
  it.each(ruleNames)('%s has a doc with a matching header and default-option examples', (name) => {
    expect(existsSync(new URL(docPath(name), packageRoot)), docPath(name)).toBe(true)
    const markdown = read(docPath(name))
    const meta = plugin.rules[name]!.meta!
    expect(markdown.startsWith(`# vue-pug/${name}\n`)).toBe(true)
    // ✅ / 🔧 in the header iff the rule is recommended / fixable.
    const header = markdown.slice(0, markdown.indexOf('\n## '))
    expect(header.includes('✅'), 'recommended mark').toBe(meta.docs?.recommended === true)
    expect(header.includes('🔧'), 'fixable mark').toBe(meta.fixable !== undefined)
    const defaults = examples(markdown).filter((e) => e.options === undefined)
    expect(defaults.filter((e) => e.kind === 'Incorrect').length).toBeGreaterThanOrEqual(2)
    expect(defaults.filter((e) => e.kind === 'Correct').length).toBeGreaterThanOrEqual(2)
  })

  const cases = ruleNames.flatMap((name) => {
    const path = docPath(name)
    if (!existsSync(new URL(path, packageRoot))) return []
    return examples(read(path)).map((example) => ({ name, example, title: `${path}:${example.line} ${example.kind}` }))
  })

  it('every example is valid Pug', () => {
    expect(cases.length).toBeGreaterThan(0)
    for (const { example, title } of cases) {
      const templates = getPugTemplates(example.code)
      expect(templates.length, title).toBeGreaterThan(0)
      for (const { doc } of templates) expect(doc.errors, title).toEqual([])
    }
  })

  for (const v of eslintVersions) {
    describe(v.label, () => {
      it.each(cases)('$title', async ({ name, example }) => {
        const id = `vue-pug/${name}`
        const config: Linter.Config[] = [
          ...plugin.configs.base,
          { files: ['**/*.vue'], rules: { [id]: example.options ? ['error', ...example.options] : 'error' } },
        ]
        const { messages } = await lintText(v, example.code, config)
        expect(messages.filter((m) => m.ruleId === null), 'fatal errors').toEqual([])
        const own = messages.filter((m) => m.ruleId === id)
        if (example.kind === 'Incorrect') expect(own.length).toBeGreaterThanOrEqual(1)
        else expect(own).toEqual([])
      })
    })
  }
})

describe('generated sections', () => {
  it.each(targets.map((t) => [t.path, t] as const))('%s is current', (_, target) => {
    const text = readFileSync(new URL(target.path, repoRoot), 'utf8')
    expect(updateTarget(target, text)).toBe(text)
  })
})

describe('docs site', () => {
  it.each(ruleNames)('docs/rules/%s.md includes the rule doc', (name) => {
    const page = readFileSync(new URL(`docs/rules/${name}.md`, repoRoot), 'utf8')
    expect(page).toContain(`<!--@include: ../../packages/eslint-plugin/docs/rules/${name}.md-->`)
  })

  it('links every rule from the rules page', () => {
    const page = readFileSync(new URL('docs/rules/index.md', repoRoot), 'utf8')
    for (const name of ruleNames) expect(page).toContain(`[\`vue-pug/${name}\`](/rules/${name})`)
  })
})

describe('README', () => {
  const readme = read('README.md')

  it('lists every rule as vue-pug/<name>, with no @pug-lint/ rule ids', () => {
    for (const name of ruleNames) expect(readme).toContain(`[\`vue-pug/${name}\`]`)
    expect(readme.match(/@pug-lint\/(?!eslint-plugin\b|parser\b)[\w-]+/g)).toBeNull()
  })
})

describe('docs scripts', () => {
  const scripts = (JSON.parse(read('package.json')) as { scripts: Record<string, string> }).scripts

  // pnpm 10 resolves `pnpm docs` to its builtin (opens the package homepage), so a script of that name never runs.
  it('names the generator docs:gen, not the shadowed docs', () => {
    expect(scripts['docs:gen']).toBeDefined()
    expect(scripts['docs:check']).toBeDefined()
    expect(scripts.docs).toBeUndefined()
  })

  it('points every stale-README message and README mention at an existing script', () => {
    const mentioned = [
      ...read('tools/docs/rules-table.ts').matchAll(/pnpm run ([\w:-]+)/g),
      ...readFileSync(new URL('../../README.md', packageRoot), 'utf8').matchAll(/pnpm run (docs[\w:-]*)/g),
    ].map((m) => m[1]!)
    expect(mentioned.length).toBeGreaterThan(0)
    for (const script of mentioned) expect(scripts, script).toHaveProperty(script)
  })
})
