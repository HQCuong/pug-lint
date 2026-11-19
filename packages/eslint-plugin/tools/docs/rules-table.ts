// Generates the rule sections of the README and the docs site from the plugin itself, between
// marker comments: the `vue-pug/*` rules table (from `plugin.rules`) in the README and on the
// site's rules page, and on the site the lists of `vue/*` rules that are turned off or suppressed
// inside Pug templates and the crashing rules in Troubleshooting (both from the generated compat
// lists).
// eslint-doc-generator is not used: it derives the rule prefix from the package name
// (`@pug-lint/...` instead of `vue-pug/...`) and finds no recommended rules in our array configs.
//
//   node tools/docs/rules-table.ts           update the files
//   node tools/docs/rules-table.ts --check   exit 1 when one is stale
//
// Needs the parser's `dist` (the `docs:*` scripts build first).
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Rule } from 'eslint'
import { vueCompat, vueCrashing, vueSuppressed } from '../../src/configs/generated/vue-compat.ts'
import plugin from '../../src/index.ts'

const RULES = ['<!-- begin auto-generated rules list -->', '<!-- end auto-generated rules list -->'] as const
const VUE_RULES = ['<!-- begin auto-generated vue rule lists -->', '<!-- end auto-generated vue rule lists -->'] as const
const CRASHING = ['<!-- begin auto-generated crashing rules -->', '<!-- end auto-generated crashing rules -->'] as const

/** The `vue-pug/*` rules table; `link` gives each rule's doc link (default: the rule's `docs.url`). */
export function renderRulesTable(
  rules: Record<string, Rule.RuleModule> = plugin.rules,
  link: (name: string, rule: Rule.RuleModule) => string = (_, rule) => rule.meta?.docs?.url ?? '',
): string {
  const rows = Object.entries(rules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, rule]) => {
      const docs = rule.meta?.docs
      const recommended = docs?.recommended === true ? '✅' : ''
      const fixable = rule.meta?.fixable ? '🔧' : ''
      return `| [\`vue-pug/${name}\`](${link(name, rule)}) | ${docs?.description ?? ''} | ${recommended} | ${fixable} |`
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
function replaceBetween(text: string, [begin, end]: readonly [string, string], content: string, file: string): string {
  const start = text.indexOf(begin)
  const stop = text.indexOf(end)
  if (start === -1 || stop < start) throw new Error(`${file}: missing or misordered markers ${begin} / ${end}`)
  return `${text.slice(0, start + begin.length)}\n\n${content}\n\n${text.slice(stop)}`
}

type Section = readonly [markers: readonly [string, string], render: () => string]

/** A file with generated sections; `path` is relative to the repository root. */
export interface Target {
  path: string
  sections: Section[]
}

export const targets: Target[] = [
  { path: 'packages/eslint-plugin/README.md', sections: [[RULES, () => renderRulesTable()]] },
  { path: 'docs/rules/index.md', sections: [[RULES, () => renderRulesTable(plugin.rules, (name) => `/rules/${name}`)]] },
  { path: 'docs/guide/vue-rules.md', sections: [[VUE_RULES, renderVueRuleLists]] },
  { path: 'docs/guide/troubleshooting.md', sections: [[CRASHING, () => ruleList(Object.keys(vueCrashing))]] },
]

export const repoRoot = new URL('../../../../', import.meta.url)

/** `text` (the content of `target`) with every generated section brought up to date. */
export function updateTarget(target: Target, text: string): string {
  return target.sections.reduce((acc, [markers, render]) => replaceBetween(acc, markers, render(), target.path), text)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const stale: string[] = []
  for (const target of targets) {
    const file = new URL(target.path, repoRoot)
    const current = readFileSync(file, 'utf8')
    const next = updateTarget(target, current)
    if (next === current) continue
    if (process.argv.includes('--check')) stale.push(target.path)
    else writeFileSync(file, next)
  }
  if (stale.length > 0) {
    console.error(`Stale generated docs (${stale.join(', ')}): run \`pnpm run docs:gen\`.`)
    process.exit(1)
  }
}
