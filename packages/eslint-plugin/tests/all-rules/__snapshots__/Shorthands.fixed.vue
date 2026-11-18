<template lang="pug">
.card
  #main.body
    .row(v-if="ok")
      Foo
      img(src="/x.png")
      br
    div(class="a b")
      span(id="x") id
      span(id="two" class="one") both
</template>

<script setup>
const ok = true
</script>
