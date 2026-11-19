import { readdirSync } from 'node:fs'
import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

/** Where the site is served. Change it here when a custom domain is set up. */
export const SITE_URL = 'https://pug-lint.dev'
const REPO = 'https://github.com/HQCuong/pug-lint'

const ruleNames = readdirSync(new URL('../rules/', import.meta.url))
  .filter((file) => file.endsWith('.md') && file !== 'index.md')
  .map((file) => file.slice(0, -3))
  .sort()

/** Sidebar groups for the rules; the build fails if a rule page is in none of them. */
const RULE_GROUPS: [string, string[]][] = [
  ['Indentation', ['indent']],
  [
    'Attribute blocks',
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
  ['Tags and shorthands', ['implicit-div', 'prefer-shorthand', 'self-closing']],
  ['Pug features', ['no-pug-control-flow']],
]
const grouped = RULE_GROUPS.flatMap(([, names]) => names)
const ungrouped = ruleNames.filter((name) => !grouped.includes(name))
if (ungrouped.length > 0) throw new Error(`Add these rules to RULE_GROUPS in docs/.vitepress/config.ts: ${ungrouped.join(', ')}`)

export default defineConfig({
  title: 'pug-lint',
  description: 'ESLint linting and formatting for Pug templates in Vue single-file components.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  // Dev-only notes and plans that live next to the site.
  srcExclude: ['superpowers/**', 'manual-test.md', '**/node_modules/**'],
  sitemap: { hostname: SITE_URL },
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
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'pug-lint' }],
    ['meta', { property: 'og:description', content: 'ESLint linting and formatting for Pug templates in Vue SFCs.' }],
    ['meta', { property: 'og:image', content: `${SITE_URL}/og.png` }],
    ['meta', { property: 'og:image:width', content: '2400' }],
    ['meta', { property: 'og:image:height', content: '1260' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${SITE_URL}/og.png` }],
  ],
  markdown: {
    // Inline code is HTML that Vue compiles, so `{{ x }}` in it would be read as an interpolation
    // (fenced code blocks already get v-pre). Pug templates in Vue are full of `{{ }}`.
    config(md) {
      const render = md.renderer.rules.code_inline!
      md.renderer.rules.code_inline = (...args) => render(...args).replace(/^<code/, '<code v-pre')
    },
  },
  vite: {
    plugins: [llmstxt()],
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'Rules', link: '/rules/', activeMatch: '/rules/' },
      { text: 'Parser', link: '/parser/', activeMatch: '/parser/' },
      { text: 'Releases', link: `${REPO}/releases` },
    ],
    // One sidebar for the whole site, so the guide, the rules and the parser are always one click away.
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Editor setup', link: '/guide/editor-setup' },
          { text: 'Using with oxlint', link: '/guide/oxlint' },
        ],
      },
      {
        text: 'How it works',
        items: [
          { text: 'Overview', link: '/guide/how-it-works' },
          { text: 'The fix guard', link: '/guide/fix-guard' },
          { text: 'vue/* rules on Pug', link: '/guide/vue-rules' },
          { text: 'Compatibility table', link: '/guide/vue-compatibility' },
        ],
      },
      {
        text: 'Rules',
        items: [
          { text: 'Overview', link: '/rules/' },
          ...RULE_GROUPS.map(([text, names]) => ({
            text,
            collapsed: true,
            items: names.map((name) => ({ text: name, link: `/rules/${name}` })),
          })),
        ],
      },
      {
        text: 'Parser',
        items: [
          { text: 'pug-lint-parser', link: '/parser/' },
          { text: 'API', link: '/parser/api' },
          { text: 'Syntax tree', link: '/parser/syntax-tree' },
          { text: 'Errors', link: '/parser/errors' },
          { text: 'Recipes', link: '/parser/recipes' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Known limitations', link: '/guide/limitations' },
          { text: 'Unsupported Pug syntax', link: '/guide/unsupported-syntax' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          { text: 'Migrating from eslint-plugin-vue-pug', link: '/guide/migration' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: REPO }],
    editLink: {
      // Serialized to the client: it cannot use constants from this module.
      // Pages that only include a file from packages/ link to that file.
      pattern: ({ filePath }) => {
        const included: Record<string, string> = {
          'guide/vue-compatibility.md': 'packages/eslint-plugin/docs/vue-compatibility.md',
          'guide/unsupported-syntax.md': 'packages/pug-parser/docs/unsupported-syntax.md',
          'parser/index.md': 'packages/pug-parser/README.md',
        }
        const source =
          included[filePath] ??
          (filePath.startsWith('rules/') && filePath !== 'rules/index.md'
            ? `packages/eslint-plugin/docs/${filePath}`
            : `docs/${filePath}`)
        return `https://github.com/HQCuong/pug-lint/edit/main/${source}`
      },
      text: 'Edit this page on GitHub',
    },
    search: { provider: 'local' },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Not affiliated with the Pug or Vue projects.',
    },
  },
})
