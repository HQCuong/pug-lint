<script setup lang="ts">
// Shown above the content of every translated page: the English page is the reference.
import { useData } from 'vitepress'
import { computed } from 'vue'
import type { ThemeConfig } from '../config'

const { theme, page } = useData<ThemeConfig>()
const show = computed(() => theme.value.strings.code !== 'en' && page.value.frontmatter.layout !== 'home')
const englishPath = computed(() =>
  `/${page.value.relativePath.replace(/^[a-z]{2}\//, '').replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')}`,
)
</script>

<template>
  <p v-if="show" class="TranslationNote">
    {{ theme.strings.ui.translationNote }} <a :href="englishPath" hreflang="en" lang="en">English</a>
  </p>
</template>

<style scoped>
.TranslationNote {
  margin: 0 0 24px;
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
.TranslationNote a {
  color: var(--vp-c-brand-1);
}
</style>
