<template lang="pug">
.page#root.a.b
  header
    h1.title(:title="t") {{ t }}
  MyButton(
    type="button"
    :disabled="busy"
    @click="go"
  )
  ul
    li(v-for="x in xs" :key="x")  {{ x }}
  p.
    dot   block
    	text
  //- note
  if ok
    span= msg
</template>

<script setup>
const t = 't'
</script>
