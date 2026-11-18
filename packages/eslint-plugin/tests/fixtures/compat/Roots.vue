<template lang="pug">
header Title
main
  slot
  MyChild(:title="props.title" @update="count++")
footer(v-for="f in fs" :key="f") {{ f }}
</template>

<script setup>
import { ref } from 'vue'
import MyChild from './MyChild.vue'

const props = defineProps({ title: String })
const emit = defineEmits(['change'])
const count = ref(0)
const fs = ref([])
const unused = 1
</script>
