<template lang="pug">
div
  MyComp(
    v-model:value.trim="c"
    :foo="a"
    :[dyn]="d"
    @click="b"
  )
  template(#default="{ item }")
    span {{ item }}
  button(:disabled='!ok' @click.prevent="go()") Go
  div(:class="{ a: true, b: false }" :style=`{ width: w + 'px' }`)
  div(
    :obj="{
      a: 1,
      b: 2
    }"
    v-html="raw"
  )
</template>

<script setup>
const a = 1
</script>
