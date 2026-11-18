<template lang="pug">
div
  if user
    p Hi #{user.name}
  else
    p Guest
  each item in items
    span(v-for="y in ys") {{ y }}
  case mode
    when 'a'
      p A
    default
      p B
  - var x = 1
  p= x
  mixin card(title)
    .card= title
  +card('t')
</template>

<script setup>
const ys = []
</script>
