<script setup>
import { defineProps, ref, onMounted, watch } from 'vue'
import { computed } from '@vue/runtime-core'

const emit = defineEmits(['change'])
const p = defineProps({ title: String })
const model = defineModel({ default: 1 })
defineOptions({ name: 'X' })
const { title } = p
const count = ref(0)
const el = ref()
const next = count + 1
await Promise.resolve()
onMounted(() => {})
watch(count, () => {})
export const bad = 1
</script>
<template lang="pug">
div(ref="el")
  p {{ title }} {{ next }}
  slot(name="Default")
  textarea {{ title }}
</template>
<style></style>
<style scoped>
.a {}
</style>
