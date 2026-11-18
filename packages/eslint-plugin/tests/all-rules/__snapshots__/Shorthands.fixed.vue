<template lang="pug">
.card
  #main.body
    .row(v-if="ok")
      Foo
      img(src="/x.png")
      br
    .a.b
      span#x id
      span#two.one both
</template>

<script setup>
const ok = true
</script>
