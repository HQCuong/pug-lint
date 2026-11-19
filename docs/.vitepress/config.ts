import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { type DefaultTheme, defineConfigWithTheme, type HeadConfig, type LocaleConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'
import type enTheme from '../locales/en/theme.json'

/** Where the site is served: canonical URLs, Open Graph, JSON-LD, the sitemap and llms.txt. */
export const SITE_URL = 'https://pug-lint.dev'
const SITE_NAME = 'pug-lint'
const REPO = 'https://github.com/HQCuong/pug-lint'
const OG_IMAGE = `${SITE_URL}/og.png`

// ---------- Locales ----------
// Every language has docs/locales/<code>/theme.json (labels and UI strings). English is the root
// locale; translated pages live under docs/<code>/ and mirror the English tree, so a page's
// counterpart in another language is the same path with the prefix added or removed.
type Strings = typeof enTheme
type Locale = Strings & { code: string; prefix: string }
export type ThemeConfig = DefaultTheme.Config & { strings: Locale }

const localesDir = fileURLToPath(new URL('../locales', import.meta.url))
const LOCALES: Locale[] = readdirSync(localesDir)
  .filter((code) => existsSync(`${localesDir}/${code}/theme.json`))
  .map((code) =>
    Object.assign(JSON.parse(readFileSync(`${localesDir}/${code}/theme.json`, 'utf8')) as Strings, {
      code,
      prefix: code === 'en' ? '' : `${code}/`,
    }),
  )
  .sort((a, b) => (a.code === 'en' ? -1 : b.code === 'en' ? 1 : a.code.localeCompare(b.code)))
const EN = LOCALES[0]!

function localeOf(relativePath: string): Locale {
  return LOCALES.find((l) => l.prefix !== '' && relativePath.startsWith(l.prefix)) ?? EN
}

function counterpart(relativePath: string, target: Locale): string {
  return target.prefix + relativePath.slice(localeOf(relativePath).prefix.length)
}

/** Public URL of a source page: with `cleanUrls`, `.md` and a trailing `index` are dropped. */
function pageUrl(relativePath: string): string {
  return `${SITE_URL}/${relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')}`
}

// Read first by agents: what to install, and the facts they most often get wrong.
const LLMS_TXT_DETAILS = `pug-lint is two npm packages. eslint-plugin-pug-vue is the ESLint plugin to install: it lints and formats \`<template lang="pug">\` in Vue single-file components. pug-lint-parser is the Pug parser it is built on, usable on its own.

- Install: \`npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser eslint-plugin-pug-vue\` (ESLint 9.15+ or 10, flat config only).
- Config: \`...pluginVue.configs['flat/recommended']\`, then \`...vuePug.configs.recommended\` (import vuePug from 'eslint-plugin-pug-vue'). The order matters.
- Rule ids are \`vue-pug/<name>\`; the plugin key is always \`vue-pug\`.
- Oxlint cannot lint Vue templates: run oxlint for scripts and ESLint for templates (see Using with oxlint).
- The package also ships an AGENTS.md for coding agents: node_modules/eslint-plugin-pug-vue/AGENTS.md.`

// ---------- Rules ----------
const ruleNames = readdirSync(new URL('../rules/', import.meta.url))
  .filter((file) => file.endsWith('.md') && file !== 'index.md')
  .map((file) => file.slice(0, -3))
  .sort()

/** Sidebar groups for the rules; the build fails if a rule page is in none of them. */
const RULE_GROUPS: [keyof Strings['sidebar']['ruleGroups'], string[]][] = [
  ['indentation', ['indent']],
  [
    'attributeBlocks',
    [
      'attribute-commas',
      'attribute-equals-spacing',
      'attribute-parens-newline',
      'attribute-parens-spacing',
      'attribute-quotes',
      'max-attributes-per-line',
      'no-multi-spaces',
    ],
  ],
  ['tagsAndShorthands', ['implicit-div', 'prefer-shorthand', 'self-closing']],
  ['pugFeatures', ['no-pug-control-flow']],
]
const grouped = RULE_GROUPS.flatMap(([, names]) => names)
const ungrouped = ruleNames.filter((name) => !grouped.includes(name))
if (ungrouped.length > 0) throw new Error(`Add these rules to RULE_GROUPS in docs/.vitepress/config.ts: ${ungrouped.join(', ')}`)

// ---------- Nav and sidebar, per locale ----------
function nav(l: Locale): DefaultTheme.NavItem[] {
  const p = `/${l.prefix}`
  return [
    { text: l.nav.guide, link: `${p}guide/getting-started`, activeMatch: `${p}guide/` },
    { text: l.nav.rules, link: `${p}rules/`, activeMatch: `${p}rules/` },
    { text: l.nav.parser, link: `${p}parser/`, activeMatch: `${p}parser/` },
    { text: l.nav.releases, link: `${REPO}/releases` },
  ]
}

/** One sidebar for the whole site, so the guide, the rules and the parser are always one click away. */
function sidebar(l: Locale): DefaultTheme.SidebarItem[] {
  const s = l.sidebar
  const p = `/${l.prefix}`
  return [
    {
      text: s.introduction,
      items: [
        { text: s.gettingStarted, link: `${p}guide/getting-started` },
        { text: s.configuration, link: `${p}guide/configuration` },
        { text: s.editorSetup, link: `${p}guide/editor-setup` },
        { text: s.oxlint, link: `${p}guide/oxlint` },
      ],
    },
    {
      text: s.howItWorks,
      items: [
        { text: s.overview, link: `${p}guide/how-it-works` },
        { text: s.fixGuard, link: `${p}guide/fix-guard` },
        { text: s.vueRules, link: `${p}guide/vue-rules` },
        { text: s.compatibility, link: `${p}guide/vue-compatibility` },
      ],
    },
    {
      text: s.rules,
      items: [
        { text: s.rulesOverview, link: `${p}rules/` },
        ...RULE_GROUPS.map(([key, names]) => ({
          text: s.ruleGroups[key],
          collapsed: true,
          items: names.map((name) => ({ text: name, link: `${p}rules/${name}` })),
        })),
      ],
    },
    {
      text: s.parser,
      items: [
        { text: 'pug-lint-parser', link: `${p}parser/` },
        { text: s.api, link: `${p}parser/api` },
        { text: s.syntaxTree, link: `${p}parser/syntax-tree` },
        { text: s.errors, link: `${p}parser/errors` },
        { text: s.recipes, link: `${p}parser/recipes` },
      ],
    },
    {
      text: s.reference,
      items: [
        { text: s.limitations, link: `${p}guide/limitations` },
        { text: s.unsupportedSyntax, link: `${p}guide/unsupported-syntax` },
        { text: s.troubleshooting, link: `${p}guide/troubleshooting` },
        { text: s.migration, link: `${p}guide/migration` },
      ],
    },
  ]
}

/**
 * "Edit this page" target. Serialized to the client, so it cannot use anything from this module.
 * Pages that only include a file from packages/ link to that file; translated pages to themselves.
 */
const editLinkPattern = ({ filePath }: { filePath: string }): string => {
  const included: Record<string, string> = {
    'guide/vue-compatibility.md': 'packages/eslint-plugin/docs/vue-compatibility.md',
    'guide/unsupported-syntax.md': 'packages/pug-parser/docs/unsupported-syntax.md',
    'parser/index.md': 'packages/pug-parser/README.md',
  }
  const source =
    included[filePath] ??
    (filePath.startsWith('rules/') && filePath !== 'rules/index.md' ? `packages/eslint-plugin/docs/${filePath}` : `docs/${filePath}`)
  return `https://github.com/HQCuong/pug-lint/edit/main/${source}`
}

/** Theme config for one locale: labels, nav, sidebar, and the strings our own components read. */
function themeFor(l: Locale): ThemeConfig {
  return {
    nav: nav(l),
    sidebar: sidebar(l),
    outline: { level: [2, 3], label: l.ui.outlineLabel },
    docFooter: { prev: l.ui.prev, next: l.ui.next },
    lastUpdated: { text: l.ui.lastUpdated },
    darkModeSwitchLabel: l.ui.darkModeSwitchLabel,
    lightModeSwitchTitle: l.ui.lightModeSwitchTitle,
    darkModeSwitchTitle: l.ui.darkModeSwitchTitle,
    sidebarMenuLabel: l.ui.sidebarMenuLabel,
    returnToTopLabel: l.ui.returnToTopLabel,
    langMenuLabel: l.ui.langMenuLabel,
    notFound: { title: l.ui.notFoundTitle, quote: l.ui.notFoundQuote, linkText: l.ui.notFoundLink },
    footer: l.footer,
    editLink: { pattern: editLinkPattern, text: l.ui.editLink },
    strings: l,
  }
}

function localeConfigs(): LocaleConfig<ThemeConfig> {
  const configs: LocaleConfig<ThemeConfig> = { root: { label: EN.label, lang: EN.lang } }
  for (const l of LOCALES.slice(1)) {
    configs[l.code] = {
      label: l.label,
      lang: l.lang,
      link: `/${l.code}/`,
      description: l.siteDescription,
      themeConfig: themeFor(l),
    }
  }
  return configs
}

function searchLocales() {
  return Object.fromEntries(
    LOCALES.slice(1).map((l) => [
      l.code,
      {
        translations: {
          button: { buttonText: l.search.buttonText, buttonAriaLabel: l.search.buttonText },
          modal: {
            displayDetails: l.search.displayDetails,
            resetButtonTitle: l.search.resetButtonTitle,
            backButtonTitle: l.search.backButtonTitle,
            noResultsText: l.search.noResultsText,
            footer: { selectText: l.search.selectText, navigateText: l.search.navigateText, closeText: l.search.closeText },
          },
        },
      },
    ]),
  )
}

export default defineConfigWithTheme<ThemeConfig>({
  title: SITE_NAME,
  description: EN.siteDescription,
  lang: EN.lang,
  cleanUrls: true,
  lastUpdated: true,
  // Dev-only notes and plans, and the locale string files.
  srcExclude: ['superpowers/**', 'manual-test.md', '**/node_modules/**', 'locales/**'],
  locales: localeConfigs(),
  sitemap: {
    hostname: SITE_URL,
    // Each URL lists its translations, so search engines show the page in the reader's language.
    transformItems(items) {
      const urls = new Set(items.map((item) => item.url))
      return items.map((item) => {
        const path = item.url === '' ? 'index.md' : `${item.url.replace(/\/$/, '/index')}.md`
        const links = LOCALES.map((l) => {
          const url = counterpart(path, l).replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
          return { lang: l.hreflang, url: `${SITE_URL}/${url}`, exists: urls.has(url) }
        }).filter((l) => l.exists)
        return links.length > 1 ? { ...item, links: links.map(({ lang, url }) => ({ lang, url })) } : item
      })
    },
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=JetBrains+Mono:wght@400;600&display=swap',
      },
    ],
    ['meta', { name: 'theme-color', content: '#2b2730' }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: OG_IMAGE }],
    ['meta', { property: 'og:image:width', content: '2400' }],
    ['meta', { property: 'og:image:height', content: '1260' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE }],
  ],
  transformPageData(pageData, { siteConfig }) {
    const url = pageUrl(pageData.relativePath)
    const locale = localeOf(pageData.relativePath)
    const title = pageData.title && pageData.title !== SITE_NAME ? `${pageData.title} | ${SITE_NAME}` : SITE_NAME
    const description = pageData.description || locale.siteDescription
    const head: HeadConfig[] = [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:locale', content: locale.ogLocale }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
    ]
    // hreflang alternates: the same page in every language it exists in.
    const alternates = LOCALES.map((l) => ({ l, path: counterpart(pageData.relativePath, l) })).filter(({ path }) =>
      siteConfig.pages.includes(path),
    )
    if (alternates.length > 1) {
      for (const { l, path } of alternates) head.push(['link', { rel: 'alternate', hreflang: l.hreflang, href: pageUrl(path) }])
      head.push(['link', { rel: 'alternate', hreflang: 'x-default', href: pageUrl(counterpart(pageData.relativePath, EN)) }])
    }
    // The Markdown copy vitepress-plugin-llms writes next to each English page (parser/index.md → /parser.md).
    if (locale.code === 'en' && pageData.relativePath !== 'index.md') {
      const md = `${SITE_URL}/${pageData.relativePath.replace(/\/index\.md$/, '.md')}`
      head.push(['link', { rel: 'alternate', type: 'text/markdown', href: md }])
    }
    if (pageData.frontmatter.layout === 'home') {
      head.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'eslint-plugin-pug-vue',
          alternateName: SITE_NAME,
          description: locale.siteDescription,
          inLanguage: locale.lang,
          url: `${SITE_URL}/${locale.prefix}`,
          codeRepository: REPO,
          programmingLanguage: ['TypeScript', 'JavaScript', 'Pug', 'Vue'],
          runtimePlatform: 'Node.js',
          license: 'https://opensource.org/licenses/MIT',
          keywords: 'eslint, eslint plugin, pug, jade, vue, vue sfc, linter, formatter, eslint --fix, pug parser',
          isAccessibleForFree: true,
        }),
      ])
    }
    pageData.frontmatter.head = [...(pageData.frontmatter.head ?? []), ...head]
  },
  markdown: {
    // Inline code is HTML that Vue compiles, so `{{ x }}` in it would be read as an interpolation
    // (fenced code blocks already get v-pre). Pug templates in Vue are full of `{{ }}`.
    config(md) {
      const render = md.renderer.rules.code_inline!
      md.renderer.rules.code_inline = (...args) => render(...args).replace(/^<code/, '<code v-pre')
    },
  },
  vite: {
    plugins: [
      llmstxt({
        domain: SITE_URL,
        title: SITE_NAME,
        description: EN.siteDescription,
        details: LLMS_TXT_DETAILS,
        // No hidden "Are you an LLM?" text on the home page: every page links its Markdown copy
        // (<link rel="alternate" type="text/markdown">, added in transformPageData).
        injectLLMHint: false,
        // English only: one copy of each page is enough for agents, and the English page is authoritative.
        ignoreFiles: LOCALES.slice(1).map((l) => `${l.code}/**`),
      }),
    ],
  },
  themeConfig: {
    logo: '/logo.svg',
    ...themeFor(EN),
    socialLinks: [{ icon: 'github', link: REPO }],
    search: { provider: 'local', options: { locales: searchLocales() } },
  },
})
