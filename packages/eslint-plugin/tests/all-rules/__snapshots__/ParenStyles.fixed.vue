<template lang="pug">
div
  a(
    href="/x"
    title="y"
  ) One
  a(href="/x"
    title="y") Two
  a(
    href="/x",
    title="y") Three
  a(href="/x",
    title="y"
  ) Four
  button( type="button" @click="go" ) Five
</template>

<script setup>
function go() {}
</script>
