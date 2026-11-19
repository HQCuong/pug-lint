import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import HowItWorks from './HowItWorks.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HowItWorks', HowItWorks)
  },
} satisfies Theme
