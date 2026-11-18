<template lang="pug">
div
  MyComp(v-bind:foo="a"   v-on:click="b" , v-model:value.trim="c" :[dyn]="d")
  template(#default="{ item }")
    span {{ item }}
  button(@click.prevent="go()" :disabled='!ok') Go
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
