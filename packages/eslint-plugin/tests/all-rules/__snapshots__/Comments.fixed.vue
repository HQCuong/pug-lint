<template lang="pug">
div
  //- a hidden comment
  // a visible comment
  //-
    a block comment
      spanning lines
  p(v-if="a") after
  //- eslint-disable-next-line vue/require-v-for-key
  li(v-for="x in xs") {{ x }}
</template>

<script setup>
const a = 1
const xs = []
</script>
