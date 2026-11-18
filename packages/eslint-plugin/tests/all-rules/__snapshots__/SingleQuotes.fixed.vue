<template lang="pug">
div(class="box" :title="label")
  a(href="/x" :class="{ on: on }") go
  span(data-x='a "b" c') quoted
  p(:style=`{ color: c }`) tpl
</template>

<script setup>
const label = 'l'
const on = true
const c = 'red'
</script>
