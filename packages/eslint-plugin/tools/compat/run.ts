// The vue-rule compatibility harness. Every eslint-plugin-vue rule runs alone on each compat fixture
// (`tests/fixtures/compat/*.vue`) and on its HTML twin (the Pug template rendered by the real `pug`
// compiler). The verdicts become `src/configs/generated/vue-compat.ts` and `docs/vue-compatibility.md`.
//
//   node tools/compat/run.ts           write both files
//   node tools/compat/run.ts --check   exit 1 when either file is stale
//
// Needs `dist/tokenizer.cjs` and the parser's `dist` (the `compat` scripts build first).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { parsePug, walk } from '@pug-lint/parser'
import type { Range } from '@pug-lint/parser'
import { Linter } from 'eslint'
import type { ESLint, Rule } from 'eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import type { AST } from 'vue-eslint-parser'
import type { RuleVerdict } from '../../src/configs/generated/vue-compat.ts'
import plugin from '../../src/index.ts'
import { createProcessor } from '../../src/processor/index.ts'
import { findPugTemplateRanges } from '../../src/shared/templates.ts'
import { optionSets as defaultOptionSets } from './option-sets.ts'
import { overrides as defaultOverrides } from './overrides.ts'
import type { Override } from './overrides.ts'

export type { RuleVerdict }

// Dev-only CommonJS package without types.
const pug = createRequire(import.meta.url)('pug') as { render: (src: string, options: { doctype: string }) => string }
type Status = RuleVerdict['status']

const packageRoot = new URL('../../', import.meta.url)
const fixturesDir = new URL('tests/fixtures/compat/', packageRoot)
const compatFile = new URL('src/configs/generated/vue-compat.ts', packageRoot)
const docsFile = new URL('docs/vue-compatibility.md', packageRoot)

const vueRules = pluginVue.rules as Record<string, Rule.RuleModule>

export interface CompatFixture {
  name: string
  /** The `.vue` file with the Pug template. */
  text: string
  /** The same file with the template replaced by its `pug.render` output (`<template>` without `lang`). */
  twin: string
}

// ---------------------------------------------------------------------------------------------------
// Fixtures and HTML twins

/** Removes the common leading whitespace of the non-blank lines. */
export function dedent(text: string): string {
  const lines = text.split(/\r?\n/)
  const indents = lines.filter((l) => l.trim() !== '').map((l) => /^[ \t]*/.exec(l)![0].length)
  const cut = indents.length === 0 ? 0 : Math.min(...indents)
  return lines.map((l) => l.slice(cut)).join('\n')
}

/**
 * The Pug source without class/id shorthands (an implicit div gets its `div`), so the twin carries only
 * attribute-sourced classes, as our tokenizer does (shorthands are not exposed as attributes; C-23 b).
 */
function withoutShorthands(text: string, range: Range): string {
  const doc = parsePug(text, { start: range[0], end: range[1] })
  const edits: { range: Range; text: string }[] = []
  walk(doc, (node) => {
    if (node.type !== 'Tag' || node.shorthands.length === 0) return
    node.shorthands.forEach((s, i) => edits.push({ range: s.range, text: i === 0 && node.name === null ? 'div' : '' }))
  })
  let out = text.slice(range[0], range[1])
  for (const e of edits.sort((a, b) => b.range[0] - a.range[0])) {
    out = out.slice(0, e.range[0] - range[0]) + e.text + out.slice(e.range[1] - range[0])
  }
  return out
}

/**
 * `text` with its (single) Pug template replaced by `pug.render` HTML. The `<template>` tag keeps
 * its other attributes (`functional`); only `lang` is removed. Throws when Pug cannot compile it.
 * Class/id shorthands are removed first unless `keepShorthands` (the tokenizer parity test compares them).
 */
export function htmlTwin(text: string, { keepShorthands = false } = {}): string {
  const [range] = findPugTemplateRanges(text)
  if (!range) throw new Error('htmlTwin(): no Pug template')
  const open = text.lastIndexOf('<template', range[0])
  const close = text.indexOf('</template>', range[1]) + '</template>'.length
  const openTag = text.slice(open, range[0]).replace(/\s+lang\s*=\s*(["'])(pug|jade)\1/, '')
  const body = keepShorthands ? text.slice(range[0], range[1]) : withoutShorthands(text, range)
  const html = pug.render(dedent(body), { doctype: 'html' })
  return `${text.slice(0, open)}${openTag}\n${html}\n</template>${text.slice(close)}`
}

export function compatFixtures(): CompatFixture[] {
  return readdirSync(fixturesDir)
    .filter((f) => f.endsWith('.vue'))
    .sort()
    .map((f) => {
      const text = readFileSync(new URL(f, fixturesDir), 'utf8')
      return { name: f, text, twin: htmlTwin(text) }
    })
}

function templateBody(code: string, pugSide: boolean): AST.VElement {
  const parserOptions = pugSide
    ? { templateTokenizer: { pug: plugin.tokenizerPath }, ecmaVersion: 'latest' as const, sourceType: 'module' as const }
    : { ecmaVersion: 'latest' as const, sourceType: 'module' as const }
  const body = vueParser.parseForESLint(code, parserOptions).ast.templateBody
  if (!body) throw new Error('no templateBody')
  return body
}

/**
 * `name.class1.class2(key1 key2)` per element, pre-order: classes = the merged set of every static
 * `class` attribute; keys = the attribute keys in source order (Pug moves `class` first).
 */
function elementSkeleton(body: AST.VElement, text: string): string[] {
  const out: string[] = []
  const visit = (el: AST.VElement): void => {
    const classes = new Set<string>()
    for (const a of el.startTag.attributes) {
      if (!a.directive && a.key.name === 'class' && a.value) for (const c of a.value.value.split(/\s+/)) if (c) classes.add(c)
    }
    const keys = el.startTag.attributes.map((a) => text.slice(a.key.range[0], a.key.range[1]))
    out.push(`${[el.rawName.toLowerCase(), ...[...classes].sort()].join('.')}(${keys.join(' ')})`)
    for (const child of el.children) if (child.type === 'VElement') visit(child)
  }
  for (const child of body.children) if (child.type === 'VElement') visit(child)
  return out
}

/** Why `f`'s twin is not a faithful HTML rendering of its Pug template (empty = faithful): elements, class sets, attribute order, parse errors. */
export function twinProblems(f: CompatFixture): string[] {
  const pugBody = templateBody(f.text, true)
  const htmlBody = templateBody(f.twin, false)
  const problems: string[] = []
  const errors = (body: AST.VElement): AST.ParseError[] => (body as AST.VElement & AST.HasConcreteInfo & { errors: AST.ParseError[] }).errors
  // Same parse errors on both sides are fine (e.g. vue-eslint-parser's trailing-solidus error on `Foo/`).
  const pugErrors = errors(pugBody).map((e) => e.message).join(', ')
  const htmlErrors = errors(htmlBody).map((e) => e.message).join(', ')
  if (pugErrors !== htmlErrors) problems.push(`parse errors differ:\n  pug:  ${pugErrors}\n  twin: ${htmlErrors}`)
  const a = elementSkeleton(pugBody, f.text)
  const b = elementSkeleton(htmlBody, f.twin)
  if (a.join(' ') !== b.join(' ')) problems.push(`elements differ:\n  pug:  ${a.join(' ')}\n  twin: ${b.join(' ')}`)
  return problems
}

// ---------------------------------------------------------------------------------------------------
// Classification

const SEVERITY: Record<Status, number> = {
  ok: 0, untested: 0, mismatch: 1, 'fix-ugly': 2, 'fix-unsafe': 3, crash: 4, 'forced-keep': 0, 'forced-suppress': 0,
}

const layoutRules: Linter.RulesRecord = Object.fromEntries(
  Object.entries(plugin.rules).filter(([, r]) => r.meta?.type === 'layout').map(([name]) => [`vue-pug/${name}`, 'warn']),
)

const parserOptions = { ecmaVersion: 'latest' as const, sourceType: 'module' as const }

function pugConfig(vue: ESLint.Plugin, rules: Linter.RulesRecord, onDrop: () => void): Linter.Config[] {
  return [{
    files: ['**/*.vue'],
    plugins: { vue, 'vue-pug': plugin },
    languageOptions: {
      parser: vueParser,
      parserOptions: { ...parserOptions, templateTokenizer: { pug: plugin.tokenizerPath, jade: plugin.tokenizerPath } },
    },
    // No suppression (every vue rule is measured), guard on.
    processor: createProcessor({ suppress: new Set(), onDrop }),
    rules,
  }]
}

function htmlConfig(vue: ESLint.Plugin, rules: Linter.RulesRecord): Linter.Config[] {
  return [{
    files: ['**/*.vue'],
    plugins: { vue },
    languageOptions: { parser: vueParser, parserOptions },
    processor: pluginVue.processors.vue as Linter.Processor,
    rules,
  }]
}

const FILENAME = 'Compat.vue'

function counts(messages: Linter.LintMessage[], key: (m: Linter.LintMessage) => string): Map<string, number> {
  const out = new Map<string, number>()
  for (const m of messages) out.set(key(m), (out.get(key(m)) ?? 0) + 1)
  return out
}

/** `key ×n` for each key `a` has more of than `b`, sorted. */
function excess(a: Map<string, number>, b: Map<string, number>): string[] {
  return [...a].filter(([k, n]) => n > (b.get(k) ?? 0)).map(([k, n]) => `${k} ×${n - (b.get(k) ?? 0)}`).sort()
}

interface RunResult { status: Exclude<Status, 'untested' | 'forced-keep' | 'forced-suppress'>; reason: string; reports: number }

// Layout reports of each fixture text before any fix, by text.
const layoutBefore = new Map<string, Map<string, number>>()
const layoutKey = (m: Linter.LintMessage): string => `${m.ruleId}:${m.messageId ?? m.message}`

/** One rule, one fixture, one option set: steps (1)–(4) of the method. */
function classifyRun(rule: string, options: unknown[], f: CompatFixture, vue: ESLint.Plugin): RunResult {
  const rules: Linter.RulesRecord = { [rule]: ['error', ...options] }
  const mine = (ms: Linter.LintMessage[]): Linter.LintMessage[] => ms.filter((m) => m.ruleId === rule)
  const idKey = (m: Linter.LintMessage): string => m.messageId ?? m.message
  const linter = new Linter({ configType: 'flat' })
  // Fixes and suggestions the guard drops: when linting (1) and when fixing (3).
  let lintDrops = 0
  let fixDrops = 0

  // (1)
  let pugMessages: Linter.LintMessage[]
  try {
    pugMessages = mine(linter.verify(f.text, pugConfig(vue, rules, () => lintDrops++), FILENAME))
  } catch {
    return { status: 'crash', reason: `throws on ${f.name}`, reports: 1 }
  }
  // (2) A throw here (bad option set, rule broken on HTML) is a harness error and propagates.
  const html = mine(linter.verify(f.twin, htmlConfig(vue, rules), FILENAME))
  const reports = html.length + pugMessages.length
  let worst: RunResult = { status: 'ok', reason: '', reports }
  const raise = (status: RunResult['status'], reason: string): void => {
    if (SEVERITY[status] > SEVERITY[worst.status]) worst = { status, reason: `${f.name}: ${reason}`, reports }
  }

  const more = excess(counts(pugMessages, idKey), counts(html, idKey))
  const fewer = excess(counts(html, idKey), counts(pugMessages, idKey))
  if (more.length > 0) raise('mismatch', `more on Pug (${more.join(', ')})`)
  else if (fewer.length > 0) raise('mismatch', `fewer on Pug (${fewer.join(', ')})`)

  // A dropped suggestion counts too: editors apply suggestions.
  if (lintDrops > 0) raise('fix-unsafe', `the guard dropped ${lintDrops} fix(es) or suggestion(s)`)
  if (pugMessages.some((m) => m.fix)) {
    // (3)
    const fixed = linter.verifyAndFix(f.text, pugConfig(vue, rules, () => fixDrops++), { filename: FILENAME })
    if (fixDrops > 0) raise('fix-unsafe', `the guard dropped ${fixDrops} fix(es) while fixing`)
    if (fixed.output !== f.text) {
      // The guard checks our parser; the fixed template must also compile with the real Pug.
      try {
        htmlTwin(fixed.output)
      } catch {
        raise('fix-unsafe', 'the fixed template does not compile with pug')
      }
      // (4)
      const quiet = (): void => {}
      if (!layoutBefore.has(f.text)) {
        layoutBefore.set(f.text, counts(linter.verify(f.text, pugConfig(vue, layoutRules, quiet), FILENAME), layoutKey))
      }
      const after = counts(linter.verify(fixed.output, pugConfig(vue, layoutRules, quiet), FILENAME), layoutKey)
      const added = excess(after, layoutBefore.get(f.text)!)
      if (added.length > 0) raise('fix-ugly', `fixed output has new layout reports (${added.join(', ')})`)
      const again = linter.verifyAndFix(fixed.output, pugConfig(vue, rules, quiet), { filename: FILENAME })
      if (again.output !== fixed.output) raise('fix-ugly', 'a second fix pass changes the text')
    }
  }
  return worst
}

export interface ClassifyOptions {
  /** Extra rules (tests only), added to a copy of eslint-plugin-vue under their name without `vue/`. */
  rules?: Record<string, Rule.RuleModule>
  /** Default: every compat fixture. */
  fixtures?: CompatFixture[]
}

let cachedFixtures: CompatFixture[] | undefined

/** The harness's own verdict for `ruleName` (overrides not applied). Worst status across fixtures and option sets wins. */
export function classifyRule(ruleName: string, optionSets: unknown[][], opts: ClassifyOptions = {}): RuleVerdict {
  const vue: ESLint.Plugin = opts.rules ? { ...pluginVue, rules: { ...vueRules, ...opts.rules } } : (pluginVue as ESLint.Plugin)
  const fixtures = opts.fixtures ?? (cachedFixtures ??= compatFixtures())
  let worst: RunResult = { status: 'ok', reason: '', reports: 0 }
  let reports = 0
  for (const options of optionSets) {
    // An invalid option set throws here, on an empty file, rather than passing for a crash on Pug.
    new Linter({ configType: 'flat' }).verify('', htmlConfig(vue, { [ruleName]: ['error', ...options] }), FILENAME)
    for (const f of fixtures) {
      const run = classifyRun(ruleName, options, f, vue)
      reports += run.reports
      if (SEVERITY[run.status] > SEVERITY[worst.status]) worst = run
    }
  }
  if (worst.status === 'ok' && reports === 0) {
    return { rule: ruleName, status: 'untested', reason: 'no report on any fixture or option set' }
  }
  return { rule: ruleName, status: worst.status, reason: worst.status === 'ok' ? 'same reports as the HTML twin; fixes clean' : worst.reason }
}

/** Applies an override to a measured verdict. A measured crash always wins (the rule must stay off). */
export function applyOverride(measured: RuleVerdict, override: Override | undefined): RuleVerdict {
  if (!override) return measured
  const replacement = override.replacement === undefined ? {} : { replacement: override.replacement }
  if (measured.status === 'crash') {
    if (override.status === 'forced-keep') throw new Error(`${measured.rule}: forced-keep, but it crashes on Pug (${measured.reason})`)
    return { ...measured, ...replacement }
  }
  if (!override.reason) throw new Error(`${measured.rule}: an override needs a reason`)
  const measuredText = measured.status === 'untested' ? measured.status : `${measured.status}: ${measured.reason}`
  return { rule: measured.rule, status: override.status, reason: `${override.reason} (measured: ${measuredText})`, ...replacement }
}

// ---------------------------------------------------------------------------------------------------
// Generation

export interface Generated {
  verdicts: RuleVerdict[]
  /** Content of `src/configs/generated/vue-compat.ts`. */
  source: string
  /** Content of `docs/vue-compatibility.md`. */
  markdown: string
}

const SUPPRESSED = new Set<Status>(['mismatch', 'fix-unsafe', 'fix-ugly', 'forced-suppress'])

const quote = (s: string): string => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

function renderSource(verdicts: RuleVerdict[], version: string): string {
  const entry = (v: RuleVerdict): string =>
    `  { rule: ${quote(v.rule)}, status: ${quote(v.status)}, reason: ${quote(v.reason)}${v.replacement ? `, replacement: ${quote(v.replacement)}` : ''} },`
  const record = (vs: RuleVerdict[]): string => vs.map((v) => `  ${quote(v.rule)}: ${quote(v.reason)},`).join('\n')
  return `// GENERATED by tools/compat/run.ts (\`pnpm compat\`). Do not edit; change tools/compat/* and regenerate.

export interface RuleVerdict {
  rule: string
  status: 'ok' | 'untested' | 'crash' | 'mismatch' | 'fix-unsafe' | 'fix-ugly' | 'forced-suppress' | 'forced-keep'
  reason: string
  replacement?: string
}

/** The eslint-plugin-vue version this table was generated against. */
export const generatedAgainst: string = ${quote(version)}

/** One verdict per non-deprecated eslint-plugin-vue rule. */
export const vueCompat: RuleVerdict[] = [
${verdicts.map(entry).join('\n')}
]

/** \`vue/*\` rules whose messages are suppressed inside Pug templates, with the reason. */
export const vueSuppressed: Record<string, string> = {
${record(verdicts.filter((v) => SUPPRESSED.has(v.status)))}
}

/** \`vue/*\` rules that crash on Pug templates, with the reason; \`configs.base\` turns them off. */
export const vueCrashing: Record<string, string> = {
${record(verdicts.filter((v) => v.status === 'crash'))}
}
`
}

function renderMarkdown(verdicts: RuleVerdict[], version: string): string {
  const cell = (s: string): string => s.replace(/\|/g, '\\|')
  const byStatus = (s: Status): number => verdicts.filter((v) => v.status === s).length
  const statuses: Status[] = ['ok', 'untested', 'crash', 'mismatch', 'fix-unsafe', 'fix-ugly', 'forced-suppress', 'forced-keep']
  return `# eslint-plugin-vue compatibility

<!-- GENERATED by tools/compat/run.ts (\`pnpm compat\`). Do not edit. -->

Generated against eslint-plugin-vue ${version}. Each rule runs alone on the Pug fixtures in
\`tests/fixtures/compat\` and on their HTML twins (rendered by the \`pug\` compiler), with the option sets in
\`tools/compat/option-sets.ts\`.

- **ok**: same reports as on HTML; fixes keep the template intact and add no layout problems.
- **untested**: reported nothing on any fixture; runs normally.
- **crash**: throws on Pug; \`configs.base\` turns it off.
- **mismatch**, **fix-unsafe**, **fix-ugly**, **forced-suppress**: its messages are suppressed inside Pug
  templates (still active on HTML templates and scripts). Keep one with \`vuePug.configure({ keepVueRules })\`.
- **forced-keep**: always runs.

${statuses.map((s) => `${s}: ${byStatus(s)}`).join(' · ')}

| Rule | Status | Reason | Replacement |
|---|---|---|---|
${verdicts.map((v) => `| \`${v.rule}\` | ${v.status} | ${cell(v.reason)} | ${v.replacement ? `\`${v.replacement}\`` : ''} |`).join('\n')}
`
}

export function generate(
  overrides: Record<string, Override> = defaultOverrides,
  optionSets: Record<string, unknown[][]> = defaultOptionSets,
): Generated {
  const fixtures = compatFixtures()
  for (const f of fixtures) {
    const problems = twinProblems(f)
    if (problems.length > 0) throw new Error(`compat fixture ${f.name}: ${problems.join('; ')}`)
  }
  const names = Object.keys(vueRules).filter((n) => !vueRules[n]!.meta?.deprecated).sort().map((n) => `vue/${n}`)
  for (const rule of Object.keys(overrides)) if (!names.includes(rule)) throw new Error(`override for unknown rule ${rule}`)
  for (const rule of Object.keys(optionSets)) if (!names.includes(rule)) throw new Error(`option sets for unknown rule ${rule}`)
  const verdicts = names.map((rule) =>
    applyOverride(classifyRule(rule, [[], ...(optionSets[rule] ?? [])], { fixtures }), overrides[rule]))
  const version = (pluginVue as { meta: { version: string } }).meta.version
  return { verdicts, source: renderSource(verdicts, version), markdown: renderMarkdown(verdicts, version) }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { source, markdown } = generate()
  const files: [URL, string][] = [[compatFile, source], [docsFile, markdown]]
  if (process.argv.includes('--check')) {
    const stale = files.filter(([file, content]) => readFileSync(file, 'utf8') !== content).map(([file]) => fileURLToPath(file))
    if (stale.length > 0) {
      console.error(`stale (run \`pnpm compat\`):\n  ${stale.join('\n  ')}`)
      process.exit(1)
    }
    console.log('compat table up to date')
  } else {
    for (const [file, content] of files) writeFileSync(file, content)
    console.log(`wrote ${files.map(([file]) => fileURLToPath(file)).join(', ')}`)
  }
}
