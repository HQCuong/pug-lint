<template lang="pug">
.wrap
  img(src="/a.png"    alt="a"   width="10")
  input(v-model="name" type="text")
  p(  class="x"  )   Hello   {{ name }}
</template>

<script setup>
const name = 'n'
</script>
