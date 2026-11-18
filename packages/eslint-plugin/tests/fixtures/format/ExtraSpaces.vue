<template lang="pug">
.wrap
  img(src="/a.png"    alt="a"   width="10")
  input(type = "text" v-model  =  "name")
  p(  class="x"  )   Hello   {{ name }}
</template>

<script setup>
const name = 'n'
</script>
