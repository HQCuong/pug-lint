import { readdirSync } from 'node:fs'
import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

/** Where the site is served. Change it here when a custom domain is set up. */
export const SITE_URL = 'https://pug-lint.hqcuong.workers.dev'
const REPO = 'https://github.com/HQCuong/pug-lint'

const ruleNames = readdirSync(new URL('../rules/', import.meta.url))
  .filter((file) => file.endsWith('.md') && file !== 'index.md')
  .map((file) => file.slice(0, -3))
  .sort()

export default defineConfig({
  title: 'pug-lint',
  description: 'ESLint linting and formatting for <template lang="pug"> in Vue single-file components.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  // Dev-only notes and plans that live next to the site.
  srcExclude: ['superpowers/**', 'manual-test.md', '**/node_modules/**'],
  sitemap: { hostname: SITE_URL },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'pug-lint' }],
    ['meta', { property: 'og:description', content: 'ESLint linting and formatting for Pug templates in Vue SFCs.' }],
  ],
  vite: {
    plugins: [llmstxt()],
  },
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'Rules', link: '/rules/', activeMatch: '/rules/' },
      { text: 'Parser', link: '/parser/', activeMatch: '/parser/' },
      { text: 'Releases', link: `${REPO}/releases` },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting started', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Editor setup', link: '/guide/editor-setup' },
          ],
        },
        {
          text: 'How it works',
          items: [
            { text: 'The fix guard', link: '/guide/fix-guard' },
            { text: 'vue/* rules on Pug', link: '/guide/vue-rules' },
            { text: 'Compatibility table', link: '/guide/vue-compatibility' },
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
      '/rules/': [
        {
          text: 'Rules',
          items: [
            { text: 'Overview', link: '/rules/' },
            ...ruleNames.map((name) => ({ text: `vue-pug/${name}`, link: `/rules/${name}` })),
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: REPO }],
    editLink: {
      // Serialized to the client: it cannot use constants from this module.
      pattern: ({ filePath }) =>
        filePath.startsWith('rules/') && filePath !== 'rules/index.md'
          ? `https://github.com/HQCuong/pug-lint/edit/main/packages/eslint-plugin/docs/${filePath}`
          : `https://github.com/HQCuong/pug-lint/edit/main/docs/${filePath}`,
      text: 'Edit this page on GitHub',
    },
    search: { provider: 'local' },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Not affiliated with the Pug or Vue projects.',
    },
  },
})
