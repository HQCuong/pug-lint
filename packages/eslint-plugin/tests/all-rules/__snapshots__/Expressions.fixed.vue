<template lang="pug">
div
  a(:title=`t${x}` href=link + '/x' data-y!=raw)
  input(:value="a ? 'b' : \"c\"" :max=10)
  p(title="it's") apostrophe
  p(title='say "hi"') say
</template>

<script setup>
const x = 1
</script>
