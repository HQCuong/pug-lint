<template lang="pug">
div.page#root(class="a b")
  header
    h1(class='title' ,  :title="t") {{ t }}
  MyButton(
    type='button',:disabled="busy"
    @click="go" )/
  ul
    li(v-for="x in xs" , :key="x")  {{ x }}
  p.
    dot   block
    	text
  //- note
  if ok
    span= msg
</template>

<script setup>
const t = 't'
</script>
