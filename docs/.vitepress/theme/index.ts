import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import HowItWorks from './HowItWorks.vue'
import FixDemo from './home/FixDemo.vue'
import TranslationNote from './TranslationNote.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-before': () => h(TranslationNote) }),
  enhanceApp({ app }) {
    app.component('HowItWorks', HowItWorks)
    app.component('FixDemo', FixDemo)
  },
} satisfies Theme
