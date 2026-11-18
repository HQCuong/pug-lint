<template lang="pug">
div.card
  div#main.body
    div.row(v-if="ok")
      Foo/
      img(src="/x.png")/
      br/
    div(class="a b")
      span(id="x") id
      span(class="one" id="two") both
</template>

<script setup>
const ok = true
</script>
