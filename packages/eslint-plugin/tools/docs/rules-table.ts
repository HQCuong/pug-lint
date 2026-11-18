// Generates the README's rule sections from the plugin itself, between marker comments:
// the `vue-pug/*` rules table (from `plugin.rules`), the lists of `vue/*` rules that are turned
// off or suppressed inside Pug templates, and the crashing rules in Troubleshooting (both from the
// generated compat lists).
// eslint-doc-generator is not used: it derives the rule prefix from the package name
// (`@pug-lint/...` instead of `vue-pug/...`) and finds no recommended rules in our array configs.
//
//   node tools/docs/rules-table.ts           update README.md
//   node tools/docs/rules-table.ts --check   exit 1 when README.md is stale
//
// Needs the parser's `dist` (the `docs:*` scripts build first).
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Rule } from 'eslint'
import { vueCompat, vueCrashing, vueSuppressed } from '../../src/configs/generated/vue-compat.ts'
import plugin from '../../src/index.ts'

const readmeFile = new URL('../../README.md', import.meta.url)

const RULES = ['<!-- begin auto-generated rules list -->', '<!-- end auto-generated rules list -->'] as const
const VUE_RULES = ['<!-- begin auto-generated vue rule lists -->', '<!-- end auto-generated vue rule lists -->'] as const
const CRASHING = ['<!-- begin auto-generated crashing rules -->', '<!-- end auto-generated crashing rules -->'] as const

/** The `vue-pug/*` rules table. */
export function renderRulesTable(rules: Record<string, Rule.RuleModule> = plugin.rules): string {
  const rows = Object.entries(rules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, rule]) => {
      const docs = rule.meta?.docs
      const recommended = docs?.recommended === true ? '✅' : ''
      const fixable = rule.meta?.fixable ? '🔧' : ''
      return `| [\`vue-pug/${name}\`](${docs?.url ?? ''}) | ${docs?.description ?? ''} | ${recommended} | ${fixable} |`
    })
  return [
    '✅ enabled in `configs.recommended` (at `warn`). 🔧 fixable with `--fix`.',
    '',
    '| Rule | Description | ✅ | 🔧 |',
    '|---|---|---|---|',
    ...rows,
  ].join('\n')
}

/** `- \`vue/x\` (replaced by \`vue-pug/y\`)` per rule id, sorted. */
function ruleList(ids: string[]): string {
  const replacement = new Map(vueCompat.flatMap((v) => (v.replacement ? [[v.rule, v.replacement] as const] : [])))
  return ids
    .sort()
    .map((id) => {
      const by = replacement.get(id)
      return `- \`${id}\`${by ? ` (Pug replacement: \`${by}\`)` : ''}`
    })
    .join('\n')
}

/** The lists of `vue/*` rules turned off by `configs.base` and suppressed inside Pug templates. */
export function renderVueRuleLists(): string {
  return [
    'Turned off for every `.vue` file by `configs.base`, because they crash on Pug templates:',
    '',
    ruleList(Object.keys(vueCrashing)),
    '',
    'Suppressed inside Pug templates only (they keep working on HTML templates and in `<script>`):',
    '',
    ruleList(Object.keys(vueSuppressed)),
  ].join('\n')
}

/** `text` with the content between `begin` and `end` replaced by `content`. */
function replaceBetween(text: string, [begin, end]: readonly [string, string], content: string): string {
  const start = text.indexOf(begin)
  const stop = text.indexOf(end)
  if (start === -1 || stop < start) throw new Error(`README.md: missing or misordered markers ${begin} / ${end}`)
  return `${text.slice(0, start + begin.length)}\n\n${content}\n\n${text.slice(stop)}`
}

/** `readme` with every generated section brought up to date. */
export function updateReadme(readme: string): string {
  const sections: [readonly [string, string], string][] = [
    [RULES, renderRulesTable()],
    [VUE_RULES, renderVueRuleLists()],
    [CRASHING, ruleList(Object.keys(vueCrashing))],
  ]
  return sections.reduce((text, [markers, content]) => replaceBetween(text, markers, content), readme)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const current = readFileSync(readmeFile, 'utf8')
  const next = updateReadme(current)
  if (process.argv.includes('--check')) {
    if (next !== current) {
      console.error('README.md is stale: run `pnpm run docs:gen`.')
      process.exit(1)
    }
  } else if (next !== current) {
    writeFileSync(readmeFile, next)
  }
}
