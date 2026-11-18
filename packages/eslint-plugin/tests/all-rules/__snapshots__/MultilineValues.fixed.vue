<template lang="pug">
a(
  x
  :c=`{
 a }`
)
div
  a(
    x
    :c=`{
   a }`
    y
  ) One
  a(
    :d=`[
  1 ]`
    x
  )
</template>

<script setup>
const c = 1
</script>

<style scoped>
a   { color:  red }
</style>
