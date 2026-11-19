// Checks the translations of the docs site (docs/<code>/) and of the repository files (i18n/<code>/)
// against the English sources, without building the site:
//
// - every English page has a translated page, and every translated page an English one;
// - every fenced code block is byte-identical to the English one, in the same order (code, config
//   and rule examples are never translated);
// - the generated-section markers of a page are all there;
// - every heading keeps the anchor of the English one (`## Titre {#english-anchor}`), so links to
//   `page#anchor` work in every language;
// - internal links stay in the page's language (/vi/guide/…, not /guide/…);
// - the page has a description in its frontmatter;
// - theme.json has exactly the keys of the English one, and no empty string;
// - i18n/<code>/ has the four repository files, with the same code blocks as the English ones.
//
//   node docs/scripts/check-locales.mjs          every language
//   node docs/scripts/check-locales.mjs vi ja    only these
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const root = resolve(docs, '..')
const allCodes = readdirSync(join(docs, 'locales')).filter((c) => c !== 'en' && existsSync(join(docs, 'locales', c, 'theme.json')))
const codes = process.argv.length > 2 ? process.argv.slice(2) : allCodes
const REPO_FILES = ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md']
const SKIP = new Set(['.vitepress', 'locales', 'node_modules', 'public', 'scripts', 'superpowers', ...allCodes])

const problems = []
const report = (file, message) => problems.push(`${relative(root, file)}: ${message}`)

/** English pages, relative to docs/. */
function englishPages(dir = docs) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return dir === docs && SKIP.has(name) ? [] : englishPages(path)
    return name.endsWith('.md') && !(dir === docs && name === 'manual-test.md') ? [relative(docs, path)] : []
  })
}

/** `text` with every `<!--@include: path#region-->` replaced by what it includes. */
function resolveIncludes(text, file) {
  return text.replace(/<!--@include: ([^#\s]+?)(?:#([\w-]+))?-->/g, (_, target, region) => {
    const path = resolve(dirname(file), target)
    let included = readFileSync(path, 'utf8')
    if (region) {
      const start = included.indexOf(`<!-- #region ${region} -->`)
      const end = included.indexOf(`<!-- #endregion ${region} -->`)
      included = included.slice(start, end)
    }
    return resolveIncludes(included, path)
  })
}

/** The fenced code blocks of a Markdown text, fences included. */
function codeBlocks(text) {
  const blocks = []
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const open = /^(\s*)(`{3,}|~{3,})/.exec(lines[i])
    if (!open) continue
    const fence = open[2]
    let j = i + 1
    while (j < lines.length && !lines[j].trimStart().startsWith(fence)) j++
    blocks.push(lines.slice(i, j + 1).join('\n'))
    i = j
  }
  return blocks
}

// VitePress's default slugify (@mdit-vue/shared), applied to a heading's text.
function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase()
}

/** The anchor of every h2–h4 heading, in order: its `{#id}`, or the slug of its text. */
function anchors(text) {
  return [...withoutCode(text).matchAll(/^#{2,4} (.+)$/gm)].map(([, heading]) => {
    const explicit = /\{#([\w-]+)\}\s*$/.exec(heading)
    if (explicit) return explicit[1]
    // Link text instead of links; HTML tags dropped, except inside `code`, which is text.
    const plain = heading
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .split('`')
      .map((part, i) => (i % 2 === 1 ? part : part.replace(/<[^>]+>/g, '')))
      .join('')
    return slugify(plain)
  })
}

/** Headings of a translated page that have no explicit `{#id}`. */
const headingsWithoutId = (text) =>
  [...withoutCode(text).matchAll(/^#{2,4} (.+)$/gm)].map((m) => m[1]).filter((h) => !/\{#[\w-]+\}\s*$/.test(h))

const markers = (text) => text.match(/<!-- (?:begin|end) auto-generated [\w ]+ -->/g) ?? []
const withoutCode = (text) => text.replace(/^([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[ \t]*$/gm, '')

/** Internal site links in a page, outside code. */
function internalLinks(text) {
  const prose = withoutCode(text).replace(/`[^`\n]*`/g, '')
  return [...prose.matchAll(/\]\((\/[^)\s]*)\)|href="(\/[^"]*)"/g)].map((m) => m[1] ?? m[2])
}

function keysOf(value, prefix = '') {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([k, v]) => keysOf(v, prefix ? `${prefix}.${k}` : k))
}

function compareBlocks(file, translated, english) {
  const a = codeBlocks(translated)
  const b = codeBlocks(english)
  if (a.length !== b.length) {
    report(file, `has ${a.length} code blocks, the English page has ${b.length}`)
    return
  }
  a.forEach((block, i) => {
    if (block !== b[i]) report(file, `code block ${i + 1} differs from the English one:\n${block.slice(0, 200)}\n--- English ---\n${b[i].slice(0, 200)}`)
  })
}

const pages = englishPages()
const enTheme = JSON.parse(readFileSync(join(docs, 'locales', 'en', 'theme.json'), 'utf8'))

for (const code of codes) {
  // theme.json
  const themeFile = join(docs, 'locales', code, 'theme.json')
  if (!existsSync(themeFile)) {
    report(themeFile, 'missing')
  } else {
    const theme = JSON.parse(readFileSync(themeFile, 'utf8'))
    const want = keysOf(enTheme).sort().join('\n')
    const have = keysOf(theme).sort().join('\n')
    if (want !== have) report(themeFile, 'keys differ from docs/locales/en/theme.json')
    for (const key of keysOf(theme)) {
      const value = key.split('.').reduce((o, k) => o?.[k], theme)
      if (typeof value === 'string' && value.trim() === '') report(themeFile, `empty string at ${key}`)
    }
  }

  // site pages
  for (const page of pages) {
    const englishFile = join(docs, page)
    const file = join(docs, code, page)
    if (!existsSync(file)) {
      report(file, `missing (translation of docs/${page})`)
      continue
    }
    const english = resolveIncludes(readFileSync(englishFile, 'utf8'), englishFile)
    const translated = resolveIncludes(readFileSync(file, 'utf8'), file)
    compareBlocks(file, translated, english)
    const missing = markers(english).filter((m) => !translated.includes(m))
    if (missing.length > 0) report(file, `missing generated-section markers: ${missing.join(', ')}`)
    if (!/^---\n[\s\S]*?\ndescription: /.test(translated)) report(file, 'no description in the frontmatter')
    const want = anchors(english)
    const have = anchors(translated)
    if (want.join(' ') !== have.join(' ')) {
      report(file, `heading anchors differ from the English page.\n  English:    ${want.join(' ')}\n  translated: ${have.join(' ')}`)
    }
    for (const h of headingsWithoutId(translated)) report(file, `heading without {#id}: ${h}`)
    for (const link of internalLinks(readFileSync(file, 'utf8'))) {
      if (/\.(png|svg|txt|xml|ico)$/.test(link)) continue
      if (!link.startsWith(`/${code}/`)) report(file, `link ${link} leaves the language: use /${code}${link}`)
    }
  }
  const extra = existsSync(join(docs, code))
    ? englishPages(join(docs, code)).map((p) => relative(code, p)).filter((p) => !pages.includes(p))
    : []
  for (const p of extra) report(join(docs, code, p), 'has no English page')

  // repository files
  for (const name of REPO_FILES) {
    const file = join(root, 'i18n', code, name)
    if (!existsSync(file)) {
      report(file, 'missing')
      continue
    }
    compareBlocks(file, readFileSync(file, 'utf8'), readFileSync(join(root, name), 'utf8'))
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n\n'))
  console.error(`\n${problems.length} problem(s) in the translations.`)
  process.exit(1)
}
console.log(`Translations OK: ${codes.join(', ') || 'none'} (${pages.length} pages each).`)
