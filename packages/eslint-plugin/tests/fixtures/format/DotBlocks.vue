<template lang="pug">
div
  p.
    Some long text
      with   odd indentation
    and {{ value }} here.
  pre.
    keep    this
  p
    | piped text
    | more   text
</template>

<script setup>
const value = 1
</script>
